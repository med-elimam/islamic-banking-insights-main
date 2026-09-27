import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { AxisStat, QuestionStat } from "./statistics";

export type ResponseRow = {
  id: string;
  gender: string | null;
  age: string | null;
  education: string;
  bank: string;
  position: string;
  experience: string;
  islamic_training: string | null;
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
      الجنس: escapeFormula(r.gender),
      العمر: escapeFormula(r.age),
      المؤهل: escapeFormula(r.education),
      البنك: escapeFormula(r.bank),
      الوظيفة: escapeFormula(r.position),
      الخبرة: escapeFormula(r.experience),
      "تكوين في الصيرفة الإسلامية": escapeFormula(r.islamic_training),
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
    "% أوافق": +q.pct[3].toFixed(2),
    "% محايد": +q.pct[2].toFixed(2),
    "% لا أوافق": +q.pct[1].toFixed(2),
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
      
      .pdf-page {
        width: 800px !important;
        height: 1130px !important;
        padding: 40px !important;
        box-sizing: border-box !important;
        background: #ffffff !important;
        position: relative !important;
        overflow: hidden !important;
        margin-bottom: 20px !important;
        display: flex !important;
        flex-direction: column !important;
        font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif !important;
        color: #111827 !important;
        direction: rtl !important;
        text-align: right !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }
      
      .pdf-page * {
        box-shadow: none !important;
        text-shadow: none !important;
        text-decoration-color: transparent !important;
        outline-color: transparent !important;
      }
      
      .page-header {
        border-bottom: 3px solid #0f3d2e !important;
        padding-bottom: 12px !important;
        margin-bottom: 20px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-end !important;
      }
      
      .page-header h1 {
        margin: 0 !important;
        font-size: 24px !important;
        color: #0f3d2e !important;
        font-weight: 700 !important;
      }
      
      .page-header p {
        margin: 4px 0 0 0 !important;
        font-size: 12px !important;
        color: #4b5563 !important;
      }

      .page-title-badge {
        font-size: 11px !important;
        font-weight: 600 !important;
        background-color: #f8faf9 !important;
        color: #0f3d2e !important;
        padding: 4px 8px !important;
        border-radius: 4px !important;
        border: 1px solid #d1d5db !important;
      }
      
      .page-footer {
        position: absolute !important;
        bottom: 25px !important;
        left: 40px !important;
        right: 40px !important;
        border-top: 1px solid #d1d5db !important;
        padding-top: 10px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        font-size: 10px !important;
        color: #4b5563 !important;
      }
      
      /* Grid for cards */
      .stats-grid {
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 12px !important;
        margin-bottom: 20px !important;
      }
      
      .stat-card {
        border: 1px solid #d1d5db !important;
        border-radius: 8px !important;
        padding: 12px !important;
        background: #f8faf9 !important;
        text-align: center !important;
      }
      
      .stat-card .title {
        font-size: 11px !important;
        color: #4b5563 !important;
        margin-bottom: 4px !important;
        font-weight: 600 !important;
      }
      
      .stat-card .value {
        font-size: 20px !important;
        font-weight: 700 !important;
        color: #0f3d2e !important;
      }
      
      /* Charts styling */
      .chart-card {
        border: 1px solid #d1d5db !important;
        border-radius: 10px !important;
        padding: 16px !important;
        margin-bottom: 15px !important;
        background: #ffffff !important;
      }
      
      .chart-card-title {
        font-size: 14px !important;
        font-weight: 700 !important;
        color: #0f3d2e !important;
        margin-top: 0 !important;
        margin-bottom: 12px !important;
        border-bottom: 1px solid #d1d5db !important;
        padding-bottom: 6px !important;
      }
      
      .bar-row {
        display: flex !important;
        align-items: center !important;
        margin-bottom: 8px !important;
      }
      
      .bar-label {
        width: 140px !important;
        font-size: 11px !important;
        color: #111827 !important;
        text-align: right !important;
        padding-left: 10px !important;
        white-space: nowrap !important;
        overflow: hidden;
        text-overflow: ellipsis !important;
      }
      
      .bar-wrapper {
        flex-grow: 1 !important;
        background-color: #f8faf9 !important;
        height: 12px !important;
        border-radius: 3px !important;
        overflow: hidden !important;
        margin: 0 8px !important;
        border: 1px solid #d1d5db !important;
      }
      
      .bar-fill {
        height: 100% !important;
        border-radius: 3px !important;
      }
      
      .bar-value {
        width: 30px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        color: #111827 !important;
        text-align: left !important;
      }
      
      /* Table styling */
      table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin-bottom: 15px !important;
        font-size: 11px !important;
      }
      
      th {
        background-color: #0f3d2e !important;
        color: #ffffff !important;
        padding: 8px !important;
        border: 1px solid #d1d5db !important;
        font-weight: 600 !important;
        text-align: center !important;
      }
      
      td {
        padding: 6px !important;
        border: 1px solid #d1d5db !important;
        text-align: center !important;
        color: #111827 !important;
      }
      
      tr:nth-child(even) td {
        background-color: #f8faf9 !important;
      }
      
      .number-cell {
        font-family: monospace !important;
        font-size: 11px !important;
      }

      .open-answer-box {
        border-right: 3px solid #d4a637 !important;
        background-color: #f8faf9 !important;
        padding: 8px 12px !important;
        margin-bottom: 10px !important;
        border-radius: 0 4px 4px 0 !important;
        font-size: 11px !important;
        border-top: 1px solid #d1d5db !important;
        border-bottom: 1px solid #d1d5db !important;
        border-left: 1px solid #d1d5db !important;
      }

      .open-answers-container {
        margin-top: 10px !important;
      }

      .section-title {
        font-size: 15px !important;
        font-weight: 700 !important;
        color: #0f3d2e !important;
        margin-top: 0 !important;
        margin-bottom: 10px !important;
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

      <h3 class="section-title">إحصاءات تفصيلية للعبارات (العبارة 21 إلى 27)</h3>
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
  const elements = Array.from(container.getElementsByTagName("*"));
  elements.push(container); // Include the container itself

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

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;

    // Always force-disable shadows using !important inline styles to prevent color parser crashes
    el.style.setProperty("box-shadow", "none", "important");
    el.style.setProperty("text-shadow", "none", "important");
    el.style.setProperty("-webkit-box-shadow", "none", "important");

    const style = window.getComputedStyle(el);

    if (isUnsupported(style.color)) {
      el.style.setProperty("color", "#111827", "important");
    }

    if (isUnsupported(style.backgroundColor)) {
      const fallbackColor = el.tagName === "TH" ? "#0f3d2e" : "#ffffff";
      el.style.setProperty("background-color", fallbackColor, "important");
    }

    if (isUnsupported(style.borderTopColor))
      el.style.setProperty("border-top-color", "#d1d5db", "important");
    if (isUnsupported(style.borderBottomColor))
      el.style.setProperty("border-bottom-color", "#d1d5db", "important");
    if (isUnsupported(style.borderLeftColor))
      el.style.setProperty("border-left-color", "#d1d5db", "important");
    if (isUnsupported(style.borderRightColor))
      el.style.setProperty("border-right-color", "#d1d5db", "important");

    if (isUnsupported(style.fill)) {
      el.style.setProperty("fill", "#111827", "important");
    }
    if (isUnsupported(style.stroke)) {
      el.style.setProperty("stroke", "#d1d5db", "important");
    }
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
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "900px";
  iframe.style.height = "1200px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    throw new Error("Could not create PDF export sandbox");
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>PDF Export Sandbox</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }
        </style>
      </head>
      <body>
        ${buildReportHTML(params)}
      </body>
    </html>
  `);
  iframeDoc.close();

  try {
    // Wait for styling and fonts to render inside the iframe
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (iframeDoc.fonts) {
      await iframeDoc.fonts.ready;
    }

    // Run the styles sanitizer on the iframe content to remove any lab/oklch references
    sanitizePdfContainer(iframeDoc.body);

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageIds = ["page-1", "page-2", "page-3", "page-4"];

    for (let i = 0; i < pageIds.length; i++) {
      const pageEl = iframeDoc.getElementById(pageIds[i]);
      if (!pageEl) continue;

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
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
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }
}
