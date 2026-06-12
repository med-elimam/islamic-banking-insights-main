import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { computeStats, groupCounts, type AnswerRow } from "@/lib/statistics";
import { useQuestions } from "@/lib/use-questions";
import { QuestionsManager } from "@/components/questions-manager";
import { exportResponsesToExcel, exportAnalysisToPDF, type ResponseRow } from "@/lib/export-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BANKS, POSITIONS, EXPERIENCE } from "@/lib/survey-data";
import {
  FileSpreadsheet,
  FileText,
  Loader2,
  Users,
  ListChecks,
  BarChart3,
  Settings2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — تحول البنوك" }] }),
  component: () => (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  ),
});

const COLORS = ["#2f6a4d", "#c79a3a", "#3d7da6", "#a85a3a", "#7a5da6", "#5a8c6e"];

function AdminDashboard() {
  const { axes: dynAxes, allQuestions, isLoading: qLoading } = useQuestions();
  const responsesQ = useQuery({
    queryKey: ["admin", "responses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("responses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ResponseRow[];
    },
  });
  const answersQ = useQuery({
    queryKey: ["admin", "answers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("answers")
        .select("response_id, question_number, axis_name, answer_value, answer_text");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [bank, setBank] = useState<string>("all");
  const [pos, setPos] = useState<string>("all");
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exp, setExp] = useState<string>("all");
  const [q, setQ] = useState("");

  const handleDeleteResponse = async (id: string) => {
    try {
      const { error } = await supabase
        .from("responses")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }

      toast.success("تم حذف الاستجابة بنجاح.");
      // Invalidate queries to trigger refetch
      responsesQ.refetch();
      answersQ.refetch();
    } catch (err: any) {
      console.error("Failed to delete response:", err);
      toast.error("حدث خطأ أثناء حذف الاستجابة: " + err.message);
    }
  };

  const filtered = useMemo(() => {
    const all = responsesQ.data ?? [];
    return all.filter((r) => {
      if (bank !== "all" && r.bank !== bank) return false;
      if (pos !== "all" && r.position !== pos) return false;
      if (exp !== "all" && r.experience !== exp) return false;
      if (q.trim()) {
        const needle = q.trim().toLowerCase();
        const hay = [
          r.bank,
          r.position,
          r.education,
          r.experience,
          r.open_answer ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [responsesQ.data, bank, pos, exp, q]);

  const answers = answersQ.data ?? [];
  const filteredIds = new Set(filtered.map((r) => r.id));
  const filteredAnswers = answers.filter((a) => filteredIds.has(a.response_id));

  const { qStats, axisStats } = useMemo(
    () => computeStats(filteredAnswers as AnswerRow[], allQuestions, dynAxes),
    [filteredAnswers, allQuestions, dynAxes],
  );

  const answersByResponse = useMemo(() => {
    const m = new Map<string, { question_number: number; answer_value: number }[]>();
    for (const a of answers) {
      if (!m.has(a.response_id)) m.set(a.response_id, []);
      m.get(a.response_id)!.push({
        question_number: a.question_number,
        answer_value: a.answer_value,
      });
    }
    return m;
  }, [answers]);

  if (responsesQ.isLoading || answersQ.isLoading || qLoading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const total = filtered.length;
  const byBank = groupCounts(filtered, "bank");

  const byPosition = groupCounts(filtered, "position");
  const byExperience = groupCounts(filtered, "experience");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">
            عرض الاستجابات والإحصاءات وفلترتها وتصديرها.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => exportResponsesToExcel(filtered, answersByResponse, qStats, axisStats)}
          >
            <FileSpreadsheet className="ml-2 h-4 w-4" /> تصدير Excel
          </Button>
          <Button
            onClick={async () => {
              setExportingPDF(true);
              try {
                await exportAnalysisToPDF({
                  responses: filtered,
                  qStats,
                  axisStats,
                  byBank,
                  byPosition,
                  byExperience,
                  totals: {
                    responses: total,
                    banks: new Set(filtered.map((r) => r.bank)).size,
                    positions: new Set(filtered.map((r) => r.position)).size,
                    mean: axisStats.length
                      ? +(axisStats.reduce((s, a) => s + a.mean, 0) / axisStats.length).toFixed(2)
                      : 0,
                  },
                });
              } catch (e) {
                console.error("PDF export failed:", e);
              } finally {
                setExportingPDF(false);
              }
            }}
            disabled={exportingPDF}
            className="bg-primary text-primary-foreground"
          >
            {exportingPDF ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <FileText className="ml-2 h-4 w-4" /> تصدير PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="responses" className="gap-2">
            <ListChecks className="h-4 w-4" />
            الاستجابات
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-2">
            <Settings2 className="h-4 w-4" />
            إدارة الأسئلة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="إجمالي الاستجابات"
              value={total.toString()}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="عدد البنوك"
              value={new Set(filtered.map((r) => r.bank)).size.toString()}
            />
            <StatCard
              title="عدد الوظائف الممثلة"
              value={new Set(filtered.map((r) => r.position)).size.toString()}
            />
            <StatCard
              title="المتوسط الكلي للمحاور"
              value={
                axisStats.length
                  ? (axisStats.reduce((s, a) => s + a.mean, 0) / axisStats.length).toFixed(2)
                  : "—"
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="حسب البنك">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byBank}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2f6a4d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="حسب الوظيفة">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byPosition} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#c79a3a" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="حسب سنوات الخبرة">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byExperience}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3d7da6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>متوسطات المحاور</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الترتيب</TableHead>
                    <TableHead className="text-right">المحور</TableHead>
                    <TableHead className="text-right">المتوسط</TableHead>
                    <TableHead className="text-right">الانحراف المعياري</TableHead>
                    <TableHead className="text-right">عدد الإجابات</TableHead>
                    <TableHead className="text-right">التفسير</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {axisStats.map((a, i) => (
                    <TableRow key={a.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="max-w-md">{a.name}</TableCell>
                      <TableCell className="font-mono">{a.mean.toFixed(3)}</TableCell>
                      <TableCell className="font-mono">{a.std.toFixed(3)}</TableCell>
                      <TableCell>{a.count}</TableCell>
                      <TableCell className={a.interpretation.tone}>
                        {a.interpretation.label}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">فلاتر</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-5">
              <FilterSelect
                label="البنك"
                value={bank}
                onChange={setBank}
                options={BANKS as readonly string[]}
              />
              <FilterSelect
                label="الوظيفة"
                value={pos}
                onChange={setPos}
                options={POSITIONS as readonly string[]}
              />

              <FilterSelect
                label="الخبرة"
                value={exp}
                onChange={setExp}
                options={EXPERIENCE as readonly string[]}
              />
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">بحث نصي</label>
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث…" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>جدول الاستجابات ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المؤهل</TableHead>
                      <TableHead>البنك</TableHead>
                      <TableHead>الوظيفة</TableHead>
                      <TableHead>الخبرة</TableHead>
                      <TableHead>إجابة مفتوحة</TableHead>
                      <TableHead className="w-[80px] text-center">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-xs">
                          {new Date(r.created_at).toLocaleString("ar")}
                        </TableCell>
                        <TableCell>{r.education}</TableCell>
                        <TableCell>{r.bank}</TableCell>
                        <TableCell>{r.position}</TableCell>
                        <TableCell>{r.experience}</TableCell>
                        <TableCell className="max-w-xs truncate" title={r.open_answer ?? ""}>
                          {r.open_answer ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف الاستجابة؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من رغبتك في حذف هذه الاستجابة نهائياً؟ سيؤدي هذا إلى حذف جميع الإجابات التابعة لها ولا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>تراجع</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                  onClick={() => handleDeleteResponse(r.id)}
                                >
                                  حذف نهائي
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!filtered.length && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-sm text-muted-foreground"
                        >
                          لا توجد بيانات لعرضها بعد.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <QuestionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
        </div>
        {icon ? <div className="text-gold">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
