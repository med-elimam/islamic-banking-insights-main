import type { CSSProperties } from "react";
import type { Language } from "./survey-translations";

export type OptionGroup =
  | "gender"
  | "age"
  | "education"
  | "bank"
  | "position"
  | "experience"
  | "training";

export type SurveyOption = {
  id: string;
  group_key: OptionGroup;
  value: string;
  label_ar: string;
  label_fr: string;
  label_en: string;
  order_index: number;
  active: boolean;
};

export type SurveyContent = {
  key: string;
  category: string;
  label: string;
  value_ar: string;
  value_fr: string;
  value_en: string;
  multiline: boolean;
  order_index: number;
};

export type SurveySettings = {
  id: boolean;
  survey_open: boolean;
  closed_message_ar: string;
  closed_message_fr: string;
  closed_message_en: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  pdf_url_ar: string;
  pdf_url_fr: string;
  pdf_url_en: string;
};

export const DEFAULT_SETTINGS: SurveySettings = {
  id: true,
  survey_open: true,
  closed_message_ar: "الاستبيان مغلق مؤقتاً. يرجى المحاولة لاحقاً.",
  closed_message_fr: "Le questionnaire est temporairement fermé. Veuillez réessayer plus tard.",
  closed_message_en: "The questionnaire is temporarily closed. Please try again later.",
  logo_url: "/logo.svg",
  primary_color: "#0f766e",
  accent_color: "#c79a3a",
  pdf_url_ar: "/questionnaires/Questionnaire_academique_AR_Maryam_Limam.pdf",
  pdf_url_fr: "/questionnaires/Questionnaire_academique_FR_Maryam_Limam.pdf",
  pdf_url_en: "/questionnaires/Questionnaire_academique_EN_Maryam_Limam.pdf",
};

export const OPTION_GROUPS: { key: OptionGroup; label: string }[] = [
  { key: "bank", label: "البنوك" },
  { key: "position", label: "الوظائف" },
  { key: "education", label: "المؤهلات العلمية" },
  { key: "age", label: "الفئات العمرية" },
  { key: "experience", label: "سنوات الخبرة" },
  { key: "gender", label: "الجنس" },
  { key: "training", label: "التكوين الإسلامي" },
];

export function localized(
  row: { value_ar?: string; value_fr?: string; value_en?: string },
  lang: Language,
) {
  return row[`value_${lang}`] ?? row.value_ar ?? "";
}

export function optionLabel(option: SurveyOption, lang: Language) {
  return option[`label_${lang}`] || option.label_ar;
}

export function contentMap(rows: SurveyContent[], lang: Language) {
  return Object.fromEntries(rows.map((row) => [row.key, localized(row, lang)]));
}

export function optionsByGroup(options: SurveyOption[], activeOnly = true) {
  const grouped = new Map<OptionGroup, SurveyOption[]>();
  for (const option of options) {
    if (activeOnly && !option.active) continue;
    const list = grouped.get(option.group_key) ?? [];
    list.push(option);
    grouped.set(option.group_key, list);
  }
  for (const list of grouped.values()) list.sort((a, b) => a.order_index - b.order_index);
  return grouped;
}

export function surveyTheme(settings: SurveySettings): CSSProperties {
  return {
    "--color-primary": settings.primary_color,
    "--color-gold": settings.accent_color,
  } as CSSProperties;
}

export function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
