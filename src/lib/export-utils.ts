import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { AxisStat, QuestionStat } from "./statistics";

export type ResponseRow = {
  id: string;
  gender: string;
  age: string;
  education: string;
  bank: string;
  position: string;
  experience: string;
  open_answer: string | null;
  created_at: string;
};

function autoSizeCols(rows: Record<string, unknown>[]): { wch: number }[] {
  if (!rows.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((k) => {
    const max = Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length));
    return { wch: Math.min(Math.max(max + 2, 10), 60) };
  });
}

function styleSheet(rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = autoSizeCols(rows);
  // Excel sheet view: right-to-left for Arabic
  (ws as Record<string, unknown>)["!views"] = [{ RTL: true }];
  return ws;
}

export function exportResponsesToExcel(
  responses: ResponseRow[],
  answersByResponse: Map<string, { question_number: number; answer_value: number }[]>,
  qStats: QuestionStat[],
  axisStats: AxisStat[],
) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = [
    { البند: "إجمالي الاستجابات", القيمة: responses.length },
    { البند: "عدد الأسئلة", القيمة: qStats.length },
    { البند: "عدد المحاور", القيمة: axisStats.length },
    { البند: "تاريخ التصدير", القيمة: new Date().toLocaleString("ar") },
    {
      البند: "المتوسط العام",
      القيمة: axisStats.length
        ? +(axisStats.reduce((s, a) => s + a.mean, 0) / axisStats.length).toFixed(3)
        : 0,
    },
  ];
  XLSX.utils.book_append_sheet(wb, styleSheet(summaryRows), "ملخص");

  // Responses sheet with answers as columns
  const qNumbers = qStats.map((q) => q.number);
  const responseRows = responses.map((r) => {
    const ans = answersByResponse.get(r.id) ?? [];
    const map = new Map(ans.map((a) => [a.question_number, a.answer_value]));
    const base: Record<string, unknown> = {
      "رقم الاستجابة": r.id,
      التاريخ: new Date(r.created_at).toLocaleString("ar"),
      الجنس: r.gender,
      العمر: r.age,
      المؤهل: r.education,
      البنك: r.bank,
      الوظيفة: r.position,
      الخبرة: r.experience,
      "الإجابة المفتوحة": r.open_answer ?? "",
    };
    for (const n of qNumbers) base[`س${n}`] = map.get(n) ?? "";
    return base;
  });
  XLSX.utils.book_append_sheet(wb, styleSheet(responseRows), "الاستجابات");

  // Question stats
  const qRows = qStats.map((q) => ({
    "رقم السؤال": q.number,
    المحور: q.axis_name,
    "نص السؤال": q.text,
    "عدد الإجابات": q.count,
    المتوسط: +q.mean.toFixed(3),
    "الانحراف المعياري": +q.std.toFixed(3),
    أعلى: q.max,
    أقل: q.min,
    "% موافق بشدة": +q.pct[5].toFixed(2),
    "% موافق": +q.pct[4].toFixed(2),
    "% محايد": +q.pct[3].toFixed(2),
    "% غير موافق": +q.pct[2].toFixed(2),
    "% غير موافق بشدة": +q.pct[1].toFixed(2),
    التفسير: q.interpretation.label,
  }));
  XLSX.utils.book_append_sheet(wb, styleSheet(qRows), "إحصاء الأسئلة");

  // Axis stats
  const axisRows = axisStats.map((a, i) => ({
    الترتيب: i + 1,
    المحور: a.name,
    "عدد الإجابات": a.count,
    المتوسط: +a.mean.toFixed(3),
    "الانحراف المعياري": +a.std.toFixed(3),
    التفسير: a.interpretation.label,
  }));
  XLSX.utils.book_append_sheet(wb, styleSheet(axisRows), "إحصاء المحاور");

  // Open answers sheet
  const openRows = responses
    .filter((r) => r.open_answer && r.open_answer.trim())
    .map((r) => ({
      التاريخ: new Date(r.created_at).toLocaleString("ar"),
      البنك: r.bank,
      الوظيفة: r.position,
      "الإجابة المفتوحة": r.open_answer,
    }));
  if (openRows.length) {
    XLSX.utils.book_append_sheet(wb, styleSheet(openRows), "إجابات مفتوحة");
  }

  XLSX.writeFile(wb, `survey-results-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReportHTML(
  qStats: QuestionStat[],
  axisStats: AxisStat[],
  totals: { responses: number },
): string {
  const now = new Date().toLocaleString("ar");
  const axisRows = axisStats
    .map(
      (a, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="text-align:right">${escapeHtml(a.name)}</td>
        <td>${a.count}</td>
        <td>${a.mean.toFixed(3)}</td>
        <td>${a.std.toFixed(3)}</td>
        <td>${escapeHtml(a.interpretation.label)}</td>
      </tr>`,
    )
    .join("");
  const qRows = qStats
    .map(
      (q) => `
      <tr>
        <td>${q.number}</td>
        <td style="text-align:right">${escapeHtml(q.text)}</td>
        <td>${q.count}</td>
        <td>${q.mean.toFixed(3)}</td>
        <td>${q.std.toFixed(3)}</td>
        <td>${escapeHtml(q.interpretation.label)}</td>
      </tr>`,
    )
    .join("");

  return `
  <div dir="rtl" lang="ar" style="
    width:794px; padding:40px; font-family: 'Cairo','Amiri','Tahoma',sans-serif;
    color:#1f2937; background:#ffffff;">
    <div style="border-bottom:3px solid #0f5132; padding-bottom:16px; margin-bottom:24px;">
      <h1 style="margin:0; font-size:24px; color:#0f5132;">تقرير التحليل الإحصائي</h1>
      <p style="margin:6px 0 0; font-size:13px; color:#6b7280;">
        تحول البنوك التقليدية إلى بنوك إسلامية — الواقع والتحديات
      </p>
      <p style="margin:4px 0 0; font-size:12px; color:#6b7280;">
        إجمالي الاستجابات: <b>${totals.responses}</b> &nbsp;•&nbsp; تاريخ التقرير: ${now}
      </p>
    </div>

    <h2 style="font-size:18px; color:#0f5132; margin:18px 0 10px;">ترتيب المحاور وفق المتوسط العام</h2>
    <table style="width:100%; border-collapse:collapse; font-size:12px;">
      <thead>
        <tr style="background:#0f5132; color:#fff;">
          <th style="padding:8px; border:1px solid #d1d5db;">#</th>
          <th style="padding:8px; border:1px solid #d1d5db;">المحور</th>
          <th style="padding:8px; border:1px solid #d1d5db;">العدد</th>
          <th style="padding:8px; border:1px solid #d1d5db;">المتوسط</th>
          <th style="padding:8px; border:1px solid #d1d5db;">الانحراف</th>
          <th style="padding:8px; border:1px solid #d1d5db;">التفسير</th>
        </tr>
      </thead>
      <tbody style="text-align:center">${axisRows}</tbody>
    </table>

    <h2 style="font-size:18px; color:#0f5132; margin:24px 0 10px;">تفصيل الأسئلة</h2>
    <table style="width:100%; border-collapse:collapse; font-size:11px;">
      <thead>
        <tr style="background:#0f5132; color:#fff;">
          <th style="padding:6px; border:1px solid #d1d5db;">رقم</th>
          <th style="padding:6px; border:1px solid #d1d5db;">نص السؤال</th>
          <th style="padding:6px; border:1px solid #d1d5db;">العدد</th>
          <th style="padding:6px; border:1px solid #d1d5db;">المتوسط</th>
          <th style="padding:6px; border:1px solid #d1d5db;">الانحراف</th>
          <th style="padding:6px; border:1px solid #d1d5db;">التفسير</th>
        </tr>
      </thead>
      <tbody style="text-align:center">${qRows}</tbody>
    </table>

    <p style="margin-top:30px; font-size:11px; color:#9ca3af; text-align:center;">
      تم إنشاء هذا التقرير آلياً من منصة الاستبيان الأكاديمي.
    </p>
  </div>`;
}

export async function exportAnalysisToPDF(
  qStats: QuestionStat[],
  axisStats: AxisStat[],
  totals: { responses: number },
) {
  // Render Arabic content as HTML → canvas → multi-page PDF (preserves shaping & RTL)
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.innerHTML = buildReportHTML(qStats, axisStats, totals);
  document.body.appendChild(container);

  try {
    const node = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let heightLeft = imgH;
    let position = 0;
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;

    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
    }

    pdf.save(`analysis-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
