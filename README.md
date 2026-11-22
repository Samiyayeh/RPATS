# RPAT-IOSS — Real Property Assessment Tracking & Inter-Office Synchronization System

> **Human-Computer Interaction (HCI) Terminal Project — Group 23**  
> **Institution:** University of Nueva Caceres — School of Computer and Information Sciences (BSIT)  
> **Target LGU Context:** Municipality of Pasacao & Camarines Sur Provincial Capitol (Pili)  
> **Proponents:** Christian Louise O. Asido · John Kenneth P. Calubad · Rizalina A. Ortega *(with Angelfranz B. Ibis on WCAG 2.2 Accessibility Audit)*

---

## 1. Project Overview & Problem Statement

In Local Government Units (LGUs) across Camarines Sur—empirically benchmarked at the **Municipality of Pasacao**—Real Property Tax (RPT) administration under **Republic Act 7160** suffers from severe human-centered workflow bottlenecks:

1. **Fragmented Inter-Office Data:** Existing localized DICT eRPT installations and supplemental Google Sheets ledgers lack automated synchronization between the **Municipal Assessor**, **Provincial Capitol (Pili)**, and **Municipal Treasury**, forcing clerks to manually export and upload batch Excel files.
2. **Physical Courier Latency (7–15+ Days):** Assessment endorsement dockets must be physically transported to the Provincial Capitol in Pili for statutory review and Certificate of Inspection and Survey (CIS) approval, with zero tracking visibility for municipal staff or citizens.
3. **Brittle 1949 Paper Archives:** Clerks spend hours manually searching unindexed paper ledgers dating back to 1949 during title verification and conveyance transfers.
4. **Citizen Counter Hopping:** Property owners travel repeatedly to Municipal Hall only to discover missing conveyance requirements or unverified application statuses.

**RPAT-IOSS** resolves these operational barriers through a **role-based, full-screen, accessible web application** engineered strictly around **ISO 9241-210 (Human-Centered Design)**, **W3C WCAG 2.2 Level A & AA**, **Laws of UX**, and the **11 Official Municipal Assessor Frontline Services** (Camarines Sur Citizen's Charter).

---

## 2. Human-Centered Design (ISO 9241-210) & Target Personas

The interface was iteratively designed around empirical user personas and real municipal office constraints (desktop terminals on municipal LANs, high counter noise, 8:00 AM–5:00 PM government hours, and inclusive PWD access under RA 7277):

| Persona | Role & Office | Core HCI Needs Addressed |
|---|---|---|
| **Liza M. Bañares (38)** | Assessment Clerk III, Pasacao Assessor | Guided FAAS appraisal with locked statutory RA 7160 math, building sub-components, and rapid 1949 archival lookup. |
| **Ramon S. Alcantara (52)** | Municipal Assessor, Pasacao Assessor | Clear review queues, Recommending Approval sign-off, and selective batch dispatch to Pili Capitol. |
| **Engr. Roberto Villafuerte** | Provincial Review Examiner, Capitol (Pili) | Synchronized dual-pane survey/deed viewer with zoom controls, statutory compliance checklist, and itemized deficiency return notes. |
| **Atty. Marisol P. Imperial** | Provincial Assessor (Chief Approver), Pili | Explicit unchecked statutory consent, SHA-256 cryptographic digital seal, CIS QR issuance, and `<1s` sync back to Pasacao. |
| **Elena V. Reyes** | Revenue Collection Clerk / Cashier, Pasacao Treasury | Real-time synchronized assessment roll, transparent Basic (1%) + SEF (1%) calculator, 2-step payment confirmation, and Form 56 / Tax Clearance issuance. |
| **Elena V. Ramos (45)** | Property Owner / Citizen, Pasacao | Standalone public portal (`/citizen`) with Citizen's Charter requirements pre-screening checklist and live 5-stage application tracking. |
| **PWD Stakeholders** | Low Vision (*Mang Rodolfo*), Motor/Tremor (*Ma'am Grace*), Screen Reader (*Engr. Noel*) | High-contrast multi-cue status chips, `44×44px` minimum interactive targets, 3px visible focus rings, semantic HTML5 tables, and `aria-live="polite"` sync announcements. |

---

## 3. WCAG 2.2 Level A & AA Accessibility Remediation

Auditing the baseline Google Sheets eRPT workflow yielded a **52.0% WCAG 2.2 conformance score** across 12 POUR issue clusters. RPAT-IOSS engineers full remediation across all four principles:

- **Perceivable (P-01 to P-03):**
  - Replaced pastel-only status fills (`2.60:1` failing contrast) with **Multi-Cue Status Chips** combining distinct icons, high-contrast borders, and $\ge 4.5:1$ text contrast (`StatusChip.tsx`).
  - Replaced flat grid layouts with semantic HTML5 `<table>`, `<th scope="col">`, `<main>`, `<nav>`, and `<aside>` landmarks.
- **Operable (O-01 to O-03):**
  - Added **Skip to Main Content** links (`WCAG 2.4.1`), logical keyboard tab order, Escape-key dismissal for menus/modals, minimum `40–48px` target heights (`WCAG 2.5.8`), and guaranteed `3px` high-contrast focus outlines (`:focus-visible`).
- **Understandable (U-01 to U-03):**
  - Implemented **1-Click Fuzzy Match Error Recovery** in Treasury search (replacing spreadsheet `#VALUE! / NOT FOUND` errors when mistyping e.g. `TD-26-0080` → `TD-26-0008`).
  - Locked statutory assessment formulas (`20%` Residential, `40%` Agricultural, `50%` Commercial under Section 218, RA 7160).
  - Enforced **Two-Step Financial Confirmation Modals** before Form 56 settlement and **initially unchecked consent checkboxes** before Provincial SHA-256 sign-off.
- **Robust (R-01 to R-03):**
  - Native HTML5 form controls with persistent visible `<label>` elements and `autocomplete` attributes.
  - Programmatic `aria-live="polite"` toast region announcing inter-office synchronization events to screen readers.

---

## 4. Applied Laws of UX & 26 Expert Design Findings

Grounded in `Design_recomendation.pdf` (15 screens, 3 offices, 26 findings) and `GROUP 23_Case Study & UX Laws Evaluation.pdf`:

- **Hick's Law:** Organized all 11 Municipal Assessor frontline services into 3 logical sidebar groups (*Appraisal & Endorsement*, *Frontline Counter Services*, and *Archives, Rates & Disputes*).
- **Fitts's Law:** Sized primary workflow actions (`44–48px`) and anchored confirmation controls cleanly.
- **Jakob's Law:** Preserved familiar municipal Tax Declaration, FAAS, and Official Receipt Form 56 layouts.
- **Postel's Law:** Tolerant search inputs accepting PINs/TD numbers with or without hyphens/spaces plus fuzzy typo recovery.
- **Zeigarnik Effect & Peak-End Rule:** Collection progress bars, Citizen pre-screening readiness meters, 5-stage milestone steppers, and clear batch transmission confirmations.
- **Key Expert Findings Resolved:**
  - Authentic role-based credential login with password visibility toggle and MIS recovery notice (**Finding [1]**).
  - Reconciled Q1 billing dates (**Finding [5]**), separated 2-step cashier settlement (**Finding [6]**), prominent `"DRAFT PREVIEW • NOT SETTLED"` watermarks (**Finding [7]**), and deterministic SVG QR verification seals (**Finding [8]**).
  - Reconciled conflicting docket identities (**Finding [10]**), linked SMV rate provenance (**Finding [11]**), deliberate batch selection with deficiency gating (**Findings [13–14]**), and unchecked statutory sign-off consent (**Findings [22–23]**).

---

## 5. Complete 11 Municipal Assessor Frontline Services

Aligned with the Camarines Sur Municipal Assessor Citizen's Charter (`Document/ServicesDocu`):

1. **Validation of Tax Declaration** *(Sec. 197–198, Art. 288 IRR, RA 7160 — 10 mins, Free)*
2. **Assigning PIN & ARP Numbers** *(with live duplicate parcel collision detection — 5 mins, Free)*
3. **Property Identification & Ocular Inspection** *(5 mins verification / 1-day Ocular Inspection scheduler — Free)*
4. **Issuance of Certifications & Certified True Copies** *(CTC of TD, With/Without Improvement, Aggregate Landholdings, Current & Existing TD, No Property — Treasury OR gated)*
5. **Cancellation / Annotation of Liens & Mortgages** *(Notice of Mortgage/Cancellation + Annotation Fee OR)*
6. **Appraisal & Assessment** *(FAAS Encoder + Building Sub-Components + Provincial SMV Matrix 2024)*
7. **Transfer of Property for Taxation Purposes & Ownership** *(3-Track Charter checklists: Standard Residential/Agricultural Sale, DAR/CLOA/EP Properties, Extra-Judicial Settlement with Deed of Sale)*
8. **Updating Approved FAAS / Cancellation & Revision**
9. **Recommending Approval & Encrypted Dispatch to Pili Capitol**
10. **Client Transaction Pre-Screening & Assistance** *(Standalone `/citizen` portal)*
11. **Resolving Assessment/Appraisal Problems & Capitol Deficiencies** *(Client concern tickets + Pasacao corrective re-upload to Pili)*

---

## 6. Architecture, Routes & Access Credentials

The application separates real-life production usage from presentation demos:

| Route | Purpose |
|---|---|
| `/` | **Internal LGU Staff Portal** — Authentic role-based Employee ID sign-in routing staff to Municipal Assessor, Provincial Capitol, or Municipal Treasury. |
| `/citizen` *(or `/portal`, `/track`)* | **Standalone Public Citizen Portal** — No login required; live 5-stage docket tracking and Citizen's Charter requirements pre-screening checklist. |
| `/?demo=1` | **Isolated Presenter Sandbox** — Optional bottom bar for HCI defense walkthroughs with 1-click role switching (completely hidden in production URLs). |

### Staff Credentials *(any non-empty password)*
| Employee ID | Officer | Assigned Office |
|---|---|---|
| `PAS-ASSR-0824` | Liza M. Bañares (Assessment Clerk III) | Municipal Assessor — Pasacao |
| `PAS-ASSR-0102` | Ramon S. Alcantara (Municipal Assessor) | Municipal Assessor — Pasacao |
| `CAP-EXM-0419` | Engr. Roberto Villafuerte (Review Examiner) | Provincial Capitol — Pili |
| `CAP-APR-0001` | Atty. Marisol P. Imperial (Provincial Assessor) | Provincial Capitol — Pili |
| `PAS-TRES-0311` | Elena V. Reyes (Treasury Cashier) | Municipal Treasury — Pasacao |

---

## 7. Tech Stack & Local Setup

- **Frontend:** React 19, TypeScript 5.7, Tailwind CSS v4, Lucide React, Vite 8
- **State Management:** Reactive Inter-Office Context Store (`src/context/RpatisContext.tsx`) synchronizing Pasacao Assessor, Pili Capitol, Pasacao Treasury, and the Public Citizen Portal in real time.

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (default port 8443)
npm run dev

# 3. Type-check and build for production
npx tsc --noEmit
npm run build
```
