import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchQuestions, type DbQuestion } from "@/lib/use-questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Save, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";

const surveyQuestionsTable = () => supabase.from("survey_questions");

function ensureMutationAffectedRow(data: { id: string } | null, operation: string) {
  if (!data) {
    throw new Error(`لم تنفذ قاعدة البيانات عملية ${operation}. تحقق من صلاحيات المدير.`);
  }
}

export function QuestionsManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "survey_questions"],
    queryFn: () => fetchQuestions({ activeOnly: false }),
  });

  const [adding, setAdding] = useState(false);
  const [newAxisId, setNewAxisId] = useState("");
  const [newAxisName, setNewAxisName] = useState("");
  const [newText, setNewText] = useState("");

  if (isLoading) {
    return (
      <div className="grid place-items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const all = data ?? [];
  // group by axis
  const byAxis = new Map<string, { name: string; items: DbQuestion[] }>();
  for (const q of [...all].sort(
    (a, b) => a.axis_id.localeCompare(b.axis_id) || a.order_index - b.order_index,
  )) {
    if (!byAxis.has(q.axis_id)) byAxis.set(q.axis_id, { name: q.axis_name, items: [] });
    byAxis.get(q.axis_id)!.items.push(q);
  }
  const axisOptions = Array.from(byAxis.entries()).map(([id, a]) => ({ id, name: a.name }));

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin", "survey_questions"] });
    await qc.invalidateQueries({ queryKey: ["survey_questions"] });
  }

  async function addQuestion() {
    if (!newAxisId.trim() || !newAxisName.trim() || !newText.trim()) {
      toast.error("يرجى تعبئة كل الحقول.");
      return;
    }
    const nextNumber = all.length ? Math.max(...all.map((q) => q.number)) + 1 : 1;
    const sameAxis = all.filter((q) => q.axis_id === newAxisId.trim());
    const nextOrder = sameAxis.length ? Math.max(...sameAxis.map((q) => q.order_index)) + 1 : 1;
    const { data: inserted, error } = await surveyQuestionsTable()
      .insert({
        number: nextNumber,
        axis_id: newAxisId.trim(),
        axis_name: newAxisName.trim(),
        text: newText.trim(),
        order_index: nextOrder,
        active: true,
      })
      .select("id")
      .single();
    if (error) return toast.error("تعذرت الإضافة: " + error.message);
    try {
      ensureMutationAffectedRow(inserted, "الإضافة");
    } catch (mutationError) {
      return toast.error(mutationError instanceof Error ? mutationError.message : "تعذرت الإضافة.");
    }
    toast.success("تمت إضافة السؤال.");
    setNewText("");
    setAdding(false);
    await refresh();
  }

  return (
    <div className="space-y-6">
      {/* Add new */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">إضافة سؤال جديد</CardTitle>
          <Button
            size="sm"
            variant={adding ? "outline" : "default"}
            onClick={() => setAdding((s) => !s)}
          >
            {adding ? (
              <>
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </>
            ) : (
              <>
                <Plus className="ml-2 h-4 w-4" />
                سؤال جديد
              </>
            )}
          </Button>
        </CardHeader>
        {adding && (
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  معرّف المحور (مثال: axis2)
                </label>
                <Input
                  list="axis-ids"
                  value={newAxisId}
                  onChange={(e) => {
                    setNewAxisId(e.target.value);
                    const match = axisOptions.find((a) => a.id === e.target.value);
                    if (match) setNewAxisName(match.name);
                  }}
                  placeholder="axis7"
                />
                <datalist id="axis-ids">
                  {axisOptions.map((a) => (
                    <option key={a.id} value={a.id} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">اسم المحور</label>
                <Input
                  value={newAxisName}
                  onChange={(e) => setNewAxisName(e.target.value)}
                  placeholder="المحور السابع: …"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">نص السؤال</label>
              <Textarea value={newText} onChange={(e) => setNewText(e.target.value)} rows={3} />
            </div>
            <Button onClick={addQuestion} className="bg-primary text-primary-foreground">
              <Save className="ml-2 h-4 w-4" /> حفظ
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Existing questions grouped by axis */}
      {Array.from(byAxis.entries()).map(([axisId, axis]) => (
        <Card key={axisId}>
          <CardHeader>
            <CardTitle className="text-base">
              <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {axisId}
              </span>
              {axis.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {axis.items.map((q) => (
              <QuestionRow key={q.id} q={q} onChanged={refresh} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuestionRow({ q, onChanged }: { q: DbQuestion; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(q.text);
  const [axisName, setAxisName] = useState(q.axis_name);
  const [orderIndex, setOrderIndex] = useState(q.order_index);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { data, error } = await surveyQuestionsTable()
      .update({ text: text.trim(), axis_name: axisName.trim(), order_index: orderIndex })
      .eq("id", q.id)
      .select("id")
      .maybeSingle();
    setSaving(false);
    if (error) return toast.error("تعذر الحفظ: " + error.message);
    try {
      ensureMutationAffectedRow(data, "الحفظ");
    } catch (mutationError) {
      return toast.error(mutationError instanceof Error ? mutationError.message : "تعذر الحفظ.");
    }
    toast.success("تم الحفظ.");
    setEditing(false);
    await onChanged();
  }

  async function toggleActive(v: boolean) {
    const { data, error } = await surveyQuestionsTable()
      .update({ active: v })
      .eq("id", q.id)
      .select("id")
      .maybeSingle();
    if (error) return toast.error(error.message);
    try {
      ensureMutationAffectedRow(data, "تغيير الحالة");
    } catch (mutationError) {
      return toast.error(
        mutationError instanceof Error ? mutationError.message : "تعذر تغيير الحالة.",
      );
    }
    await onChanged();
  }

  async function remove() {
    const { data, error } = await surveyQuestionsTable()
      .delete()
      .eq("id", q.id)
      .select("id")
      .maybeSingle();
    if (error) return toast.error("تعذر الحذف: " + error.message);
    try {
      ensureMutationAffectedRow(data, "الحذف");
    } catch (mutationError) {
      return toast.error(mutationError instanceof Error ? mutationError.message : "تعذر الحذف.");
    }
    toast.success("تم الحذف.");
    await onChanged();
  }

  return (
    <div
      className={`rounded-xl border p-3 ${q.active ? "border-border bg-background" : "border-border/60 bg-muted/40 opacity-70"}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-gold/10 px-2 py-0.5 font-semibold text-gold">
          س{q.number}
        </span>
        <span>ترتيب داخل المحور: {q.order_index}</span>
        <div className="ms-auto flex items-center gap-3">
          <label className="flex items-center gap-2">
            <span>مفعّل</span>
            <Switch checked={q.active} onCheckedChange={toggleActive} />
          </label>
          {editing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setText(q.text);
                setAxisName(q.axis_name);
                setOrderIndex(q.order_index);
              }}
            >
              <X className="ml-1 h-3.5 w-3.5" />
              إلغاء
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="ml-1 h-3.5 w-3.5" />
              تعديل
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="ml-1 h-3.5 w-3.5" />
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>حذف السؤال؟</AlertDialogTitle>
                <AlertDialogDescription>
                  لن يتم حذف الإجابات السابقة المرتبطة بهذا السؤال، لكنه لن يظهر في الاستبيان
                  مجدداً. يُفضّل تعطيله بدلاً من حذفه للحفاظ على تكامل الإحصاءات.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>تراجع</AlertDialogCancel>
                <AlertDialogAction onClick={remove}>حذف نهائي</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {editing ? (
        <div className="space-y-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
          <div className="grid gap-2 md:grid-cols-2">
            <Input
              value={axisName}
              onChange={(e) => setAxisName(e.target.value)}
              placeholder="اسم المحور"
            />
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              placeholder="ترتيب"
            />
          </div>
          <Button
            size="sm"
            onClick={save}
            disabled={saving}
            className="bg-primary text-primary-foreground"
          >
            {saving ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            حفظ
          </Button>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-foreground">{q.text}</p>
      )}
    </div>
  );
}
