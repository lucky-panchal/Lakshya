# LakshyaAI — Plagiarism Detection System

> Built by **Lacki Lohar** · [lackilohar.netlify.app](https://lackilohar.netlify.app)

A full-stack AI-powered plagiarism detection system with a professional React frontend and FastAPI backend. Supports file uploads, URL scraping, and direct text input with TF-IDF and BERT-based detection modes.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Tailwind CSS, Framer Motion           |
| UI System | Custom ProfessionalLayout design system         |
| Charts    | Recharts                                        |
| PDF       | jsPDF + html2canvas                             |
| Icons     | Lucide React                                    |
| Backend   | FastAPI, Python                                 |
| Database  | SQLite (corpus.db)                              |
| NLP       | TF-IDF (scikit-learn), BERT (transformers)      |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Sticky navbar — logo left, nav center, status right
│   │   ├── Footer.jsx              # Footer — copyright left, creator center, links right
│   │   ├── ScoreRing.jsx           # Circular similarity score ring
│   │   ├── SimilarityChart.jsx     # Bar chart for matched sources
│   │   ├── HighlightViewer.jsx     # Sentence-level highlight modal
│   │   ├── ProfessionalLayout.jsx  # Design system — layout, cards, buttons, badges, grid
│   │   └── ResultDisplayOptions.jsx # 3-mode result viewer (Summary / Detailed / Visual)
│   ├── pages/
│   │   ├── Check.jsx               # Main plagiarism check page
│   │   ├── Corpus.jsx              # Corpus manager — upload files & URLs
│   │   └── Results.jsx             # Check history with stats
│   ├── utils/
│   │   └── exportPDF.js            # Full PDF report generator with series naming
│   ├── App.jsx                     # Router + animated page transitions
│   ├── api.js                      # Axios API calls to FastAPI backend
│   └── index.css                   # Global styles, glass effects, design tokens
```

---

## Pages

### Check (`/`)
- Upload **PDF / DOCX / TXT** files, paste a **URL**, or type/paste **text** directly
- Choose detection mode: **TF-IDF** (fast, exact) or **BERT** (deep, paraphrase-aware)
- Adjustable **similarity threshold** with alert banner when exceeded
- **3 result display modes** — switchable by user:
  - **Quick Summary** — score, source count, top match at a glance
  - **Detailed View** — full breakdown with two-column document info
  - **Visual Dashboard** — score gauge, risk distribution, progress bars per match
- Inline **sentence-level match preview** against top corpus document
- **Export PDF report** directly from results

### Corpus (`/corpus`)
- Drag & drop or click to upload multiple files at once
- Add web pages by URL (scraped automatically)
- View all corpus documents with source type badges
- Delete individual documents on hover

### History (`/results`)
- Full history of all past checks
- Stats row: total checks, average similarity, high-risk count
- Color-coded risk badges per result
- Delete individual results or clear all history

---

## Design System — `ProfessionalLayout.jsx`

Reusable components used across all pages:

| Component             | Purpose                                              |
|-----------------------|------------------------------------------------------|
| `ProfessionalLayout`  | Page container with `fullWidth` and `compact` options |
| `ProfessionalHeader`  | 3-column header — left title, center slot, right actions |
| `ProfessionalSection` | Flex row with `alignment` (left/center/right/between) and `spacing` |
| `ProfessionalCard`    | Glass card with optional hover lift effect           |
| `ProfessionalButton`  | Primary / secondary button with size variants        |
| `ProfessionalGrid`    | Responsive grid with col and gap presets             |
| `ProfessionalBadge`   | Color-coded status badge (default/success/warning/error/info) |

---

## PDF Export — `exportPDF.js`

Generates a fully detailed A4 dark-theme PDF report with:

- **Header band** — LakshyaAI branding, report metadata (date, time, mode, website)
- **Report series numbering** — `RPT-001`, `RPT-002`... persisted in `localStorage`
- **Document info card** — filename, detection mode, analysis date
- **Score overview card** — donut ring, risk pill, description, stats block
- **Similarity progress bar** — visual fill with risk legend
- **Matched sources** — one card per match, full filename (no truncation), full URL in light blue, source type, similarity score with color-coded risk pill
- **Visual chart** — captured from the live Recharts component via `html2canvas`
- **Summary statistics** — 6-cell grid (total, high/medium/low risk, average, top score)
- **Disclaimer** block
- **Footer** on every page — system name, website, report number, page count

**File naming format:**
```
LakshyaAI_Report_<docname>_RPT001_20250330.pdf
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Frontend
```bash
cd frontend
npm install
npm start
```
Runs at [http://localhost:3000](http://localhost:3000)

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Runs at [http://localhost:8000](http://localhost:8000)

---

## Available Scripts

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm start`     | Start development server           |
| `npm run build` | Build for production               |
| `npm test`      | Run test suite                     |

---

## Environment Variables

Create `backend/.env`:
```
DATABASE_URL=sqlite:///./corpus.db
```

---

## Author

**Lacki Lohar**
- Portfolio: [lackilohar.netlify.app](https://lackilohar.netlify.app)
- LinkedIn: [linkedin.com/in/lacki-lohar-463a23321](https://in.linkedin.com/in/lacki-lohar-463a23321)
- GitHub: [github.com/lucky-panchal](https://github.com/lucky-panchal)

---

© 2026 LakshyaAI · Plagiarism Detection System
