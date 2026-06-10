import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AGES, BANKS, EDUCATION, EXPERIENCE, GENDERS, LIKERT, POSITIONS } from "@/lib/survey-data";
import { useQuestions, type DynamicAxis } from "@/lib/use-questions";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Send, Loader2 } from "lucide-react";

export const Route = createFileRoute("/survey")({
  head: () => ({
    meta: [
      { title: "الاستبيان — تحول البنوك التقليدية إلى بنوك إسلامية" },
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
};

function SurveyPage() {
  const navigate = useNavigate();
  const { axes, isLoading, isError } = useQuestions({ activeOnly: true });
  const totalSteps = 1 + axes.length + 1; // demo + axes + open
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [demo, setDemo] = useState<Demo>({
    gender: "",
    age: "",
    education: "",
    bank: "",
    position: "",
    experience: "",
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [openAnswer, setOpenAnswer] = useState("");

  const progress = useMemo(() => ((step + 1) / totalSteps) * 100, [step, totalSteps]);

  const DEMO_LABELS: Record<keyof Demo, string> = {
    gender: "الجنس",
    age: "العمر",
    education: "المؤهل العلمي",
    bank: "البنك",
    position: "الوظيفة",
    experience: "سنوات الخبرة",
  };

  function validateStep(): string | null {
    if (step === 0) {
      const missing = (Object.keys(demo) as (keyof Demo)[]).filter((k) => !demo[k]);
      if (missing.length) {
        return `لا يمكن المتابعة — الحقول الناقصة: ${missing.map((k) => DEMO_LABELS[k]).join("، ")}.`;
      }
      return null;
    }
    const axisIdx = step - 1;
    if (axisIdx < axes.length) {
      const axis = axes[axisIdx];
      const missing: number[] = [];
      axis.questions.forEach((q, idx) => {
        if (!answers[q.number]) missing.push(idx + 1);
      });
      if (missing.length) {
        return `لا يمكن المتابعة — لم تتم الإجابة عن العبارات رقم: ${missing.join("، ")} في هذا المحور.`;
      }
    }
    return null;
  }

  // For the final submit: scan the whole survey and list everything missing
  function findAllMissing(): string[] {
    const issues: string[] = [];
    const demoMissing = (Object.keys(demo) as (keyof Demo)[]).filter((k) => !demo[k]);
    if (demoMissing.length) {
      issues.push(`البيانات العامة: ${demoMissing.map((k) => DEMO_LABELS[k]).join("، ")}`);
    }
    for (const axis of axes) {
      const missing: number[] = [];
      axis.questions.forEach((q, idx) => {
        if (!answers[q.number]) missing.push(idx + 1);
      });
      if (missing.length) {
        issues.push(`${axis.name} — العبارات: ${missing.join("، ")}`);
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
      toast.error("لا يمكن حفظ الاستبيان. ينقصك:\n• " + allMissing.join("\n• "), {
        duration: 8000,
      });
      return;
    }
    if (typeof window !== "undefined" && localStorage.getItem("survey_submitted") === "1") {
      toast.error("لقد قمت بتعبئة الاستبيان من قبل من هذا المتصفح. شكراً لمساهمتكم.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: resp, error: rErr } = await supabase
        .from("responses")
        .insert({
          gender: demo.gender,
          age: demo.age,
          education: demo.education,
          bank: demo.bank,
          position: demo.position,
          experience: demo.experience,
          open_answer: openAnswer.trim() || null,
        })
        .select("id")
        .single();
      if (rErr || !resp) throw rErr ?? new Error("response insert failed");

      const rows = axes.flatMap((axis) =>
        axis.questions.map((q) => {
          const v = answers[q.number];
          const t = LIKERT.find((l) => l.value === v)?.text ?? "";
          return {
            response_id: resp.id,
            question_number: q.number,
            axis_name: axis.name,
            answer_text: t,
            answer_value: v,
          };
        }),
      );
      const { error: aErr } = await supabase.from("answers").insert(rows);
      if (aErr) throw aErr;

      if (typeof window !== "undefined") localStorage.setItem("survey_submitted", "1");
      navigate({ to: "/thanks" });
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء إرسال الاستبيان. حاول مجدداً.");
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
        <p className="text-sm text-muted-foreground">تعذر تحميل الأسئلة حالياً. حاول لاحقاً.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero pb-16">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-display text-lg font-bold text-foreground">
          أطروحة دكتوراه
        </Link>
        <span className="text-sm text-muted-foreground">
          الخطوة {step + 1} من {totalSteps}
        </span>
      </header>

      <div className="mx-auto max-w-4xl px-6">
        <Progress value={progress} className="h-2" />
      </div>

      <main className="mx-auto mt-8 max-w-4xl px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {step === 0 && <DemographicsStep demo={demo} setDemo={setDemo} />}

          {step >= 1 && step <= axes.length && (
            <AxisStep axis={axes[step - 1]} answers={answers} setAnswers={setAnswers} />
          )}

          {step === totalSteps - 1 && <OpenStep value={openAnswer} setValue={setOpenAnswer} />}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <Button variant="outline" onClick={goPrev} disabled={step === 0 || submitting}>
              <ArrowRight className="ml-2 h-4 w-4" />
              السابق
            </Button>

            {step < totalSteps - 1 ? (
              <Button onClick={goNext} className="bg-primary text-primary-foreground">
                التالي
                <ArrowLeft className="mr-2 h-4 w-4" />
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
                    جارٍ الإرسال…
                  </>
                ) : (
                  <>
                    <Send className="ml-2 h-4 w-4" />
                    إرسال الاستبيان
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
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

function DemographicsStep({ demo, setDemo }: { demo: Demo; setDemo: (d: Demo) => void }) {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl text-foreground">المحور الأول: البيانات العامة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          جميع البيانات الشخصية تُعالج بسرية تامة وتُستخدم لأغراض التحليل الإحصائي فقط.
        </p>
      </header>

      <Field
        label="الجنس"
        options={GENDERS}
        value={demo.gender}
        onChange={(v) => setDemo({ ...demo, gender: v })}
      />
      <Field
        label="العمر"
        options={AGES}
        value={demo.age}
        onChange={(v) => setDemo({ ...demo, age: v })}
      />
      <Field
        label="المؤهل العلمي"
        options={EDUCATION}
        value={demo.education}
        onChange={(v) => setDemo({ ...demo, education: v })}
      />
      <Field
        label="البنك الذي تعمل فيه"
        options={BANKS}
        value={demo.bank}
        onChange={(v) => setDemo({ ...demo, bank: v })}
      />
      <Field
        label="الوظيفة"
        options={POSITIONS}
        value={demo.position}
        onChange={(v) => setDemo({ ...demo, position: v })}
      />
      <Field
        label="سنوات الخبرة"
        options={EXPERIENCE}
        value={demo.experience}
        onChange={(v) => setDemo({ ...demo, experience: v })}
      />
    </div>
  );
}

function AxisStep({
  axis,
  answers,
  setAnswers,
}: {
  axis: DynamicAxis;
  answers: Record<number, number>;
  setAnswers: (a: Record<number, number>) => void;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl text-foreground">{axis.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          أجب عن كل عبارة وفق مقياس ليكرت الخماسي (موافق بشدة … غير موافق بشدة).
        </p>
      </header>

      <div className="space-y-5">
        {axis.questions.map((q, idx) => (
          <div key={q.number} className="rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-medium leading-relaxed text-foreground">
              <span className="ml-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {idx + 1}
              </span>
              {q.text}
            </p>
            <RadioGroup
              value={answers[q.number]?.toString() ?? ""}
              onValueChange={(v) => setAnswers({ ...answers, [q.number]: Number(v) })}
              className="grid grid-cols-2 gap-2 sm:grid-cols-5"
            >
              {LIKERT.map((l) => {
                const active = answers[q.number] === l.value;
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
                    <span>{l.text}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenStep({ value, setValue }: { value: string; setValue: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-foreground">السؤال المفتوح</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        ما أبرز المقترحات التي ترونها ضرورية لإنجاح تحول البنوك التقليدية إلى بنوك إسلامية في
        موريتانيا؟
        <br />
        <span className="text-xs">(اختياري — حتى ٤٠٠٠ حرف)</span>
      </p>
      <Textarea
        value={value}
        maxLength={4000}
        onChange={(e) => setValue(e.target.value)}
        rows={8}
        placeholder="اكتب مقترحاتك هنا…"
        className="resize-y"
      />
      <p className="text-xs text-muted-foreground">{value.length} / 4000</p>
    </div>
  );
}
