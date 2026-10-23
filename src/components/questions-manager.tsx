import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuestions, type DbAxis, type DbQuestion } from "@/lib/use-questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

type Triple = [string, string, string];
function LangFields({
  values,
  setValues,
  label,
}: {
  values: Triple;
  setValues: (v: Triple) => void;
  label: string;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {["العربية", "Français", "English"].map((language, i) => (
        <div key={language}>
          <label className="mb-1 block text-xs text-muted-foreground">
            {label} — {language}
          </label>
          <Textarea
            rows={2}
            value={values[i]}
            onChange={(e) => {
              const next = [...values] as Triple;
              next[i] = e.target.value;
              setValues(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function QuestionsManager() {
  const qc = useQueryClient();
  const { questions, dbAxes, isLoading } = useQuestions({ activeOnly: false });
  const [axisNames, setAxisNames] = useState<Triple>(["", "", ""]);
  const [questionTexts, setQuestionTexts] = useState<Triple>(["", "", ""]);
  const [axisId, setAxisId] = useState("");
  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["survey-questionnaire"] });
  };
  if (isLoading)
    return (
      <div className="grid place-items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  async function addAxis() {
    if (axisNames.some((value) => !value.trim()))
      return toast.error("أدخل اسم المحور باللغات الثلاث.");
    const { error } = await supabase.from("survey_axes").insert({
      id: `axis-${crypto.randomUUID()}`,
      name_ar: axisNames[0].trim(),
      name_fr: axisNames[1].trim(),
      name_en: axisNames[2].trim(),
      order_index: Math.max(0, ...dbAxes.map((a) => a.order_index)) + 1,
      active: true,
    });
    if (error) return toast.error(error.message);
    setAxisNames(["", "", ""]);
    toast.success("تمت إضافة المحور.");
    await refresh();
  }
  async function addQuestion() {
    const axis = dbAxes.find((item) => item.id === axisId);
    if (!axis || questionTexts.some((value) => !value.trim()))
      return toast.error("اختر محوراً وأدخل السؤال باللغات الثلاث.");
    const { error } = await supabase.from("survey_questions").insert({
      number: Math.max(0, ...questions.map((q) => q.number)) + 1,
      axis_id: axis.id,
      axis_name: axis.name_ar,
      text: questionTexts[0].trim(),
      text_fr: questionTexts[1].trim(),
      text_en: questionTexts[2].trim(),
      order_index:
        Math.max(0, ...questions.filter((q) => q.axis_id === axis.id).map((q) => q.order_index)) +
        1,
      active: true,
    });
    if (error) return toast.error(error.message);
    setQuestionTexts(["", "", ""]);
    toast.success("تمت إضافة السؤال.");
    await refresh();
  }
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">إضافة محور</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LangFields label="اسم المحور" values={axisNames} setValues={setAxisNames} />
          <Button onClick={addAxis}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة المحور
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">إضافة سؤال</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="h-10 w-full rounded-md border bg-background px-3"
            value={axisId}
            onChange={(e) => setAxisId(e.target.value)}
          >
            <option value="">اختر المحور</option>
            {dbAxes.map((axis) => (
              <option key={axis.id} value={axis.id}>
                {axis.name_ar}
              </option>
            ))}
          </select>
          <LangFields label="نص السؤال" values={questionTexts} setValues={setQuestionTexts} />
          <Button onClick={addQuestion}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة السؤال
          </Button>
        </CardContent>
      </Card>
      {dbAxes.map((axis) => (
        <AxisEditor
          key={axis.id}
          axis={axis}
          questions={questions.filter((q) => q.axis_id === axis.id)}
          refresh={refresh}
        />
      ))}
    </div>
  );
}

function AxisEditor({
  axis,
  questions,
  refresh,
}: {
  axis: DbAxis;
  questions: DbQuestion[];
  refresh: () => Promise<void>;
}) {
  const [names, setNames] = useState<Triple>([axis.name_ar, axis.name_fr, axis.name_en]);
  const [order, setOrder] = useState(axis.order_index);
  async function save() {
    const { error } = await supabase
      .from("survey_axes")
      .update({
        name_ar: names[0].trim(),
        name_fr: names[1].trim(),
        name_en: names[2].trim(),
        order_index: order,
      })
      .eq("id", axis.id);
    if (error) return toast.error(error.message);
    await supabase
      .from("survey_questions")
      .update({ axis_name: names[0].trim() })
      .eq("axis_id", axis.id);
    toast.success("تم حفظ المحور.");
    await refresh();
  }
  async function toggle(active: boolean) {
    const { error } = await supabase.from("survey_axes").update({ active }).eq("id", axis.id);
    if (error) return toast.error(error.message);
    await refresh();
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{axis.name_ar}</CardTitle>
          <label className="flex items-center gap-2 text-xs">
            مفعّل <Switch checked={axis.active} onCheckedChange={toggle} />
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <LangFields label="اسم المحور" values={names} setValues={setNames} />
        <div className="flex items-end gap-2">
          <div>
            <label className="text-xs">الترتيب</label>
            <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
          </div>
          <Button onClick={save}>
            <Save className="ml-2 h-4 w-4" />
            حفظ المحور
          </Button>
        </div>
        {questions
          .sort((a, b) => a.order_index - b.order_index)
          .map((q) => (
            <QuestionEditor key={q.id} q={q} refresh={refresh} />
          ))}
      </CardContent>
    </Card>
  );
}

function QuestionEditor({ q, refresh }: { q: DbQuestion; refresh: () => Promise<void> }) {
  const [texts, setTexts] = useState<Triple>([q.text, q.text_fr, q.text_en]);
  const [order, setOrder] = useState(q.order_index);
  async function save() {
    if (texts.some((value) => !value.trim())) return toast.error("جميع الترجمات مطلوبة.");
    const { error } = await supabase
      .from("survey_questions")
      .update({
        text: texts[0].trim(),
        text_fr: texts[1].trim(),
        text_en: texts[2].trim(),
        order_index: order,
      })
      .eq("id", q.id);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ السؤال.");
    await refresh();
  }
  async function toggle(active: boolean) {
    const { error } = await supabase.from("survey_questions").update({ active }).eq("id", q.id);
    if (error) return toast.error(error.message);
    await refresh();
  }
  return (
    <div
      className={`rounded-xl border p-4 ${q.active ? "bg-background" : "bg-muted/40 opacity-70"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <b className="text-sm">السؤال {q.number}</b>
        <label className="flex items-center gap-2 text-xs">
          مفعّل <Switch checked={q.active} onCheckedChange={toggle} />
        </label>
      </div>
      <LangFields label="السؤال" values={texts} setValues={setTexts} />
      <div className="mt-3 flex items-end gap-2">
        <div>
          <label className="text-xs">الترتيب</label>
          <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </div>
        <Button size="sm" onClick={save}>
          <Save className="ml-2 h-4 w-4" />
          حفظ
        </Button>
      </div>
    </div>
  );
}
