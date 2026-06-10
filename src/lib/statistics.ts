import { interpretMean } from "./survey-data";

type QInfo = { number: number; text: string; axis_id: string; axis_name: string };
type AxisInfo = { id: string; name: string; questions: { number: number; text: string }[] };

export type AnswerRow = {
  question_number: number;
  axis_name: string;
  answer_value: number;
  answer_text: string;
  response_id: string;
};

export type QuestionStat = {
  number: number;
  text: string;
  axis_id: string;
  axis_name: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  pct: { 1: number; 2: number; 3: number; 4: number; 5: number };
  interpretation: ReturnType<typeof interpretMean>;
};

export type AxisStat = {
  id: string;
  name: string;
  mean: number;
  std: number;
  count: number;
  questions: QuestionStat[];
  interpretation: ReturnType<typeof interpretMean>;
};

function mean(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stdDev(arr: number[]) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const v = arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(v);
}

export function computeStats(answers: AnswerRow[], allQuestions: QInfo[], axes: AxisInfo[]) {
  const byQ = new Map<number, number[]>();
  for (const a of answers) {
    if (!byQ.has(a.question_number)) byQ.set(a.question_number, []);
    byQ.get(a.question_number)!.push(a.answer_value);
  }

  const qStats: QuestionStat[] = allQuestions.map((q) => {
    const vals = byQ.get(q.number) ?? [];
    const m = mean(vals);
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    for (const v of vals) counts[v as 1 | 2 | 3 | 4 | 5]++;
    const total = vals.length || 1;
    return {
      number: q.number,
      text: q.text,
      axis_id: q.axis_id,
      axis_name: q.axis_name,
      count: vals.length,
      mean: m,
      std: stdDev(vals),
      min: vals.length ? Math.min(...vals) : 0,
      max: vals.length ? Math.max(...vals) : 0,
      pct: {
        1: (counts[1] / total) * 100,
        2: (counts[2] / total) * 100,
        3: (counts[3] / total) * 100,
        4: (counts[4] / total) * 100,
        5: (counts[5] / total) * 100,
      },
      interpretation: interpretMean(m),
    };
  });

  const axisStats: AxisStat[] = axes
    .map((axis) => {
      const nums = axis.questions.map((q) => q.number);
      const qs = qStats.filter((q) => nums.includes(q.number));
      const allVals = answers
        .filter((a) => nums.includes(a.question_number))
        .map((a) => a.answer_value);
      const m = mean(allVals);
      return {
        id: axis.id,
        name: axis.name,
        mean: m,
        std: stdDev(allVals),
        count: allVals.length,
        questions: qs,
        interpretation: interpretMean(m),
      };
    })
    .sort((a, b) => b.mean - a.mean);

  return { qStats, axisStats };
}

export function groupCounts<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = String(r[key] ?? "—");
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}
