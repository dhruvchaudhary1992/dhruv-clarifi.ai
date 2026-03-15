# CLAUDE.md — Clarifi / Sentinel Insurance Auditor

## Project Overview

**Clarifi** is a medical health-insurance audit platform. A user submits their details and policy PDF → an n8n AI agent orchestrates 8 tools → generates a structured surgical audit report → delivers it via email AND renders it live on the React frontend.

**Active workstreams:**
1. **n8n Workflow** — v6 workflow is ready with Webhook trigger + Respond to Webhook node. Import `Clarifi Agent (6).json` into n8n cloud to activate.
2. **React + Tailwind Frontend** — replaces the n8n form entirely. Multi-step form → loading state → live report display.

**Current workflow file:** `Clarifi Agent (6).json`
**Production webhook:** `https://trainingaipm.app.n8n.cloud/webhook/sentinel-audit`

---

## AI Dev Tooling (Required Before Any n8n Work)

### n8n-mcp (MCP Server)
Add to `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMGUzNDQ5OC1iNDQ4LTQxZjMtYWQwNy01OTYxYjEwMmYyNTgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiM2EzMWVmOTctNDcyNC00MzcxLTgyMjktYWNmYTMzMDY2ZGViIiwiaWF0IjoxNzcyOTc2MTQzLCJleHAiOjE3NzU1MDAyMDB9.ksZflndLw2Co1PTBmUzUijN6Ws8xFpUeH1d3GrcWdpg"
      }
    }
  }
}
```
- Use n8n-mcp to look up exact node property schemas **before** editing workflow JSON.
- Run n8n-mcp validation **after** editing, before importing into n8n.

### n8n-skills (Claude Code Skills)
```
/plugin install czlonkowski/n8n-skills
```
7 skills — activates automatically. Critical rule: `toolCode` nodes return plain strings; Code nodes return `[{ json: {} }]`.

---

## Complete Architecture (v5)

### Trigger → Final Output Flow

```
[REACT FRONTEND] — multipart/form-data POST
        ↓
[n8n Webhook — POST https://trainingaipm.app.n8n.cloud/webhook/sentinel-audit]
        ↓
  ┌─────────────────────────────┐
  │   PARALLEL PATH A           │   Policy Ingestion
  │   Extract from File2 (PDF)  │
  │   → Merge                   │
  │   → Code in JavaScript      │   structures: {email, city, weight,
  │   → Pinecone Insert          │   height, procedure, hospital, policy_text}
  │     (namespace: user_{email})│
  └─────────────────────────────┘
        ↓ (also feeds)
  ┌─────────────────────────────┐
  │   PARALLEL PATH B           │   Agent Orchestration
  │   Merge                     │
  │   → Code in JavaScript1     │   extracts clean fields for agent
  │   → AI Agent1 (gpt-5-mini)  │
  │     max 12 iterations        │
  │     ↳ 8 tools (see below)   │
  └─────────────────────────────┘
        ↓
  ┌─────────────────────────────┐
  │   OUTPUT PIPELINE           │
  │   format for report (Code)  │   cleans Unicode, adds RTF wrapper
  │   → Convert to File (.rtf)  │
  │   → Merge1                  │
  │   → Send a message (Gmail)  │   HTML email + RTF attachment to user
  └─────────────────────────────┘
        ↓ (ALSO — parallel branch in v6)
  [Respond to Webhook] ← JSON { success, report } back to React frontend
```

### Form Fields (8 total — collected by React form)

| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | text | No | Used in email greeting |
| Email Address | text | Yes | Used as Pinecone namespace key |
| City | text | Yes | Drives cost tier (T1/T2/T3) |
| Weight (kg) | number | Yes | BMI calculation |
| Height (m) | number | Yes | BMI calculation |
| Planned Procedure | text | No | Surgery being audited |
| Hospital Name | text | No | Network status lookup |
| Policy Document | file (PDF) | Yes | Ingested into Pinecone |

### AI Agent Tools (8 total in v5)

| Tool | Type | Input | Purpose |
|---|---|---|---|
| `thesaurus_lookup` | toolCode | Procedure name | Normalizes to formal medical term |
| `bmi_calculator` | toolCode | weight, height | Calculates BMI + category |
| `cost_estimatory` | toolCode | medical term + city | Market cost in INR by city tier |
| `risk_estimator` | toolCode | BMI category + procedure | Surgical risk level |
| `user_policy_reader` | Pinecone RAG | email | Retrieves user's policy from `user_{email}` namespace |
| `network_hospital_lookup` | Google Sheets tool | hospital_name + insurance_provider | Checks if hospital is in network |
| `claim_process_search` | SerpAPI tool | insurer + claim type | Fetches cashless/reimbursement process docs |
| `legal_rights_lookup` | Pinecone RAG | regulatory keywords | IRDAI 2024 rules (topK: 6) |

LLM: `gpt-5-mini` | Max iterations: 12 | No memory node (stateless per audit)

---

## Agent Execution Logic (Deterministic Order)

The system prompt enforces strict conditional execution — tools are skipped if required inputs are missing. **Never fabricate or infer.**

1. **Procedure Normalization** — `thesaurus_lookup` if procedure exists → use formal term downstream
2. **BMI** — `bmi_calculator` only if height AND weight both present
3. **Surgical Risk** — `risk_estimator` only if normalized procedure exists
4. **Cost Estimation** — `cost_estimatory` with procedure + city (Mumbai fallback if city missing)
5. **Policy Retrieval** — `user_policy_reader` with exact email → extract insurer name
6. **Insurer Name Normalization** — strip legal suffixes ("Health Insurance Company Limited" → "Max Bupa") before passing to hospital lookup
7. **Hospital Network** — `network_hospital_lookup` only after insurer retrieved; ≥1 row = Network, 0 rows = Non-Network
8. **Claim Process** — `claim_process_search` AFTER network determined; cashless search if Network, reimbursement search if Non-Network
9. **Legal/Regulatory** — `legal_rights_lookup` if IRDAI rules are relevant

**RECOMMENDATION ADAPTATION RULE:** Recommendations in section 7 of the report MUST align with network classification — never contradict it.

---

## Audit Report Structure (7 Sections)

The agent outputs a clean structured report. The React frontend must render each section distinctly:

| Section | Key Fields |
|---|---|
| 1. Policy Overview | Insurer, Policy Status, Coverage (3 bullets max), Waiting Period, PED Clause |
| 2. Hospital Network Status | Hospital Name, Network Classification (Network/Non-Network), Zone |
| 3. Estimated Cost | City, Estimated Cost Range, Recommended Sum Insured |
| 4. Clinical Risk Assessment | Procedure, BMI Category, Risk Level, Key Consideration |
| 5. Claim Process Guidance | Claim Mode (Cashless/Reimbursement), Key Documents, Process Summary, Timeline |
| 6. Regulatory Safeguards | Source, Exact IRDAI Clause (verbatim), Practical Meaning |
| 7. Recommended Next Steps | Exactly 3 one-line actionable steps |

**Output constraints from system prompt:** max 900 words, no markdown artifacts, no tool names revealed, no internal reasoning exposed, executive tone.

---

## n8n Workflow Status — v6 (DONE)

`Clarifi Agent (6).json` is ready to import. Changes applied:

| Change | Status | Detail |
|---|---|---|
| formTrigger → Webhook | ✅ Done | POST `/sentinel-audit`, `responseMode: responseNode`, binary: `Policy_Document` |
| Respond to Webhook node | ✅ Done | Returns `{ success: true, report: $json.output }` |
| AI Agent1 fork | ✅ Done | Branch 1 → email, Branch 2 → Respond to Webhook |

**To activate:** n8n Cloud → Import `Clarifi Agent (6).json` → activate the workflow.

**Known n8n Cloud CORS behaviour:** n8n Cloud allows all origins by default on webhook nodes — no additional CORS config needed for the React frontend.

---

## Technical Standards — n8n JS Tool Nodes

### Golden Rules
- **`toolCode` nodes return plain strings only.** Never objects/arrays.
- **Code nodes return `[{ json: {} }]`.**
- **Input normalization** — always guard `query`:
  ```js
  const input = typeof query === 'string' ? query.toLowerCase() : JSON.stringify(query).toLowerCase();
  ```
- **Errors as strings:** `return "ERROR: description here.";`
- **Output prefix convention:**
  - `RESULTS FOR ...` → cost_estimatory
  - `BMI RESULTS: ...` → bmi_calculator
  - `Formal Term: ...` → thesaurus_lookup
  - `RISK ASSESSMENT: ...` → risk_estimator

### Known Issues / Technical Debt

| Priority | Issue | Fix |
|---|---|---|
| ~~Critical~~ | ~~formTrigger blocks frontend integration~~ | ✅ Fixed in v6 — Webhook + Respond to Webhook |
| High | `cost_estimatory` node name typo | Rename to `cost_estimator`, sync system prompt |
| High | BMI regex fragility | Replace with delimiter-aware parsing |
| Medium | `bmi_calculator` still uses old regex approach | v5 preserved old code — upgrade |
| Medium | `thesaurus_lookup` has 10 entries; `cost_estimatory` has 21 | Sync mapping |
| Medium | `risk_estimator` logic is shallow (BMI + 8 procedure types) | Add age brackets, comorbidities |
| Low | `user_policy_reader` topK=20, `legal_rights_lookup` topK=6 | Consider raising legal topK to 10 |

---

## React + Tailwind Frontend — Complete Spec

### Tech Stack
- **React 18** — functional components, hooks only
- **Tailwind CSS** — all styling
- **shadcn/ui** + **Radix UI** — form, dialog, progress primitives
- **Vite** — bundler and dev server
- **fetch** — HTTP calls (no Axios needed)
- State: `useState` + `useReducer` + React Context; no Redux

### User Flow
```
Landing / Hero Page
  → [Start Audit] CTA
  → Multi-Step Form (3 steps)
      Step 1: Personal Details (Name, Email, City)
      Step 2: Medical Details (Weight, Height, Procedure, Hospital)
      Step 3: Upload Policy PDF + Review & Submit
  → Loading / Processing State
      (animated progress — phases visible: Ingesting Policy → Running Audit → Generating Report)
  → Report Display Page
      (7 sections rendered as cards)
  → [Download RTF] + [Start New Audit] actions
```

### Component Architecture
```
App
├── pages/
│   ├── LandingPage          (hero, CTA, how it works)
│   ├── AuditPage            (form + report in one view)
│   └── (optional) ResultPage
├── components/
│   ├── form/
│   │   ├── AuditForm        (multi-step shell, progress bar)
│   │   ├── StepPersonal     (Name, Email, City)
│   │   ├── StepMedical      (Weight, Height, Procedure, Hospital)
│   │   └── StepUpload       (FileDropZone, review summary, submit)
│   ├── upload/
│   │   └── FileDropZone     (drag-and-drop, PDF only, 10MB max)
│   ├── loading/
│   │   └── AuditProgress    (animated phases with status)
│   └── report/
│       ├── AuditReport      (section orchestrator)
│       ├── PolicyOverview   (Section 1)
│       ├── HospitalStatus   (Section 2 — Network/Non-Network badge)
│       ├── CostCard         (Section 3 — INR values, recommended sum insured)
│       ├── RiskAssessment   (Section 4 — risk badge + BMI)
│       ├── ClaimGuidance    (Section 5 — cashless vs reimbursement mode)
│       ├── RegulatoryCard   (Section 6 — IRDAI verbatim clause)
│       └── NextSteps        (Section 7 — 3 action items)
├── hooks/
│   ├── useAuditForm.js      (form state, step navigation, validation)
│   └── useAuditSubmit.js    (POST logic, loading state, response parsing)
├── utils/
│   └── parseReport.js       (parses agent text → structured sections object)
└── api/
    └── clarifi.js           (uploadAndAudit function)
```

### UI Design System

**Color tokens:**
| Purpose | Tailwind |
|---|---|
| Critical / gap | `text-red-600 bg-red-50 border-red-200` |
| Moderate risk | `text-amber-600 bg-amber-50 border-amber-200` |
| Safe / covered | `text-green-600 bg-green-50 border-green-200` |
| Network badge | `bg-green-100 text-green-700` |
| Non-Network badge | `bg-red-100 text-red-700` |
| Cashless badge | `bg-blue-100 text-blue-700` |
| Reimbursement badge | `bg-orange-100 text-orange-700` |
| Page background | `bg-slate-50` |
| Card | `bg-white rounded-2xl shadow-sm border border-slate-200 p-6` |
| Brand accent | `bg-indigo-600` |
| Step indicator active | `bg-indigo-600 text-white` |
| Step indicator done | `bg-green-500 text-white` |
| Step indicator pending | `bg-slate-200 text-slate-500` |

**Typography:**
- Section label: `text-xs font-semibold uppercase tracking-widest text-slate-400`
- Card heading: `text-base font-semibold text-slate-800`
- Body: `text-sm text-slate-600`
- INR values: `font-mono font-semibold text-slate-900`
- Risk/status badges: `text-xs font-bold px-2 py-1 rounded-full`

**Multi-step form:**
- Show step indicator at top (1 → 2 → 3 with labels)
- Validate current step before advancing (don't allow empty required fields)
- "Back" / "Next" / "Submit Audit" buttons — never a plain form submit
- Animate step transitions with `transition-all duration-300`

**Loading state — audit progress phases:**
```
[●] Uploading policy document...
[●] Ingesting policy into knowledge base...
[○] Running AI audit (this takes ~30–60 seconds)...
[○] Generating your report...
```
Use a pulsing spinner + phase list. Do NOT show a time estimate. Show "Your report will also be sent to your email" message.

**Report sections — visual rules:**
- Each section = its own card with icon + section number
- Section 2 (Hospital Status): large `Network` / `Non-Network` badge as the centrepiece
- Section 3 (Cost): highlight Recommended Sum Insured in a callout box
- Section 4 (Risk): color-coded badge (Low=green, Moderate=amber, High=red)
- Section 5 (Claim): `Cashless` / `Reimbursement` mode as a prominent pill badge
- Section 7 (Next Steps): numbered list, each step in its own row with an arrow icon
- INR values: always use `toLocaleString('en-IN')` before display

**Accessibility:** keyboard navigable, `aria-label` on icon buttons, `role="status"` on loading states, `aria-live="polite"` on report container when it appears.

**Responsive:** mobile-first, single column on `sm:`, two-column report grid on `lg:`.

### API Integration

```js
// src/api/clarifi.js
export const submitAudit = async (formData) => {
  // formData is a FormData object with all fields + PDF binary
  const res = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
    method: 'POST',
    body: formData,   // multipart/form-data — do NOT set Content-Type header manually
  });
  if (!res.ok) throw new Error(`Audit request failed: ${res.status}`);
  return res.json();  // expects { success: true, report: "...", sections: {...} }
};
```

**FormData construction:**
```js
const fd = new FormData();
fd.append('full_name', formState.fullName);
fd.append('email', formState.email);
fd.append('city', formState.city);
fd.append('weight', formState.weight);
fd.append('height', formState.height);
fd.append('planned_procedure', formState.procedure);
fd.append('hospital_name', formState.hospital);
fd.append('Policy_Document', formState.pdfFile);  // binary field name must match n8n node
```

**`.env.local` (never commit):**
```
VITE_WEBHOOK_URL=https://trainingaipm.app.n8n.cloud/webhook/sentinel-audit
```

### Report Parsing (fallback if n8n returns raw text)

```js
// src/utils/parseReport.js
export const parseReport = (rawText) => {
  const sectionMap = {
    'Policy Overview': 'policyOverview',
    'Hospital Network Status': 'hospitalStatus',
    'Estimated Cost': 'estimatedCost',
    'Clinical Risk Assessment': 'riskAssessment',
    'Claim Process Guidance': 'claimGuidance',
    'Regulatory Safeguards': 'regulatorySafeguards',
    'Recommended Next Steps': 'nextSteps',
  };

  const result = {};
  const blocks = rawText.split(/\n(?=\d️⃣)/);

  for (const block of blocks) {
    for (const [label, key] of Object.entries(sectionMap)) {
      if (block.includes(label)) {
        result[key] = block.replace(/^\d️⃣.*\n/, '').trim();
      }
    }
  }

  // Detect risk level
  const risk = result.riskAssessment || '';
  result.riskLevel = risk.includes('High') ? 'high'
    : risk.includes('Moderate') ? 'moderate' : 'low';

  // Detect claim mode
  const claim = result.claimGuidance || '';
  result.claimMode = claim.includes('Cashless') ? 'cashless' : 'reimbursement';

  // Detect network status
  const hospital = result.hospitalStatus || '';
  result.isNetworkHospital = hospital.includes('Network') && !hospital.includes('Non-Network');

  return result;
};
```

---

## Domain Context — India Health Insurance

- All costs: **INR (₹)**, `toLocaleString('en-IN')`
- City tiers (T1/T2/T3 — hardcoded in `cost_estimatory`)
- **IRDAI 2024:** cashless ≤1hr, discharge ≤3hr, moratorium 60mo, PED cap 36mo
- Pinecone index: `health-insurance-knowledge`, namespace per user: `user_{email}`
- Hospital network data: Google Sheet (`Dhruv_Bama_hospital_copy`) with Hospital Name + Insurance Provider columns
- Claim process: fetched live via SerpAPI per insurer + claim type

---

## Development Workflow

- **Step 0 (done):** v6 workflow modified — Webhook trigger + Respond to Webhook node ready. Import `Clarifi Agent (6).json` into n8n Cloud.
- **Credentials:** OpenAI, Pinecone, Google Drive, SerpAPI, Gmail — live in n8n credential store only. Never commit.
- **Before editing workflow JSON:** use n8n-mcp to look up exact node schemas
- **After editing:** run n8n-mcp validation, then import into n8n
- **Adding procedures:** update both `cost_estimatory` dataset AND `thesaurus_lookup` mapping together
- **Frontend:** `npm create vite@latest clarifi-frontend -- --template react` then install Tailwind
- **Local dev:** `npm run dev` with `.env.local` pointing to n8n instance
- **Binary field name for PDF:** must be `Policy_Document` — this is what `Extract from File2` reads (`binaryPropertyName: "Policy_Document"`)
