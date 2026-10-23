import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_SETTINGS,
  type SurveyContent,
  type SurveyOption,
  type SurveySettings,
} from "./survey-config";

export async function fetchSurveyConfig(includeInactive = false) {
  let optionsQuery = supabase
    .from("survey_options")
    .select("id,group_key,value,label_ar,label_fr,label_en,order_index,active")
    .order("group_key")
    .order("order_index");
  if (!includeInactive) optionsQuery = optionsQuery.eq("active", true);

  const [settingsResult, contentResult, optionsResult] = await Promise.all([
    supabase.from("survey_settings").select("*").eq("id", true).maybeSingle(),
    supabase.from("survey_content").select("*").order("category").order("order_index"),
    optionsQuery,
  ]);
  if (settingsResult.error) throw settingsResult.error;
  if (contentResult.error) throw contentResult.error;
  if (optionsResult.error) throw optionsResult.error;
  return {
    settings: (settingsResult.data ?? DEFAULT_SETTINGS) as SurveySettings,
    content: (contentResult.data ?? []) as SurveyContent[],
    options: (optionsResult.data ?? []) as SurveyOption[],
  };
}

export function useSurveyConfig(includeInactive = false) {
  return useQuery({
    queryKey: ["survey-config", includeInactive ? "admin" : "public"],
    queryFn: () => fetchSurveyConfig(includeInactive),
    staleTime: 30_000,
  });
}
