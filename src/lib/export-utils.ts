import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { AxisStat, QuestionStat } from "./statistics";

export type ResponseRow = {
  id: string;
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

function escapeFormula(val: unknown): unknown {
  if (typeof val === "string" && /^[=+\-@]/.test(val)) {
    return `'${val}`;
  }
  return val;
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
      المؤهل: escapeFormula(r.education),
      البنك: escapeFormula(r.bank),
      الوظيفة: escapeFormula(r.position),
      الخبرة: escapeFormula(r.experience),
      "الإجابة المفتوحة": escapeFormula(r.open_answer ?? ""),
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
      البنك: escapeFormula(r.bank),
      الوظيفة: escapeFormula(r.position),
      "الإجابة المفتوحة": escapeFormula(r.open_answer),
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

function buildReportHTML(params: {
  responses: ResponseRow[];
  qStats: QuestionStat[];
  axisStats: AxisStat[];
  byBank: { name: string; value: number }[];
  byPosition: { name: string; value: number }[];
  byExperience: { name: string; value: number }[];
  totals: {
    responses: number;
    banks: number;
    positions: number;
    mean: number;
  };
}): string {
  const now = new Date().toLocaleString("ar");
  const totals = params.totals;
  const byBank = params.byBank;
  const byPosition = params.byPosition;
  const byExperience = params.byExperience;
  const responses = params.responses;
  const axisStats = params.axisStats;
  const qStats = params.qStats;

  // Chart 1: By Bank
  const maxBank = Math.max(...byBank.map((b) => b.value), 1);
  const bankBars = byBank
    .map((b) => {
      const pct = (b.value / maxBank) * 100;
      return `
      <div class="bar-row">
        <div class="bar-label">${escapeHtml(b.name)}</div>
        <div class="bar-wrapper">
          <div class="bar-fill" style="width: ${pct}%; background-color: #0f3d2e;"></div>
        </div>
        <div class="bar-value">${b.value}</div>
      </div>
    `;
    })
    .join("");

  // Chart 2: By Position
  const maxPos = Math.max(...byPosition.map((p) => p.value), 1);
  const posBars = byPosition
    .map((p) => {
      const pct = (p.value / maxPos) * 100;
      return `
      <div class="bar-row">
        <div class="bar-label">${escapeHtml(p.name)}</div>
        <div class="bar-wrapper">
          <div class="bar-fill" style="width: ${pct}%; background-color: #d4a637;"></div>
        </div>
        <div class="bar-value">${p.value}</div>
      </div>
    `;
    })
    .join("");

  // Chart 3: By Experience
  const maxExp = Math.max(...byExperience.map((e) => e.value), 1);
  const expBars = byExperience
    .map((e) => {
      const pct = (e.value / maxExp) * 100;
      return `
      <div class="bar-row">
        <div class="bar-label">${escapeHtml(e.name)}</div>
        <div class="bar-wrapper">
          <div class="bar-fill" style="width: ${pct}%; background-color: #3d7da6;"></div>
        </div>
        <div class="bar-value">${e.value}</div>
      </div>
    `;
    })
    .join("");

  // Responses Table (recent 15)
  const recentResponses = responses.slice(0, 15);
  const responseRows = recentResponses
    .map(
      (r) => `
    <tr>
      <td>${new Date(r.created_at).toLocaleDateString("ar")}</td>
      <td>${escapeHtml(r.education)}</td>
      <td>${escapeHtml(r.bank)}</td>
      <td>${escapeHtml(r.position)}</td>
      <td>${escapeHtml(r.experience)}</td>
    </tr>
  `,
    )
    .join("");

  // Open responses summary (up to 4)
  const openResponses = responses.filter((r) => r.open_answer && r.open_answer.trim()).slice(0, 4);
  const openRows = openResponses
    .map(
      (r) => `
    <div class="open-answer-box">
      <strong>${escapeHtml(r.bank)} - ${escapeHtml(r.position)}:</strong>
      <p style="margin: 4px 0 0 0; font-style: italic;">"${escapeHtml(r.open_answer || "")}"</p>
    </div>
  `,
    )
    .join("");

  // Axis stats rows
  const axisRows = axisStats
    .map(
      (a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="text-align: right; font-weight: 600;">${escapeHtml(a.name)}</td>
      <td>${a.count}</td>
      <td class="number-cell">${a.mean.toFixed(3)}</td>
      <td class="number-cell">${a.std.toFixed(3)}</td>
      <td>${escapeHtml(a.interpretation.label)}</td>
    </tr>
  `,
    )
    .join("");

  // Questions stats part 1 (first 20)
  const qRows1 = qStats
    .slice(0, 20)
    .map(
      (q) => `
    <tr>
      <td>${q.number}</td>
      <td style="text-align: right;">${escapeHtml(q.text)}</td>
      <td>${q.count}</td>
      <td class="number-cell">${q.mean.toFixed(2)}</td>
      <td class="number-cell">${q.std.toFixed(2)}</td>
      <td>${escapeHtml(q.interpretation.label)}</td>
    </tr>
  `,
    )
    .join("");

  // Questions stats part 2 (remaining 19)
  const qRows2 = qStats
    .slice(20)
    .map(
      (q) => `
    <tr>
      <td>${q.number}</td>
      <td style="text-align: right;">${escapeHtml(q.text)}</td>
      <td>${q.count}</td>
      <td class="number-cell">${q.mean.toFixed(2)}</td>
      <td class="number-cell">${q.std.toFixed(2)}</td>
      <td>${escapeHtml(q.interpretation.label)}</td>
    </tr>
  `,
    )
    .join("");

  return `
  <div class="pdf-container">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
      
      .pdf-container {
        font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif;
        color: #111827;
        background-color: #f8faf9;
        direction: rtl;
        text-align: right;
      }
      
      .pdf-page {
        width: 800px;
        height: 1130px;
        padding: 40px;
        box-sizing: border-box;
        background: #ffffff;
        position: relative;
        overflow: hidden;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
      }
      
      .page-header {
        border-bottom: 3px solid #0f3d2e;
        padding-bottom: 12px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      
      .page-header h1 {
        margin: 0;
        font-size: 24px;
        color: #0f3d2e;
        font-weight: 700;
      }
      
      .page-header p {
        margin: 4px 0 0 0;
        font-size: 12px;
        color: #4b5563;
      }

      .page-title-badge {
        font-size: 11px;
        font-weight: 600;
        background-color: #f8faf9;
        color: #0f3d2e;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #d1d5db;
      }
      
      .page-footer {
        position: absolute;
        bottom: 25px;
        left: 40px;
        right: 40px;
        border-top: 1px solid #d1d5db;
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
        color: #4b5563;
      }
      
      /* Grid for cards */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .stat-card {
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 12px;
        background: #f8faf9;
        text-align: center;
      }
      
      .stat-card .title {
        font-size: 11px;
        color: #4b5563;
        margin-bottom: 4px;
        font-weight: 600;
      }
      
      .stat-card .value {
        font-size: 20px;
        font-weight: 700;
        color: #0f3d2e;
      }
      
      /* Charts styling */
      .chart-card {
        border: 1px solid #d1d5db;
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 15px;
        background: #ffffff;
      }
      
      .chart-card-title {
        font-size: 14px;
        font-weight: 700;
        color: #0f3d2e;
        margin-top: 0;
        margin-bottom: 12px;
        border-bottom: 1px solid #d1d5db;
        padding-bottom: 6px;
      }
      
      .bar-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .bar-label {
        width: 140px;
        font-size: 11px;
        color: #111827;
        text-align: right;
        padding-left: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .bar-wrapper {
        flex-grow: 1;
        background-color: #f8faf9;
        height: 12px;
        border-radius: 3px;
        overflow: hidden;
        margin: 0 8px;
        border: 1px solid #d1d5db;
      }
      
      .bar-fill {
        height: 100%;
        border-radius: 3px;
      }
      
      .bar-value {
        width: 30px;
        font-size: 11px;
        font-weight: 600;
        color: #111827;
        text-align: left;
      }
      
      /* Table styling */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        font-size: 11px;
      }
      
      th {
        background-color: #0f3d2e;
        color: #ffffff;
        padding: 8px;
        border: 1px solid #d1d5db;
        font-weight: 600;
        text-align: center;
      }
      
      td {
        padding: 6px;
        border: 1px solid #d1d5db;
        text-align: center;
        color: #111827;
      }
      
      tr:nth-child(even) td {
        background-color: #f8faf9;
      }
      
      .number-cell {
        font-family: monospace;
        font-size: 11px;
      }

      .open-answer-box {
        border-right: 3px solid #d4a637;
        background-color: #f8faf9;
        padding: 8px 12px;
        margin-bottom: 10px;
        border-radius: 0 4px 4px 0;
        font-size: 11px;
        border-top: 1px solid #d1d5db;
        border-bottom: 1px solid #d1d5db;
        border-left: 1px solid #d1d5db;
      }

      .open-answers-container {
        margin-top: 10px;
      }

      .section-title {
        font-size: 15px;
        font-weight: 700;
        color: #0f3d2e;
        margin-top: 0;
        margin-bottom: 10px;
      }
    </style>

    <!-- PAGE 1: Summary, stats cards & charts -->
    <div class="pdf-page" id="page-1">
      <div class="page-header">
        <div>
          <h1>تقرير نتائج الاستبيان</h1>
          <p>تحول البنوك التقليدية إلى بنوك إسلامية في موريتانيا — الواقع والتحديات</p>
        </div>
        <div class="page-title-badge">ملخص الإحصاءات العامة</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="title">إجمالي الاستجابات</div>
          <div class="value">${totals.responses}</div>
        </div>
        <div class="stat-card">
          <div class="title">عدد البنوك الممثلة</div>
          <div class="value">${totals.banks}</div>
        </div>
        <div class="stat-card">
          <div class="title">الوظائف الممثلة</div>
          <div class="value">${totals.positions}</div>
        </div>
        <div class="stat-card">
          <div class="title">المتوسط الكلي للمحاور</div>
          <div class="value">${totals.mean}</div>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-card-title">توزيع الاستجابات حسب البنك</h3>
        ${bankBars}
      </div>

      <div class="chart-card">
        <h3 class="chart-card-title">توزيع الاستجابات حسب الوظيفة</h3>
        ${posBars}
      </div>

      <div class="chart-card">
        <h3 class="chart-card-title">توزيع الاستجابات حسب سنوات الخبرة</h3>
        ${expBars}
      </div>

      <div class="page-footer">
        <span>تاريخ التقرير: ${now}</span>
        <span>صفحة 1 من 4</span>
      </div>
    </div>

    <!-- PAGE 2: Responses table and open text responses -->
    <div class="pdf-page" id="page-2">
      <div class="page-header">
        <div>
          <h1>تقرير نتائج الاستبيان</h1>
          <p>تحول البنوك التقليدية إلى بنوك إسلامية في موريتانيا — الواقع والتحديات</p>
        </div>
        <div class="page-title-badge">قائمة الاستجابات والآراء المفتوحة</div>
      </div>

      <h3 class="section-title">سجل آخر 15 استجابة واردة</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 15%">التاريخ</th>
            <th style="width: 20%">المؤهل العلمي</th>
            <th style="width: 20%">البنك</th>
            <th style="width: 25%">الوظيفة</th>
            <th style="width: 20%">سنوات الخبرة</th>
          </tr>
        </thead>
        <tbody>
          ${responseRows || '<tr><td colspan="5" style="text-align: center;">لا توجد استجابات متوفرة حالياً</td></tr>'}
        </tbody>
      </table>

      <div class="open-answers-container">
        <h3 class="section-title">عينة من المقترحات والتعليقات المفتوحة</h3>
        ${openRows || '<div style="font-size: 11px; color: #6b7280; font-style: italic;">لا توجد مقترحات مكتوبة بعد.</div>'}
      </div>

      <div class="page-footer">
        <span>تاريخ التقرير: ${now}</span>
        <span>صفحة 2 من 4</span>
      </div>
    </div>

    <!-- PAGE 3: Axis stats and Question stats part 1 -->
    <div class="pdf-page" id="page-3">
      <div class="page-header">
        <div>
          <h1>تقرير نتائج الاستبيان</h1>
          <p>تحول البنوك التقليدية إلى بنوك إسلامية في موريتانيا — الواقع والتحديات</p>
        </div>
        <div class="page-title-badge">تحليل إحصاءات المحاور والعبارات - الجزء 1</div>
      </div>

      <h3 class="section-title">ترتيب المحاور وفق المتوسط الحسابي العام</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 8%">#</th>
            <th style="width: 50%; text-align: right;">المحور</th>
            <th style="width: 10%">العدد</th>
            <th style="width: 11%">المتوسط</th>
            <th style="width: 11%">الانحراف</th>
            <th style="width: 10%">التفسير</th>
          </tr>
        </thead>
        <tbody>
          ${axisRows}
        </tbody>
      </table>

      <h3 class="section-title">إحصاءات تفصيلية للعبارات (العبارة 1 إلى 20)</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 8%">رقم</th>
            <th style="width: 54%; text-align: right;">نص العبارة</th>
            <th style="width: 8%">العدد</th>
            <th style="width: 10%">المتوسط</th>
            <th style="width: 10%">الانحراف</th>
            <th style="width: 10%">التفسير</th>
          </tr>
        </thead>
        <tbody>
          ${qRows1}
        </tbody>
      </table>

      <div class="page-footer">
        <span>تاريخ التقرير: ${now}</span>
        <span>صفحة 3 من 4</span>
      </div>
    </div>

    <!-- PAGE 4: Question stats part 2 -->
    <div class="pdf-page" id="page-4">
      <div class="page-header">
        <div>
          <h1>تقرير نتائج الاستبيان</h1>
          <p>تحول البنوك التقليدية إلى بنوك إسلامية في موريتانيا — الواقع والتحديات</p>
        </div>
        <div class="page-title-badge">تحليل إحصاءات العبارات - الجزء 2</div>
      </div>

      <h3 class="section-title">إحصاءات تفصيلية للعبارات (العبارة 21 إلى 39)</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 8%">رقم</th>
            <th style="width: 54%; text-align: right;">نص العبارة</th>
            <th style="width: 8%">العدد</th>
            <th style="width: 10%">المتوسط</th>
            <th style="width: 10%">الانحراف</th>
            <th style="width: 10%">التفسير</th>
          </tr>
        </thead>
        <tbody>
          ${qRows2}
        </tbody>
      </table>

      <div class="page-footer">
        <span>تاريخ التقرير: ${now}</span>
        <span>صفحة 4 من 4</span>
      </div>
    </div>
  </div>
  `;
}

function sanitizePdfContainer(container: HTMLElement) {
  const elements = container.getElementsByTagName("*");
  const isUnsupported = (val: string | null): boolean => {
    if (!val) return false;
    const lower = val.toLowerCase();
    return (
      lower.includes("lab(") ||
      lower.includes("oklab(") ||
      lower.includes("lch(") ||
      lower.includes("oklch(") ||
      lower.includes("color-mix(")
    );
  };

  // Check the container itself
  const containerStyle = window.getComputedStyle(container);
  if (isUnsupported(containerStyle.backgroundColor)) {
    container.style.backgroundColor = "#f8faf9";
  }

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    const style = window.getComputedStyle(el);

    if (isUnsupported(style.color)) {
      el.style.color = "#111827";
    }

    if (isUnsupported(style.backgroundColor)) {
      el.style.backgroundColor = el.tagName === "TH" ? "#0f3d2e" : "#ffffff";
    }

    if (isUnsupported(style.borderTopColor)) el.style.borderTopColor = "#d1d5db";
    if (isUnsupported(style.borderBottomColor)) el.style.borderBottomColor = "#d1d5db";
    if (isUnsupported(style.borderLeftColor)) el.style.borderLeftColor = "#d1d5db";
    if (isUnsupported(style.borderRightColor)) el.style.borderRightColor = "#d1d5db";
  }
}

export async function exportAnalysisToPDF(params: {
  responses: ResponseRow[];
  qStats: QuestionStat[];
  axisStats: AxisStat[];
  byBank: { name: string; value: number }[];
  byPosition: { name: string; value: number }[];
  byExperience: { name: string; value: number }[];
  totals: {
    responses: number;
    banks: number;
    positions: number;
    mean: number;
  };
}) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.innerHTML = buildReportHTML(params);
  document.body.appendChild(container);

  try {
    // Wait for styling and fonts to render
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts.ready;
    }

    // Run the styles sanitizer to remove any lab/oklch color references
    sanitizePdfContainer(container);

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageIds = ["page-1", "page-2", "page-3", "page-4"];

    for (let i = 0; i < pageIds.length; i++) {
      const pageEl = document.getElementById(pageIds[i]);
      if (!pageEl) continue;

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
    }

    pdf.save("survey-dashboard-report.pdf");
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
