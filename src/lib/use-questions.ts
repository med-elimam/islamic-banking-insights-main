import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Language } from "./survey-translations";

export type DbQuestion = {
  id: string;
  number: number;
  axis_id: string;
  axis_name: string;
  text: string;
  text_fr: string;
  text_en: string;
  order_index: number;
  active: boolean;
};

export type DbAxis = {
  id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  order_index: number;
  active: boolean;
};

export type DynamicQuestion = DbQuestion & { display_text: string };
export type DynamicAxis = DbAxis & { name: string; questions: DynamicQuestion[] };

export async function fetchQuestionnaire(activeOnly = false) {
  let questionsQuery = supabase.from("survey_questions").select("*").order("order_index");
  let axesQuery = supabase.from("survey_axes").select("*").order("order_index");
  if (activeOnly) {
    questionsQuery = questionsQuery.eq("active", true);
    axesQuery = axesQuery.eq("active", true);
  }
  const [questionsResult, axesResult] = await Promise.all([questionsQuery, axesQuery]);
  if (questionsResult.error) throw questionsResult.error;
  if (axesResult.error) throw axesResult.error;
  return {
    questions: (questionsResult.data ?? []) as DbQuestion[],
    axes: (axesResult.data ?? []) as DbAxis[],
  };
}

export function buildAxes(questions: DbQuestion[], axes: DbAxis[], lang: Language): DynamicAxis[] {
  return [...axes]
    .sort((a, b) => a.order_index - b.order_index)
    .map((axis) => ({
      ...axis,
      name: axis[`name_${lang}`] || axis.name_ar,
      questions: questions
        .filter((question) => question.axis_id === axis.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map((question) => ({
          ...question,
          display_text:
            lang === "fr"
              ? question.text_fr || question.text
              : lang === "en"
                ? question.text_en || question.text
                : question.text,
        })),
    }));
}

export function useQuestions(opts: { activeOnly?: boolean; lang?: Language } = {}) {
  const activeOnly = opts.activeOnly ?? false;
  const lang = opts.lang ?? "ar";
  const query = useQuery({
    queryKey: ["survey-questionnaire", activeOnly ? "active" : "all"],
    queryFn: () => fetchQuestionnaire(activeOnly),
  });
  const questions = query.data?.questions ?? [];
  const dbAxes = query.data?.axes ?? [];
  const axes = buildAxes(questions, dbAxes, lang).filter(
    (axis) => !activeOnly || axis.questions.length > 0,
  );
  return {
    ...query,
    questions,
    dbAxes,
    axes,
    allQuestions: axes.flatMap((axis) =>
      axis.questions.map((question) => ({
        number: question.number,
        text: question.text,
        axis_id: axis.id,
        axis_name: axis.name_ar,
      })),
    ),
  };
}
