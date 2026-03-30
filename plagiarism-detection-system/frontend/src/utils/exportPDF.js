import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ── PALETTE ─────────────────────────────────────────────────────
const DARK       = [10, 15, 30];
const PAGE_BG    = [13, 18, 36];
const CARD       = [22, 30, 54];
const CARD_ALT   = [17, 24, 46];
const BORDER     = [38, 48, 78];
const WHITE      = [255, 255, 255];
const GRAY       = [118, 128, 158];
const LIGHT_GRAY = [175, 185, 210];
const INDIGO     = [99, 102, 241];
const PURPLE     = [139, 92, 246];
const URL_BLUE   = [96, 165, 250];

const riskColor = (s) => s >= 70 ? [239, 68, 68] : s >= 40 ? [249, 115, 22] : [34, 197, 94];
const riskLabel = (s) => s >= 70 ? "HIGH RISK" : s >= 40 ? "MODERATE RISK" : "LOW RISK";
const riskDesc  = (s) =>
  s >= 70
    ? "This document shows significant similarity to corpus sources. Immediate review is strongly recommended."
    : s >= 40
    ? "This document shows moderate similarity. Some sections may require further investigation."
    : "This document shows low similarity to corpus sources. Content appears largely original.";

// ── SERIES COUNTER ───────────────────────────────────────────────
function getNextReportNumber() {
  const key     = "lakshyaai_report_counter";
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  const next    = current + 1;
  localStorage.setItem(key, String(next));
  return String(next).padStart(3, "0");
}

// ── SAFE TEXT — single call, no duplicates ───────────────────────
function t(pdf, text, x, y, size, style, color, align = "left") {
  pdf.setFontSize(size);
  pdf.setFont("helvetica", style);
  pdf.setTextColor(...color);
  pdf.text(String(text), x, y, { align });
}

// ── DRAW HELPERS ─────────────────────────────────────────────────
function fillPage(pdf) {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  pdf.setFillColor(...PAGE_BG);
  pdf.rect(0, 0, W, H, "F");
}

function drawCard(pdf, x, y, w, h, bg = CARD) {
  pdf.setFillColor(...bg);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(x, y, w, h, 3, 3, "FD");
}

function drawPill(pdf, x, y, w, h, color) {
  pdf.setFillColor(...color);
  pdf.roundedRect(x, y, w, h, h / 2, h / 2, "F");
}

function sectionBanner(pdf, text, x, y, w) {
  pdf.setFillColor(24, 32, 62);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(x, y, w, 10, 2, 2, "FD");
  pdf.setFillColor(...INDIGO);
  pdf.roundedRect(x, y, 3, 10, 1, 1, "F");
  t(pdf, text.toUpperCase(), x + 8, y + 7, 8, "bold", INDIGO);
  return y + 15;
}

function checkPage(pdf, y, needed, margin) {
  if (y + needed > 272) {
    pdf.addPage();
    fillPage(pdf);
    return margin + 4;
  }
  return y;
}

// ── MAIN EXPORT ──────────────────────────────────────────────────
export async function exportReportAsPDF(result, elementId) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W   = pdf.internal.pageSize.getWidth();   // 210mm
  const M   = 16;                                  // margin
  const CW  = W - M * 2;                          // 178mm content width
  let   y   = 0;

  const reportNum = getNextReportNumber();
  const now       = new Date();
  const dateStr   = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr   = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // ── PAGE BACKGROUND ──────────────────────────────────────────
  fillPage(pdf);

  // ── HEADER BAND ──────────────────────────────────────────────
  const HDR = 58;
  pdf.setFillColor(14, 19, 42);
  pdf.rect(0, 0, W, HDR, "F");

  // Left accent — 4px wide, does NOT overlap text (text starts at M+8)
  pdf.setFillColor(...INDIGO);
  pdf.rect(0, 0, 4, HDR, "F");

  // Right accent — 4px wide on far right
  pdf.setFillColor(...PURPLE);
  pdf.rect(W - 4, 0, 4, HDR, "F");

  // ── LEFT SIDE: Brand ─────────────────────────────────────────
  const LX = M + 4; // 20mm from left — clear of accent bar
  t(pdf, "LakshyaAI",                          LX, 20, 22, "bold",   WHITE);
  t(pdf, "Plagiarism Detection & Analysis System", LX, 29, 8.5, "normal", GRAY);

  // Divider line — between brand and report title
  pdf.setDrawColor(...INDIGO);
  pdf.setLineWidth(0.4);
  pdf.line(LX, 33, W - M - 8, 33);
  pdf.setLineWidth(0.2);

  t(pdf, "PLAGIARISM ANALYSIS REPORT", LX, 42, 11, "bold",   INDIGO);
  t(pdf, `Report No: RPT-${reportNum}`,  LX, 50, 7.5, "normal", GRAY);

  // ── RIGHT SIDE: Meta — right-aligned, capped at W-M-8 ────────
  // Right edge stops at W-M-8 to avoid purple accent bar
  const RX = W - M - 8;

  t(pdf, `Generated : ${dateStr}`,               RX, 16, 7.5, "normal", GRAY,   "right");
  t(pdf, `Time      : ${timeStr}`,               RX, 23, 7.5, "normal", GRAY,   "right");
  t(pdf, `Mode      : ${result.mode.toUpperCase()}`, RX, 30, 7.5, "normal", GRAY, "right");
  t(pdf, `Website   : lackilohar.netlify.app`,   RX, 37, 7.5, "normal", GRAY,   "right");
  t(pdf, `Report    : RPT-${reportNum}`,         RX, 44, 7.5, "bold",   INDIGO, "right");

  y = HDR + 8;

  // ── DOCUMENT INFO CARD ───────────────────────────────────────
  const DOC_H = 32;
  drawCard(pdf, M, y, CW, DOC_H);

  t(pdf, "DOCUMENT INFORMATION", M + 6, y + 8, 7.5, "bold", INDIGO);

  // Left column: File Name
  const C1 = M + 6;
  // Right column: starts at midpoint
  const C2 = M + CW / 2 + 4;

  t(pdf, "File Name",      C1, y + 15, 7,   "normal", GRAY);
  t(pdf, "Detection Mode", C2, y + 15, 7,   "normal", GRAY);

  const docName = result.document.length > 38 ? result.document.slice(0, 38) + "…" : result.document;
  t(pdf, docName,                   C1, y + 23, 8.5, "bold", WHITE);
  t(pdf, result.mode.toUpperCase(), C2, y + 23, 8.5, "bold", WHITE);

  // Analysis date — below Detection Mode, no overlap
  t(pdf, "Analysis Date", C2, y + 28, 7,   "normal", GRAY);
  // Note: date goes on next line inside card — extend card if needed
  // Card is 32mm tall; row at y+28 label, y+34 value would overflow
  // So place date value on same row as label, right side only
  t(pdf, dateStr,         C2 + 28, y + 28, 7.5, "bold", WHITE);

  y += DOC_H + 8;

  // ── SCORE OVERVIEW CARD ──────────────────────────────────────
  const score = result.top_similarity;
  const color = riskColor(score);
  const label = riskLabel(score);
  const desc  = riskDesc(score);

  const SCORE_H = 52;
  drawCard(pdf, M, y, CW, SCORE_H);

  // Score donut — left side
  const cx = M + 28;
  const cy = y + SCORE_H / 2;
  pdf.setFillColor(...color);
  pdf.circle(cx, cy, 18, "F");
  pdf.setFillColor(...CARD);
  pdf.circle(cx, cy, 12, "F");
  // Score text — centered in donut, ONE call only
  t(pdf, `${score}%`, cx, cy + 4, 10, "bold", color, "center");

  // Risk pill — next to donut
  const PX = M + 54;
  const PY = y + 8;
  drawPill(pdf, PX, PY, 48, 11, color);
  t(pdf, label, PX + 24, PY + 8, 7.5, "bold", DARK, "center");

  // Description — below pill
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...LIGHT_GRAY);
  const descLines = pdf.splitTextToSize(desc, 88);
  pdf.text(descLines, PX, y + 25);

  // Right stats — separated by vertical divider
  const SX = W - M - 50;
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.3);
  pdf.line(SX - 5, y + 6, SX - 5, y + SCORE_H - 6);
  pdf.setLineWidth(0.2);

  t(pdf, "Sources Matched",          SX, y + 12, 7,  "normal", GRAY);
  t(pdf, String(result.matches.length), SX, y + 24, 18, "bold",   INDIGO);
  t(pdf, "Highest Similarity",       SX, y + 34, 7,  "normal", GRAY);
  t(pdf, `${score}%`,                SX, y + 46, 14, "bold",   color);

  y += SCORE_H + 8;

  // ── SIMILARITY PROGRESS BAR ──────────────────────────────────
  y = sectionBanner(pdf, "Similarity Score Breakdown", M, y, CW);

  // Track
  pdf.setFillColor(...CARD);
  pdf.roundedRect(M, y, CW, 10, 2, 2, "F");

  // Fill
  const fillW = Math.max((score / 100) * CW, 8);
  pdf.setFillColor(...color);
  pdf.roundedRect(M, y, fillW, 10, 2, 2, "F");

  // Score label — inside bar if wide enough, else outside
  if (fillW > 20) {
    t(pdf, `${score}%`, M + fillW - 3, y + 7, 7, "bold", WHITE, "right");
  } else {
    t(pdf, `${score}%`, M + fillW + 3, y + 7, 7, "bold", color);
  }

  y += 14;

  // Legend — 3 items evenly spaced
  const legendItems = [
    { label: "Low Risk   0%–39%",   color: [34, 197, 94]  },
    { label: "Moderate  40%–69%",   color: [249, 115, 22] },
    { label: "High Risk  70%–100%", color: [239, 68, 68]  },
  ];
  const LW = CW / 3;
  legendItems.forEach((z, i) => {
    const lx = M + i * LW;
    pdf.setFillColor(...z.color);
    pdf.roundedRect(lx, y, 8, 5, 1, 1, "F");
    t(pdf, z.label, lx + 11, y + 4.5, 7.5, "normal", GRAY);
  });

  y += 12;

  // ── MATCHED SOURCES ──────────────────────────────────────────
  y = checkPage(pdf, y, 20, M);
  y = sectionBanner(pdf, `Matched Sources — Full Detail  (${result.matches.length} found)`, M, y, CW);

  if (result.matches.length === 0) {
    drawCard(pdf, M, y, CW, 14);
    t(pdf, "No matching sources found in corpus.", M + CW / 2, y + 9, 9, "normal", GRAY, "center");
    y += 20;
  } else {
    result.matches.forEach((match, i) => {
      const sc    = match.similarity;
      const mc    = riskColor(sc);
      const ml    = riskLabel(sc);
      const urlText = match.url || match.source_url || "";
      const isURL   = match.source_type === "url" || urlText.startsWith("http");

      // Pre-calc URL lines for card height
      let urlLines = [];
      if (isURL && urlText) {
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        urlLines = pdf.splitTextToSize(urlText, CW - 30);
      }

      // Pre-calc filename lines
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      const fnLines = pdf.splitTextToSize(match.filename, CW - 70);

      // Card height: 10 (top pad) + fnLines*5 + 8 (type row) + urlLines*5 + 8 (bottom pad)
      const CARD_H = 10 + fnLines.length * 5 + 8 + (urlLines.length > 0 ? urlLines.length * 5 + 4 : 0) + 8;

      y = checkPage(pdf, y, CARD_H + 5, M);

      // Card
      drawCard(pdf, M, y, CW, CARD_H, i % 2 === 0 ? CARD : CARD_ALT);

      // Left color strip
      pdf.setFillColor(...mc);
      pdf.roundedRect(M, y, 4, CARD_H, 2, 2, "F");

      // Index badge
      pdf.setFillColor(30, 40, 72);
      pdf.roundedRect(M + 8, y + 5, 12, 9, 2, 2, "F");
      t(pdf, `#${i + 1}`, M + 14, y + 11, 7.5, "bold", GRAY, "center");

      // Filename — full, wrapped
      const FN_Y = y + 12;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...WHITE);
      pdf.text(fnLines, M + 24, FN_Y);

      // Risk pill — top right, clear of right accent
      const PILL_W = 36;
      drawPill(pdf, W - M - PILL_W - 6, y + 5, PILL_W, 9, mc);
      t(pdf, ml, W - M - PILL_W / 2 - 6, y + 11, 6.5, "bold", DARK, "center");

      // Score — below risk pill
      t(pdf, `${sc}%`, W - M - 6, y + 26, 13, "bold", mc, "right");

      // Type row — below filename lines
      const TYPE_Y = FN_Y + fnLines.length * 5 + 4;
      t(pdf, "Source Type:", M + 24, TYPE_Y, 7, "normal", GRAY);
      t(pdf, match.source_type || "file", M + 52, TYPE_Y, 7, "bold", LIGHT_GRAY);

      // URL row — below type row
      if (urlLines.length > 0) {
        const URL_Y = TYPE_Y + 7;
        t(pdf, "URL:", M + 24, URL_Y, 7, "bold", GRAY);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...URL_BLUE);
        pdf.text(urlLines, M + 36, URL_Y);
      }

      y += CARD_H + 5;
    });
  }

  y += 4;

  // ── VISUAL CHART ─────────────────────────────────────────────
  const chartEl = document.getElementById(elementId);
  if (chartEl) {
    try {
      y = checkPage(pdf, y, 85, M);
      y = sectionBanner(pdf, "Visual Similarity Chart", M, y, CW);
      const canvas  = await html2canvas(chartEl, { backgroundColor: "#0a0f1e", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const IMG_H   = 72;
      drawCard(pdf, M, y, CW, IMG_H + 4);
      pdf.addImage(imgData, "PNG", M + 2, y + 2, CW - 4, IMG_H);
      y += IMG_H + 10;
    } catch (e) {
      console.warn("Chart capture failed", e);
    }
  }

  // ── SUMMARY STATISTICS ───────────────────────────────────────
  y = checkPage(pdf, y, 55, M);
  y = sectionBanner(pdf, "Summary Statistics", M, y, CW);

  const highRisk = result.matches.filter(m => m.similarity >= 70).length;
  const medRisk  = result.matches.filter(m => m.similarity >= 40 && m.similarity < 70).length;
  const lowRisk  = result.matches.filter(m => m.similarity < 40).length;
  const avgScore = result.matches.length
    ? (result.matches.reduce((a, m) => a + m.similarity, 0) / result.matches.length).toFixed(1)
    : "0.0";

  const stats = [
    { label: "Total Matches",  value: String(result.matches.length), color: WHITE          },
    { label: "High Risk",      value: String(highRisk),              color: [239, 68, 68]  },
    { label: "Moderate Risk",  value: String(medRisk),               color: [249, 115, 22] },
    { label: "Low Risk",       value: String(lowRisk),               color: [34, 197, 94]  },
    { label: "Average Score",  value: `${avgScore}%`,                color: INDIGO         },
    { label: "Top Score",      value: `${score}%`,                   color                 },
  ];

  const STAT_GAP = 4;
  const STAT_W   = (CW - STAT_GAP * 2) / 3;
  const STAT_H   = 22;

  stats.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const sx  = M + col * (STAT_W + STAT_GAP);
    const sy  = y + row * (STAT_H + STAT_GAP);
    drawCard(pdf, sx, sy, STAT_W, STAT_H);
    t(pdf, s.label, sx + 5, sy + 9,  7,    "normal", GRAY);
    t(pdf, s.value, sx + 5, sy + 18, 11.5, "bold",   s.color);
  });

  y += 2 * (STAT_H + STAT_GAP) + 8;

  // ── DISCLAIMER ───────────────────────────────────────────────
  y = checkPage(pdf, y, 26, M);
  pdf.setFillColor(20, 26, 50);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(M, y, CW, 22, 2, 2, "FD");
  t(pdf, "DISCLAIMER", M + 6, y + 8, 7.5, "bold", GRAY);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(95, 105, 138);
  const disclaimer =
    "This report is generated automatically by LakshyaAI Plagiarism Detection System. " +
    "Results are based on corpus comparison and should be reviewed by a qualified professional " +
    "before taking any action. Similarity scores indicate textual overlap and do not constitute " +
    "legal proof of plagiarism.";
  pdf.text(pdf.splitTextToSize(disclaimer, CW - 12), M + 6, y + 15);

  // ── FOOTER ON ALL PAGES ──────────────────────────────────────
  const totalPages = pdf.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    const PH = pdf.internal.pageSize.getHeight();
    pdf.setFillColor(14, 19, 42);
    pdf.rect(0, PH - 12, W, 12, "F");
    pdf.setDrawColor(...INDIGO);
    pdf.setLineWidth(0.3);
    pdf.line(0, PH - 12, W, PH - 12);
    pdf.setLineWidth(0.2);
    t(pdf,
      `LakshyaAI Plagiarism Detection System  ·  lackilohar.netlify.app  ·  RPT-${reportNum}`,
      M, PH - 4, 6.5, "normal", GRAY
    );
    t(pdf, `Page ${p} / ${totalPages}`, W - M, PH - 4, 6.5, "normal", GRAY, "right");
  }

  // ── FILE NAME ────────────────────────────────────────────────
  const safeDoc = result.document
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20)
    .toLowerCase();

  const fileDateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  pdf.save(`LakshyaAI_Report_${safeDoc}_RPT${reportNum}_${fileDateStr}.pdf`);
}
