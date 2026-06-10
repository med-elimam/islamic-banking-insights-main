import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { computeStats, type AnswerRow } from "@/lib/statistics";
import { interpretMean } from "@/lib/survey-data";
import { useQuestions } from "@/lib/use-questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/analysis")({
  head: () => ({ meta: [{ title: "تحليل النتائج" }] }),
  component: () => (
    <AdminGuard>
      <AnalysisPage />
    </AdminGuard>
  ),
});

const LIKERT_COLORS = ["#a85a3a", "#c79a3a", "#8c8c8c", "#5a8c6e", "#2f6a4d"];

function AnalysisPage() {
  const { axes: dynAxes, allQuestions, isLoading: qLoading } = useQuestions();
  const answersQ = useQuery({
    queryKey: ["analysis", "answers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("answers")
        .select("response_id, question_number, axis_name, answer_value, answer_text");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { qStats, axisStats } = useMemo(
    () => computeStats((answersQ.data ?? []) as AnswerRow[], allQuestions, dynAxes),
    [answersQ.data, allQuestions, dynAxes],
  );

  if (answersQ.isLoading || qLoading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const radarData = axisStats.map((a) => ({
    axis: a.id.toUpperCase(),
    name: a.name,
    mean: +a.mean.toFixed(2),
  }));
  const orderedQuestions = [...qStats].sort((a, b) => b.mean - a.mean);

  const likertPieFromAll = (() => {
    const sums = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    for (const a of answersQ.data ?? []) sums[a.answer_value as 1 | 2 | 3 | 4 | 5]++;
    return [
      { name: "غير موافق بشدة", value: sums[1] },
      { name: "غير موافق", value: sums[2] },
      { name: "محايد", value: sums[3] },
      { name: "موافق", value: sums[4] },
      { name: "موافق بشدة", value: sums[5] },
    ];
  })();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-foreground">تحليل النتائج</h1>
        <p className="text-sm text-muted-foreground">
          تحليل إحصائي تلقائي وفق مقياس ليكرت الخماسي، مع تفسير أكاديمي لكل محور وسؤال.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>متوسطات المحاور</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={axisStats.map((a) => ({
                  name: a.id.toUpperCase(),
                  mean: +a.mean.toFixed(2),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="mean" fill="#2f6a4d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الرادار — المحاور</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar dataKey="mean" stroke="#c79a3a" fill="#c79a3a" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>التوزيع الإجمالي لإجابات ليكرت</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={likertPieFromAll} dataKey="value" nameKey="name" outerRadius={110} label>
                  {likertPieFromAll.map((_, i) => (
                    <Cell key={i} fill={LIKERT_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Axis-by-axis interpretation */}
      <div className="space-y-6">
        {axisStats.map((axis, i) => (
          <Card key={axis.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-baseline justify-between gap-3">
                <span>
                  <span className="ml-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {i + 1}
                  </span>
                  {axis.name}
                </span>
                <span className={`text-sm font-normal ${axis.interpretation.tone}`}>
                  متوسط: {axis.mean.toFixed(3)} · انحراف: {axis.std.toFixed(3)} ·{" "}
                  {axis.interpretation.label}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-foreground">
                <strong>تفسير أكاديمي:</strong> {academicInterpretation(axis.mean, axis.name)}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead className="min-w-[300px]">العبارة</TableHead>
                    <TableHead>المتوسط</TableHead>
                    <TableHead>الانحراف</TableHead>
                    <TableHead>ن</TableHead>
                    <TableHead>التفسير</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...axis.questions]
                    .sort((a, b) => b.mean - a.mean)
                    .map((q) => (
                      <TableRow key={q.number}>
                        <TableCell>{q.number}</TableCell>
                        <TableCell className="text-sm">{q.text}</TableCell>
                        <TableCell className="font-mono">{q.mean.toFixed(3)}</TableCell>
                        <TableCell className="font-mono">{q.std.toFixed(3)}</TableCell>
                        <TableCell>{q.count}</TableCell>
                        <TableCell className={q.interpretation.tone}>
                          {q.interpretation.label}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ترتيب العبارات حسب المتوسط (تنازلياً)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الترتيب</TableHead>
                <TableHead>#</TableHead>
                <TableHead className="min-w-[300px]">العبارة</TableHead>
                <TableHead>المحور</TableHead>
                <TableHead>المتوسط</TableHead>
                <TableHead>التفسير</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderedQuestions.map((q, i) => (
                <TableRow key={q.number}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{q.number}</TableCell>
                  <TableCell className="text-sm">{q.text}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {q.axis_id.toUpperCase()}
                  </TableCell>
                  <TableCell className="font-mono">{q.mean.toFixed(3)}</TableCell>
                  <TableCell className={q.interpretation.tone}>{q.interpretation.label}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function academicInterpretation(mean: number, axisName: string): string {
  const { label } = interpretMean(mean);
  if (mean >= 4.21)
    return `تشير نتائج ${axisName} إلى ${label} لدى أفراد العينة، مما يعكس قناعة قوية باتجاه المضمون الذي يطرحه هذا المحور ويستدعي البناء على هذه القناعة في خطوات التحول العملية.`;
  if (mean >= 3.41)
    return `تدل النتائج على ${label} لدى أفراد العينة فيما يتعلق ﺑـ ${axisName}، وهو ما يوحي بوجود استعداد لدى المستجيبين يمكن تعزيزه عبر سياسات وبرامج داعمة.`;
  if (mean >= 2.61)
    return `جاء ${axisName} في ${label}، مما يعكس تباينا في وجهات النظر داخل العينة ويتطلب مزيدا من التوعية والدراسة قبل اتخاذ خطوات حاسمة.`;
  if (mean >= 1.81)
    return `أظهرت النتائج ${label} في ${axisName}، وهو ما يشير إلى تحفظات حقيقية لدى المستجيبين تحتاج إلى معالجة جذرية قبل المضي في خطوات التحول.`;
  return `جاء ${axisName} في ${label} لدى العينة، مما يعكس اعتراضا واضحا يستدعي إعادة النظر في المقاربة المتبعة وتقديم مبررات وضمانات للمستجيبين.`;
}
