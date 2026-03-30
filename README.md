# LakshyaAI — Plagiarism Detection System

A full-stack plagiarism detection system built with FastAPI and React. The system allows users to build a reference corpus from files, URLs, and raw text, then check any document against that corpus using NLP-based similarity algorithms. Designed for academic institutions, content platforms, and research environments.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [NLP Algorithms](#nlp-algorithms)
- [Features](#features)
- [Backend](#backend)
  - [API Endpoints](#api-endpoints)
  - [Services](#services)
  - [Database Schema](#database-schema)
- [Frontend](#frontend)
  - [Pages](#pages)
  - [Components](#components)
- [Installation and Setup](#installation-and-setup)
- [Running the Project](#running-the-project)
- [Workflow](#workflow)
- [Accuracy and Limitations](#accuracy-and-limitations)
- [Author](#author)

---

## Overview

LakshyaAI is a closed-corpus plagiarism detection system. Unlike commercial tools such as Turnitin, which check against the entire internet and academic databases, this system operates on a user-defined corpus. Users upload reference documents — PDFs, DOCX files, plain text files, or web URLs — which form the comparison base. Any submitted document is then analyzed against this corpus and assigned a similarity score per reference document.

The system supports two detection modes:

- **TF-IDF with Cosine Similarity** — a statistical approach that measures term frequency and inverse document frequency to identify lexical overlap between documents.
- **BERT Sentence Embeddings** — a deep learning approach using the `all-MiniLM-L6-v2` transformer model that understands semantic meaning, enabling detection of paraphrased or restructured content.

---

## System Architecture

```
Client (React)
     |
     | HTTP (REST API)
     v
FastAPI Backend
     |
     |-- Parser Service       → Extracts text from PDF, DOCX, TXT, URL
     |-- Similarity Service   → TF-IDF or BERT comparison engine
     |-- Corpus Manager       → SQLite read/write for corpus and results
     |
     v
SQLite Database
     |-- corpus table         → Stores reference documents
     |-- results table        → Stores check history
```

The frontend communicates with the backend exclusively through REST API calls. The backend is stateless per request — all persistence is handled through SQLite. BERT model is lazily loaded on first use to avoid startup overhead.

---

## Project Structure

```
plagiarism-detection-system/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point, CORS, router registration
│   │   ├── routes/
│   │   │   ├── upload.py            # Endpoints for uploading files and URLs to corpus
│   │   │   ├── check.py             # Endpoints for running plagiarism checks
│   │   │   └── corpus.py            # Endpoints for listing and deleting corpus documents
│   │   ├── services/
│   │   │   ├── parser.py            # Text extraction from PDF, DOCX, TXT, URL
│   │   │   ├── similarity.py        # TF-IDF and BERT similarity computation
│   │   │   ├── highlighter.py       # Sentence-level tokenization and match analysis
│   │   │   └── corpus_manager.py    # All database read/write operations
│   │   └── models/
│   │       └── db.py                # SQLite connection and table initialization
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation — logo left, nav center, status right
│   │   │   ├── Footer.jsx           # Footer — copyright left, creator center, social links right
│   │   │   ├── ScoreRing.jsx        # Animated SVG ring displaying similarity score
│   │   │   ├── SimilarityChart.jsx  # Bar chart showing per-document similarity scores
│   │   │   ├── HighlightViewer.jsx  # Side-by-side sentence match modal
│   │   │   ├── ProfessionalLayout.jsx   # Design system — layout, cards, buttons, badges, grid
│   │   │   └── ResultDisplayOptions.jsx # 3-mode result viewer (Summary / Detailed / Visual)
│   │   ├── pages/
│   │   │   ├── Check.jsx            # Main plagiarism check interface
│   │   │   ├── Corpus.jsx           # Corpus management interface
│   │   │   └── Results.jsx          # Check history with delete functionality
│   │   ├── utils/
│   │   │   └── exportPDF.js         # jsPDF report generation utility
│   │   ├── api.js                   # Axios API client with all endpoint functions
│   │   ├── App.jsx                  # Root component with routing and theme management
│   │   └── index.css                # Global styles, animations, Tailwind directives
│   └── package.json
└── corpus.db                        # Auto-generated SQLite database
```

---

## Technology Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| FastAPI | 0.111.0 | REST API framework |
| Uvicorn | 0.30.1 | ASGI server |
| PyMuPDF | 1.24.5 | PDF text extraction |
| python-docx | 1.1.2 | DOCX text extraction |
| BeautifulSoup4 | 4.12.3 | HTML parsing for URL scraping |
| requests | 2.32.3 | HTTP client for URL fetching |
| scikit-learn | 1.4.2 | TF-IDF vectorization and cosine similarity |
| sentence-transformers | 2.7.0 | BERT sentence embeddings |
| numpy | 1.26.4 | Numerical operations |
| nltk | 3.9.4 | Sentence tokenization for highlight analysis |

### Frontend

| Package | Purpose |
|---|---|
| React 18 | UI framework |
| React Router DOM | Client-side routing |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion | Animations and page transitions |
| Recharts | Bar chart for similarity visualization |
| React Dropzone | Drag and drop file upload |
| React Hot Toast | Toast notifications |
| Axios | HTTP client |
| jsPDF | PDF generation for report export |
| html2canvas | DOM capture for chart embedding in PDF |

---

## NLP Algorithms

### TF-IDF with Cosine Similarity

TF-IDF (Term Frequency-Inverse Document Frequency) is a numerical statistic that reflects how important a word is to a document relative to a collection of documents.

- **Term Frequency (TF)** — how often a term appears in the source document.
- **Inverse Document Frequency (IDF)** — penalizes terms that appear frequently across all documents, reducing the weight of common words.

Each document is converted into a high-dimensional vector where each dimension corresponds to a unique term. Cosine similarity then measures the angle between two vectors — a score of 1.0 means identical, 0.0 means no overlap.

**Strengths:** Fast, lightweight, works well for exact and near-exact matches.  
**Weaknesses:** Cannot detect paraphrasing, synonym substitution, or sentence reordering.  
**Estimated accuracy:** 70–80% on standard academic text.

### BERT Sentence Embeddings

BERT (Bidirectional Encoder Representations from Transformers) is a deep learning model that understands the semantic meaning of text rather than just its surface-level terms. The model used is `all-MiniLM-L6-v2` from the `sentence-transformers` library — a lightweight, distilled version of BERT optimized for sentence-level similarity tasks.

Each document is encoded into a 384-dimensional dense vector that captures contextual meaning. Cosine similarity is then applied to these embeddings.

**Strengths:** Detects paraphrasing, synonym substitution, and structural rewrites. Understands context.  
**Weaknesses:** Slower than TF-IDF, requires more memory, accuracy drops on very short texts (under 50 words).  
**Estimated accuracy:** 88–93% on standard academic text.

### Recommended Usage

For bulk processing of large corpora, use TF-IDF as a first pass to filter high-similarity candidates, then apply BERT on those candidates for deep verification. This hybrid approach balances speed and accuracy.

---

## Features

### Sentence-Level Highlight Matching

After running a plagiarism check, each matched source in the results list shows a scan icon on hover. Clicking it opens a full-screen side-by-side modal that tokenizes both the submitted document and the matched corpus document into individual sentences using NLTK. TF-IDF cosine similarity is then computed between every source sentence and every corpus sentence. Sentences that exceed the similarity threshold are highlighted — red for high similarity, orange for moderate — in the submitted document, and purple in the corpus document. Each highlighted sentence displays its match percentage inline. This allows precise identification of which specific sentences were plagiarized rather than just an overall document score.

### PDF Report Export

After a check is complete, clicking the Export PDF Report button generates and downloads a fully detailed A4 dark-theme PDF report using jsPDF. The report includes:

- **Branded header** — LakshyaAI name, generation date, time, detection mode, website
- **Report series numbering** — `RPT-001`, `RPT-002`... auto-incremented and persisted in `localStorage`
- **Document info card** — filename, detection mode, analysis date
- **Score overview card** — donut ring, risk pill, description text, sources matched count
- **Similarity progress bar** — visual fill bar with 3-zone risk legend
- **Matched sources** — one card per match, full filename (no truncation), full URL displayed in light blue (never hidden), source type, similarity score with color-coded risk pill
- **Visual chart** — live Recharts bar chart captured via `html2canvas` and embedded
- **Summary statistics** — 6-cell grid (total matches, high/medium/low risk, average score, top score)
- **Disclaimer** block
- **Footer on every page** — system name, website, report number, page count

**File naming format:**
```
LakshyaAI_Report_<docname>_RPT001_20250330.pdf
```

### Similarity Threshold Alerts

A configurable threshold slider is available in the detection mode panel, toggled via the Threshold button. The default threshold is 70%. After a check, if the top similarity score meets or exceeds the set threshold, a prominent alert banner appears at the top of the page showing the exact score, the threshold value, and a flag message. The threshold indicator in the results panel also updates in real time showing whether the document is safe or exceeded. This allows institutions to define their own acceptable similarity limits rather than relying on fixed risk labels.

---

### API Endpoints

#### Upload Routes — `/api/upload`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/file` | Upload a PDF, DOCX, or TXT file to the corpus |
| POST | `/api/upload/url` | Fetch and add a web URL's content to the corpus |

#### Check Routes — `/api/check`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/check/file` | Check a file against the corpus |
| POST | `/api/check/url` | Check a URL's content against the corpus |
| POST | `/api/check/text` | Check raw pasted text against the corpus |
| GET | `/api/check/results` | Retrieve all past check results |
| DELETE | `/api/check/results/clear` | Clear all check history |
| POST | `/api/check/highlight` | Sentence-level match analysis between text and a corpus document |
| POST | `/api/check/highlight/file` | Sentence-level match analysis between an uploaded file and a corpus document |

#### Corpus Routes — `/api/corpus`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/corpus/` | List all documents in the corpus |
| DELETE | `/api/corpus/{id}` | Remove a document from the corpus |

All endpoints return JSON. File uploads use `multipart/form-data`. Interactive API documentation is available at `http://127.0.0.1:8000/docs` via Swagger UI.

### Services

**parser.py**  
Handles text extraction from all supported input types. PDF extraction uses PyMuPDF to iterate over pages and concatenate text. DOCX extraction uses python-docx to read paragraph content. URL extraction uses requests with a browser-like User-Agent header to bypass basic bot protection, followed by BeautifulSoup to strip navigation, scripts, and style tags, leaving only readable content.

**similarity.py**  
Contains two similarity functions — `tfidf_similarity` and `bert_similarity` — both accepting a source string and a list of corpus strings, returning a list of float scores between 0 and 1. The BERT model is initialized once globally using lazy loading and reused across all subsequent requests. The `compute_similarity` function wraps both, accepts a mode parameter, and returns results sorted by similarity score descending.

**highlighter.py**  
Handles sentence-level plagiarism analysis. Uses NLTK punkt tokenizer to split both the source and corpus document into individual sentences. Builds a combined TF-IDF matrix across all sentences and computes pairwise cosine similarity between source and corpus sentences. Returns the full sentence lists, indices of highlighted sentences, and a match array with source index, corpus index, and score for each matched pair above the threshold.


All database interactions are handled here. Functions cover adding documents to corpus, retrieving the full corpus, deleting individual corpus documents, saving check results, retrieving result history, deleting individual results, and clearing all results.

### Database Schema

**corpus table**

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| filename | TEXT | Original filename or URL |
| content | TEXT | Extracted plain text content |
| source_type | TEXT | Either "file" or "url" |
| created_at | TIMESTAMP | Auto-set on insert |

**results table**

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| filename | TEXT | Name of the checked document |
| similarity_score | REAL | Top similarity score (0–100) |
| matched_source | TEXT | Filename of the top matching corpus document |
| details | TEXT | JSON array of top 10 matches with scores |
| created_at | TIMESTAMP | Auto-set on insert |

---

## Frontend

### Pages

**Check (`/`)**  
The primary interface. Supports three input modes — file upload via drag and drop, URL input, and raw text paste. Users select a detection mode (TF-IDF or BERT) and submit for analysis. An adjustable **similarity threshold** slider (default 70%) triggers an alert banner when exceeded. Results are displayed in a two-column layout with an animated score ring and a scrollable matched sources list. Users can switch between **3 result display modes**:

- **Quick Summary** — score, source count, top match at a glance
- **Detailed View** — full two-column breakdown with document info and match list
- **Visual Dashboard** — score gauge ring, risk distribution breakdown, per-match progress bars

An **Advanced Options** panel allows switching display mode and accessing export options. An inline **sentence-level match preview** is shown automatically against the top corpus document after each check. A bar chart below visualizes the full similarity breakdown across all matched sources.

**Corpus (`/corpus`)**  
Corpus management interface. Users can drag and drop multiple files simultaneously or add URLs one at a time. All current corpus documents are listed with their source type. Individual documents can be removed via a hover-revealed delete button.

**Results (`/results`)**  
Displays the full history of all plagiarism checks with timestamps, matched sources, and risk classifications. Includes a statistics row showing total checks, average similarity, and high-risk count. Individual results can be deleted on hover. A two-step "Clear History" button wipes all records with a confirmation step to prevent accidental deletion.

### Components

**Navbar** — Sticky top navigation with glassmorphism styling. 3-column layout: logo and brand left, navigation links center (inside a pill container), API live status badge and user avatar right. Active route is highlighted with an indicator dot.

**Footer** — 3-column layout: copyright and branding left, creator profile card center, social links (GitHub, LinkedIn, Portfolio) right. Bottom bar shows tech stack info.

**ScoreRing** — Animated SVG circular progress ring that draws from 0 to the final score on mount. Color transitions from green (low risk) to orange (moderate) to red (high risk) based on score thresholds.

**SimilarityChart** — Recharts bar chart with custom tooltip and color-coded bars. Each bar color reflects the risk level of that particular match.

**ProfessionalLayout** — Reusable design system used across all pages. Exports the following components:

| Component | Purpose |
|---|---|
| `ProfessionalLayout` | Page container with `fullWidth` and `compact` options |
| `ProfessionalHeader` | 3-column header — left title, center slot, right actions |
| `ProfessionalSection` | Flex row with `alignment` (left/center/right/between) and `spacing` (tight/normal/loose) |
| `ProfessionalCard` | Glass card with optional hover lift and padding variants |
| `ProfessionalButton` | Primary/secondary button with size variants (small/normal/large) |
| `ProfessionalGrid` | Responsive grid with col presets (1/2/3/4/auto) and gap variants |
| `ProfessionalBadge` | Color-coded status badge (default/success/warning/error/info) |

**ResultDisplayOptions** — Switchable result viewer with 3 modes: Quick Summary, Detailed View, and Visual Dashboard. Includes a score gauge SVG, risk distribution breakdown, and per-match progress bars.
---

## Installation and Setup

### Prerequisites

- Python 3.11
- Node.js 18 or above
- npm

### Backend Setup

```bash
cd plagiarism-detection-system/backend
C:\Users\<username>\AppData\Local\Programs\Python\Python311\python.exe -m ensurepip --upgrade
C:\Users\<username>\AppData\Local\Programs\Python\Python311\python.exe -m pip install -r requirements.txt
```

### Frontend Setup

```bash
cd plagiarism-detection-system/frontend
npm install
```

---

## Running the Project

Both servers must be running simultaneously in separate terminals.

**Terminal 1 — Backend:**
```bash
cd plagiarism-detection-system/backend
C:\Users\<username>\AppData\Local\Programs\Python\Python311\python.exe -m uvicorn app.main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`  
API documentation: `http://127.0.0.1:8000/docs`

**Terminal 2 — Frontend:**
```bash
cd plagiarism-detection-system/frontend
npm start
```

Frontend runs at: `http://localhost:3000`

---

## Workflow

1. Navigate to the Corpus page and upload reference documents. These can be PDF, DOCX, or TXT files, or web URLs. All content is parsed and stored as plain text in the SQLite database.

2. Navigate to the Check page. Select an input method — file, URL, or text. Choose a detection mode. TF-IDF is recommended for fast bulk checks. BERT is recommended when paraphrasing detection is required.

3. Submit the document. The backend extracts text from the input, retrieves all corpus documents from the database, runs the selected similarity algorithm against every corpus document, sorts results by score descending, saves the top result to the results table, and returns the full match list to the frontend.

4. Review results. The score ring displays the highest similarity found. The match list shows all corpus documents ranked by similarity. The bar chart provides a visual breakdown. Scores above 70% are flagged as high risk, 40–70% as moderate, and below 40% as low risk.

5. Navigate to the Results page to review historical checks. Delete individual records or clear the entire history as needed.

---

## Accuracy and Limitations

| Mode | Estimated Accuracy | Best For |
|---|---|---|
| TF-IDF | 70–80% | Exact matches, bulk processing |
| BERT | 88–93% | Paraphrasing, semantic similarity |

**Limitations:**

- This is a closed-corpus system. It only detects similarity against documents you have uploaded. It does not check against the internet, academic databases, or any external source.
- BERT accuracy degrades on very short texts under 50 words.
- Both algorithms may miss heavily restructured or translated content.
- URL scraping may fail on sites with aggressive bot protection, JavaScript-rendered content, or strict CORS policies.
- The system is not a replacement for professional plagiarism detection services in high-stakes academic or legal contexts.

---

## Author

**Lacki Lohar**  
Portfolio: [lackilohar.netlify.app](https://lackilohar.netlify.app)  
GitHub: [github.com/lucky-panchal](https://github.com/lucky-panchal)  
LinkedIn: [linkedin.com/in/lacki-lohar-463a23321](https://in.linkedin.com/in/lacki-lohar-463a23321)
