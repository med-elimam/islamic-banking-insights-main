import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DbQuestion = {
  id: string;
  number: number;
  axis_id: string;
  axis_name: string;
  text: string;
  order_index: number;
  active: boolean;
};

export type DynamicAxis = {
  id: string;
  name: string;
  questions: { number: number; text: string }[];
};

export async function fetchQuestions(opts: { activeOnly?: boolean } = {}): Promise<DbQuestion[]> {
  // survey_questions is not in the generated types yet; cast through unknown for type safety
  let q = (supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> })
    .from("survey_questions")
    .select("*")
    .order("axis_id", { ascending: true })
    .order("order_index", { ascending: true });
  if (opts.activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DbQuestion[];
}

export function buildAxes(questions: DbQuestion[]): DynamicAxis[] {
  const map = new Map<string, DynamicAxis>();
  const sorted = [...questions].sort(
    (a, b) => a.axis_id.localeCompare(b.axis_id) || a.order_index - b.order_index,
  );
  for (const q of sorted) {
    if (!map.has(q.axis_id))
      map.set(q.axis_id, { id: q.axis_id, name: q.axis_name, questions: [] });
    map.get(q.axis_id)!.questions.push({ number: q.number, text: q.text });
  }
  return Array.from(map.values());
}

export function useQuestions(opts: { activeOnly?: boolean } = {}) {
  const query = useQuery({
    queryKey: ["survey_questions", opts.activeOnly ? "active" : "all"],
    queryFn: () => fetchQuestions(opts),
  });
  const all = query.data ?? [];
  return {
    ...query,
    questions: all,
    axes: buildAxes(all),
    allQuestions: all.map((q) => ({
      number: q.number,
      text: q.text,
      axis_id: q.axis_id,
      axis_name: q.axis_name,
    })),
  };
}
