import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AGES,
  BANKS,
  EDUCATION,
  EXPERIENCE,
  GENDERS,
  LIKERT,
  POSITIONS,
  TRAINING,
} from "@/lib/survey-data";
import { useQuestions, type DynamicAxis } from "@/lib/use-questions";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Send, Loader2 } from "lucide-react";
import {
  UI_TRANSLATIONS,
  OPTION_MAPS,
  QUESTION_TRANSLATIONS,
  AXIS_TRANSLATIONS,
  type Language,
} from "@/lib/survey-translations";

export const Route = createFileRoute("/survey")({
  head: () => ({
    meta: [
      { title: "استبيان أكاديمي — تحول البنوك التقليدية إلى مصارف إسلامية" },
      {
        name: "description",
        content: "أجب عن أسئلة الاستبيان الأكاديمي حول الصيرفة الإسلامية في موريتانيا.",
      },
    ],
  }),
  component: SurveyPage,
});

type Demo = {
  gender: string;
  age: string;
  education: string;
  bank: string;
  position: string;
  experience: string;
  training: string;
};

function SurveyPage() {
  const navigate = useNavigate();
  const { axes, isLoading, isError } = useQuestions({ activeOnly: true });
  const totalSteps = axes.length + 2; // axes + open question + demographics
  const openStep = axes.length;
  const demographicsStep = totalSteps - 1;
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [demo, setDemo] = useState<Demo>({
    gender: "",
    age: "",
    education: "",
    bank: "",
    position: "",
    experience: "",
    training: "",
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [openAnswer, setOpenAnswer] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [startTime] = useState(() => Date.now());
  const submissionIdRef = useRef<string | null>(null);
  const [lang, setLang] = useState<Language>("ar");

  // Keep the server and the first client render identical, then restore the
  // visitor's preferred language after hydration.
  useEffect(() => {
    const saved = localStorage.getItem("survey_lang");
    if (saved === "ar" || saved === "fr" || saved === "en") setLang(saved);
  }, []);

  const progress = useMemo(() => ((step + 1) / totalSteps) * 100, [step, totalSteps]);

  const DEMO_LABELS = UI_TRANSLATIONS[lang].demoLabels;

  function validateStep(): string | null {
    if (step === demographicsStep) {
      const missing = (Object.keys(demo) as (keyof Demo)[]).filter((k) => !demo[k]);
      if (missing.length) {
        return `${UI_TRANSLATIONS[lang].missingFields}${missing.map((k) => DEMO_LABELS[k]).join("، ")}.`;
      }
      return null;
    }
    const axisIdx = step;
    if (axisIdx < axes.length) {
      const axis = axes[axisIdx];
      const missing: number[] = [];
      axis.questions.forEach((q, idx) => {
        if (!answers[q.number]) missing.push(idx + 1);
      });
      if (missing.length) {
        if (lang === "ar") {
          return `لا يمكن المتابعة — لم تتم الإجابة عن العبارات رقم: ${missing.join("، ")} في هذا المحور.`;
        } else if (lang === "fr") {
          return `Impossible de continuer — réponses manquantes pour les questions numéro : ${missing.join(", ")} dans cet axe.`;
        } else {
          return `Cannot continue — missing answers for questions number: ${missing.join(", ")} in this axis.`;
        }
      }
    }
    return null;
  }

  // For the final submit: scan the whole survey and list everything missing
  function findAllMissing(): string[] {
    const issues: string[] = [];
    const demoMissing = (Object.keys(demo) as (keyof Demo)[]).filter((k) => !demo[k]);
    if (demoMissing.length) {
      const fieldTitle =
        lang === "ar"
          ? "البيانات العامة"
          : lang === "fr"
            ? "Informations Générales"
            : "General Information";
      issues.push(`${fieldTitle}: ${demoMissing.map((k) => DEMO_LABELS[k]).join("، ")}`);
    }
    for (const axis of axes) {
      const missing: number[] = [];
      axis.questions.forEach((q, idx) => {
        if (!answers[q.number]) missing.push(idx + 1);
      });
      if (missing.length) {
        const axisName =
          lang !== "ar" ? AXIS_TRANSLATIONS[axis.id]?.[lang] || axis.name : axis.name;
        const qWord = lang === "ar" ? "العبارات" : lang === "fr" ? "questions" : "questions";
        issues.push(`${axisName} — ${qWord}: ${missing.join("، ")}`);
      }
    }
    return issues;
  }

  function goNext() {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const allMissing = findAllMissing();
    if (allMissing.length) {
      toast.error(UI_TRANSLATIONS[lang].missingFields + allMissing.join("\n• "), {
        duration: 8000,
      });
      return;
    }
    if (typeof window !== "undefined" && localStorage.getItem("survey_submitted") === "1") {
      toast.error(UI_TRANSLATIONS[lang].alreadySubmitted);
      return;
    }

    // Honeypot spam protection
    if (honeypot.trim()) {
      if (typeof window !== "undefined") localStorage.setItem("survey_submitted", "1");
      navigate({ to: "/thanks" });
      return;
    }

    // Delay guard: warn user if submitting under 2 seconds (to block fast automated bots)
    const timeElapsed = Date.now() - startTime;
    if (timeElapsed < 2000) {
      toast.error(UI_TRANSLATIONS[lang].waitDelay);
      return;
    }

    // Map demographics back to Arabic to comply with database constraints and keep analysis consistent
    const cleanGender = (
      OPTION_MAPS.gender.db[demo.gender as keyof typeof OPTION_MAPS.gender.db] || demo.gender
    ).trim();
    const cleanAge = (
      OPTION_MAPS.age.db[demo.age as keyof typeof OPTION_MAPS.age.db] || demo.age
    ).trim();
    const cleanEducation = (
      OPTION_MAPS.education.db[demo.education as keyof typeof OPTION_MAPS.education.db] ||
      demo.education
    ).trim();
    const cleanBank = (
      OPTION_MAPS.bank.db[demo.bank as keyof typeof OPTION_MAPS.bank.db] || demo.bank
    ).trim();
    const cleanPosition = (
      OPTION_MAPS.position.db[demo.position as keyof typeof OPTION_MAPS.position.db] ||
      demo.position
    ).trim();
    const cleanExperience = (
      OPTION_MAPS.experience.db[demo.experience as keyof typeof OPTION_MAPS.experience.db] ||
      demo.experience
    ).trim();
    const cleanTraining = (
      OPTION_MAPS.training.db[demo.training as keyof typeof OPTION_MAPS.training.db] ||
      demo.training
    ).trim();
    const cleanOpen = openAnswer.trim();

    if (
      !(GENDERS as readonly string[]).includes(cleanGender) ||
      !(AGES as readonly string[]).includes(cleanAge) ||
      !(EDUCATION as readonly string[]).includes(cleanEducation) ||
      !(BANKS as readonly string[]).includes(cleanBank) ||
      !(POSITIONS as readonly string[]).includes(cleanPosition) ||
      !(EXPERIENCE as readonly string[]).includes(cleanExperience) ||
      !(TRAINING as readonly string[]).includes(cleanTraining) ||
      cleanOpen.length > 4000
    ) {
      toast.error(UI_TRANSLATIONS[lang].invalidData);
      return;
    }

    // Validate answers values and question numbers
    const activeQNums = new Set(axes.flatMap((a) => a.questions.map((q) => q.number)));
    for (const qNum of activeQNums) {
      const val = answers[qNum];
      if (val === undefined || val < 1 || val > 3 || !Number.isInteger(val)) {
        toast.error(UI_TRANSLATIONS[lang].invalidAnswers);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Generate client-side UUID (fallback if crypto.randomUUID is absent)
      if (!submissionIdRef.current) {
        submissionIdRef.current =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              });
      }

      // Submit the response and all answers in one database transaction. If any
      // answer fails validation, PostgreSQL rolls the entire submission back.
      const rows = axes.flatMap((axis) =>
        axis.questions.map((q) => ({
          question_number: q.number,
          answer_value: answers[q.number],
        })),
      );
      const { error: submitError } = await supabase.rpc("submit_survey_response", {
        p_response_id: submissionIdRef.current,
        p_gender: cleanGender,
        p_age: cleanAge,
        p_education: cleanEducation,
        p_bank: cleanBank,
        p_position: cleanPosition,
        p_experience: cleanExperience,
        p_islamic_training: cleanTraining,
        p_open_answer: cleanOpen || null,
        p_language: lang,
        p_answers: rows,
      });
      if (submitError) throw submitError;

      if (typeof window !== "undefined") localStorage.setItem("survey_submitted", "1");
      navigate({ to: "/thanks" });
    } catch (e) {
      console.error("[Survey Submission Error]", e instanceof Error ? e.message : e);
      toast.error(UI_TRANSLATIONS[lang].submitError);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-hero">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (isError || axes.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-hero px-6 text-center">
        <p className="text-sm text-muted-foreground">
          {lang === "ar"
            ? "تعذر تحميل الأسئلة حالياً. حاول لاحقاً."
            : lang === "fr"
              ? "Impossible de charger les questions pour le moment. Veuillez réessayer plus tard."
              : "Unable to load questions at this time. Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-hero pb-16 ${lang === "ar" ? "font-arabic" : "font-times"}`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5 w-full flex-wrap gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-lg font-bold text-foreground"
        >
          <img src="/logo.svg" alt="MD Logo" className="h-8 w-8 object-contain" />
          <span>
            {lang === "ar"
              ? "استبيان أكاديمي"
              : lang === "fr"
                ? "Sondage Académique"
                : "Academic Survey"}
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground hover:text-primary transition border border-border/80 rounded-full px-2.5 py-1 bg-background/50 shrink-0"
          >
            {lang === "ar" ? (
              <>
                <ArrowRight className="h-3 w-3 ml-0.5" />
                العودة للرئيسية
              </>
            ) : (
              <>
                <ArrowLeft className="h-3 w-3 mr-0.5" />
                {lang === "fr" ? "Retour à l’accueil" : "Back to Home"}
              </>
            )}
          </Link>
          <span className="text-sm text-muted-foreground font-medium shrink-0">
            {UI_TRANSLATIONS[lang].stepOf(step + 1, totalSteps)}
          </span>
          <div className="flex rounded-full border border-border bg-background/70 p-0.5">
            {(["ar", "fr", "en"] as const).map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => {
                  setLang(language);
                  if (typeof window !== "undefined") localStorage.setItem("survey_lang", language);
                }}
                className={`rounded-full px-2 py-1 text-[10px] font-semibold transition ${
                  lang === language ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6">
        <Progress value={progress} className="h-2" />
      </div>

      <main className="mx-auto mt-8 max-w-4xl px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {step < axes.length && (
            <AxisStep axis={axes[step]} answers={answers} setAnswers={setAnswers} lang={lang} />
          )}

          {step === openStep && (
            <OpenStep value={openAnswer} setValue={setOpenAnswer} lang={lang} />
          )}

          {step === demographicsStep && (
            <DemographicsStep
              demo={demo}
              setDemo={setDemo}
              honeypot={honeypot}
              setHoneypot={setHoneypot}
              lang={lang}
              setLang={setLang}
            />
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <Button variant="outline" onClick={goPrev} disabled={step === 0 || submitting}>
              {lang === "ar" ? (
                <>
                  <ArrowRight className="ml-2 h-4 w-4" />
                  {UI_TRANSLATIONS[lang].previous}
                </>
              ) : (
                <>
                  {UI_TRANSLATIONS[lang].previous}
                  <ArrowLeft className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {step < totalSteps - 1 ? (
              <Button onClick={goNext} className="bg-primary text-primary-foreground">
                {lang === "ar" ? (
                  <>
                    {UI_TRANSLATIONS[lang].next}
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    {UI_TRANSLATIONS[lang].next}
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={submitting}
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    {UI_TRANSLATIONS[lang].submitting}
                  </>
                ) : (
                  <>
                    <Send className="ml-2 h-4 w-4" />
                    {UI_TRANSLATIONS[lang].submit}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
      <footer
        className="border-t border-border/40 bg-card/40 py-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5 mt-auto px-4 w-full"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="leading-relaxed max-w-full text-center">
          {lang === "ar"
            ? "© 2026 — استبيان أكاديمي. جميع الحقوق محفوظة لأغراض البحث العلمي."
            : lang === "fr"
              ? "© 2026 — Questionnaire académique. Tous droits réservés à des fins de recherche scientifique."
              : "© 2026 — Academic Survey. All rights reserved for scientific research purposes."}
        </div>
        <div className="text-[10px] opacity-75 font-mono text-center">
          {lang === "ar"
            ? "تطوير: محمد الإمام"
            : lang === "fr"
              ? "Développé par Mohamed el imam"
              : "Developed by Mohamed el imam"}
        </div>
      </footer>
    </div>
  );
}

function Field({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="mb-3 block text-base font-semibold text-foreground">{label}</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const id = `${label}-${opt}`;
          const active = value === opt;
          return (
            <label
              key={opt}
              htmlFor={id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                active
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <input
                id={id}
                type="radio"
                className="h-4 w-4 accent-[var(--color-primary)]"
                checked={active}
                onChange={() => onChange(opt)}
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DemographicsStep({
  demo,
  setDemo,
  honeypot,
  setHoneypot,
  lang,
  setLang,
}: {
  demo: Demo;
  setDemo: (d: Demo) => void;
  honeypot: string;
  setHoneypot: (v: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
}) {
  const t = UI_TRANSLATIONS[lang];
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl text-foreground">{t.demographicsTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.demographicsDesc}</p>
      </header>

      {/* Language Selector */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <label className="mb-2 block text-xs font-semibold text-muted-foreground">
          {t.selectLanguage}
        </label>
        <div className="flex gap-2">
          {(["ar", "fr", "en"] as const).map((l) => {
            const labels = { ar: "العربية", fr: "Français", en: "English" };
            const active = lang === l;
            return (
              <Button
                key={l}
                type="button"
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setLang(l);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("survey_lang", l);
                  }
                  // Reset demo fields since array options will change language
                  setDemo({
                    gender: "",
                    age: "",
                    education: "",
                    bank: "",
                    position: "",
                    experience: "",
                    training: "",
                  });
                }}
                className={
                  active
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground font-medium"
                }
              >
                {labels[l]}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Honeypot field (hidden from real users but catches simple script bots) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">{t.websiteLabel}</label>
        <input
          id="website"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <Field
        label={t.demoLabels.gender}
        options={OPTION_MAPS.gender[lang]}
        value={demo.gender}
        onChange={(v) => setDemo({ ...demo, gender: v })}
      />
      <Field
        label={t.demoLabels.age}
        options={OPTION_MAPS.age[lang]}
        value={demo.age}
        onChange={(v) => setDemo({ ...demo, age: v })}
      />
      <Field
        label={t.demoLabels.education}
        options={OPTION_MAPS.education[lang]}
        value={demo.education}
        onChange={(v) => setDemo({ ...demo, education: v })}
      />
      <Field
        label={t.demoLabels.position}
        options={OPTION_MAPS.position[lang]}
        value={demo.position}
        onChange={(v) => setDemo({ ...demo, position: v })}
      />
      <Field
        label={t.demoLabels.experience}
        options={OPTION_MAPS.experience[lang]}
        value={demo.experience}
        onChange={(v) => setDemo({ ...demo, experience: v })}
      />
      <Field
        label={t.demoLabels.bank}
        options={OPTION_MAPS.bank[lang]}
        value={demo.bank}
        onChange={(v) => setDemo({ ...demo, bank: v })}
      />
      <Field
        label={t.demoLabels.training}
        options={OPTION_MAPS.training[lang]}
        value={demo.training}
        onChange={(v) => setDemo({ ...demo, training: v })}
      />
    </div>
  );
}

function AxisStep({
  axis,
  answers,
  setAnswers,
  lang,
}: {
  axis: DynamicAxis;
  answers: Record<number, number>;
  setAnswers: (a: Record<number, number>) => void;
  lang: Language;
}) {
  const axisName = lang !== "ar" ? AXIS_TRANSLATIONS[axis.id]?.[lang] || axis.name : axis.name;
  const likertHelp =
    lang === "ar"
      ? "ضع علامة واحدة أمام الخيار الذي يعكس رأيك في كل عبارة: أوافق، محايد، أو لا أوافق."
      : lang === "fr"
        ? "Cochez une seule réponse pour chaque affirmation : D'accord, Neutre ou Pas d'accord."
        : "Select one response for each statement: Agree, Neutral, or Disagree.";

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl text-foreground">{axisName}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{likertHelp}</p>
      </header>

      <div className="space-y-5">
        {axis.questions.map((q) => {
          const questionText =
            lang !== "ar" ? QUESTION_TRANSLATIONS[q.number]?.[lang] || q.text : q.text;
          return (
            <div key={q.number} className="rounded-xl border border-border bg-background p-4">
              <p className="mb-3 text-sm font-medium leading-relaxed text-foreground">
                <span
                  className={`${lang === "ar" ? "ml-2" : "mr-2"} inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary`}
                >
                  {q.number}
                </span>
                {questionText}
              </p>
              <RadioGroup
                value={answers[q.number]?.toString() ?? ""}
                onValueChange={(v) => setAnswers({ ...answers, [q.number]: Number(v) })}
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {LIKERT.map((l) => {
                  const active = answers[q.number] === l.value;
                  const labelText = UI_TRANSLATIONS[lang].likert[l.value as 1 | 2 | 3];
                  return (
                    <Label
                      key={l.value}
                      htmlFor={`q${q.number}-${l.value}`}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-2 text-xs transition ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <RadioGroupItem id={`q${q.number}-${l.value}`} value={l.value.toString()} />
                      <span>{labelText}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpenStep({
  value,
  setValue,
  lang,
}: {
  value: string;
  setValue: (v: string) => void;
  lang: Language;
}) {
  const t = UI_TRANSLATIONS[lang];
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-foreground">{t.openTitle}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{t.openLabel}</p>
      <Textarea
        value={value}
        maxLength={4000}
        onChange={(e) => setValue(e.target.value)}
        rows={8}
        placeholder={t.openPlaceholder}
        className="resize-y"
      />
      <p className="text-xs text-muted-foreground">{value.length} / 4000</p>
    </div>
  );
}
