# Clarifi — Surgical Insurance Auditor

> AI-powered health insurance audit platform for India. Upload your policy PDF, enter your surgery details, and get a full structured audit report in under 60 seconds — delivered on-screen and by email.

---

## What It Does

Clarifi takes 8 inputs from the user (personal details + health insurance policy PDF) and runs them through an n8n AI agent that orchestrates 8 specialist tools. The result is a 7-section audit report covering:

1. **Policy Overview** — coverage, waiting periods, PED clauses
2. **Hospital Network Status** — cashless-eligible or reimbursement only
3. **Estimated Cost** — market surgery cost by city tier (INR)
4. **Clinical Risk Assessment** — BMI-based surgical risk level
5. **Claim Process Guidance** — step-by-step cashless or reimbursement flow
6. **Regulatory Safeguards** — verbatim IRDAI 2024 clauses that protect you
7. **Recommended Next Steps** — 3 actionable items

---

## Architecture

```
React Frontend (Vite + Tailwind)
        │
        │  multipart/form-data POST
        ▼
n8n Webhook (/webhook/sentinel-audit)
        │
        ├── Path A: PDF → Pinecone (policy stored per user namespace)
        │
        └── Path B: AI Agent (GPT) → 8 tools → structured report
                │
                ├── Email (Gmail — HTML + RTF attachment)
                └── Respond to Webhook → React frontend renders report
```

### n8n AI Agent Tools

| Tool | Purpose |
|---|---|
| `thesaurus_lookup` | Normalises procedure name to formal medical term |
| `bmi_calculator` | Calculates BMI + category from weight/height |
| `cost_estimatory` | Surgery market cost in INR by city tier (T1/T2/T3) |
| `risk_estimator` | Surgical risk level from BMI + procedure type |
| `user_policy_reader` | RAG retrieval of user's policy from Pinecone |
| `network_hospital_lookup` | Checks if hospital is in-network via Google Sheets |
| `claim_process_search` | Fetches cashless/reimbursement docs via SerpAPI |
| `legal_rights_lookup` | Retrieves IRDAI 2024 regulatory rules from Pinecone |

---

## Project Structure

```
├── Clarifi Agent v7.json      # n8n workflow — import into n8n Cloud
├── Clarifi Poller.json        # n8n poller workflow
└── clarifi-frontend/          # React + Tailwind frontend
    ├── src/
    │   ├── api/               # Webhook API call
    │   ├── components/
    │   │   ├── form/          # Multi-step audit form (3 steps)
    │   │   ├── loading/       # Animated audit progress phases
    │   │   ├── report/        # 7 report section cards
    │   │   └── upload/        # Drag-and-drop PDF uploader
    │   ├── hooks/             # useAuditForm, useAuditSubmit
    │   ├── pages/             # LandingPage, AuditPage
    │   └── utils/             # parseReport (text → structured sections)
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Getting Started

### 1. n8n Workflow

1. Go to [n8n Cloud](https://app.n8n.cloud)
2. Import `Clarifi Agent v7.json`
3. Add credentials: OpenAI, Pinecone, Google Drive, SerpAPI, Gmail
4. Activate the workflow
5. Webhook endpoint: `https://<your-n8n-instance>/webhook/sentinel-audit`

### 2. Frontend

```bash
cd clarifi-frontend
npm install
```

Create a `.env.local` file (never commit this):
```
VITE_WEBHOOK_URL=https://<your-n8n-instance>/webhook/sentinel-audit
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Form Fields

| Field | Required | Notes |
|---|---|---|
| Full Name | No | Used in email greeting |
| Email Address | Yes | Pinecone namespace key |
| City | Yes | Drives cost tier |
| Weight (kg) | Yes | BMI calculation |
| Height (m) | Yes | BMI calculation |
| Planned Procedure | No | Surgery being audited |
| Hospital Name | No | Network status lookup |
| Policy PDF | Yes | Ingested into Pinecone |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Icons | Lucide React |
| Orchestration | n8n Cloud |
| AI Agent | GPT (via n8n AI Agent node) |
| Vector Store | Pinecone |
| Email | Gmail (n8n node) |
| Hospital Data | Google Sheets |
| Claim Search | SerpAPI |
| Compliance | IRDAI 2024 |

---

## Compliance & Disclaimer

All cost estimates are in **INR (₹)** based on city tier benchmarks. Regulatory references are sourced from **IRDAI 2024** guidelines. This tool is for **informational purposes only** and does not constitute financial or medical advice.
