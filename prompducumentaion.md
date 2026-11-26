# Prompt Documentation — RPAT-IOSS Development & HCI Redesign

This document records the exact prompts used across the full lifecycle of **RPAT-IOSS (Real Property Assessment Tracking & Inter-Office Synchronization System)**—from the initial high-fidelity UI prototype generation through the iterative Human-Centered Design (ISO 9241-210), WCAG 2.2 AA remediation, and real-life LGU rebuild.

---

## Phase 1 — Initial High-Fidelity Prototype Generation Prompts

### Initial Prompt A — Core 4-Screen RPAT-IOSS Dashboard System
```text
Design a comprehensive, modern, ultra-minimalist web UI/UX dashboard system for "RPAT-IOSS" (Real Property Assessment Tracking and Inter-Office Synchronization System) — an enterprise civic-tech platform for Philippine Local Government Units (LGUs) connecting the Municipal Assessor, Municipal Treasurer, and Provincial Capitol.

DESIGN AESTHETICS & THEME:
Style: Ultra-minimalist, sleek, high-end SaaS/Enterprise design (inspired by Linear, Vercel, and Stripe dashboards). Clean layout with generous whitespace and breathing room.
Color Palette: Predominantly White and Light Gray with Sharp Black accents. * Primary Background: Pure White (#FFFFFF) and Off-White / Canvas Gray (#F8F9FA, #F3F4F6). * Primary Surfaces & Cards: Clean White (#FFFFFF) with subtle, thin borders (#E5E7EB) and soft, diffused micro-shadows (elevation 1). * Typography & Primary Buttons: Deep Ink Black (#111827 / #09090B) with crisp white text. * Secondary / Inactive: Muted slate grays (#6B7280, #9CA3AF). * Accent/Status Tags (Subtle, desaturated pastels only): Soft Emerald/Green for "Approved/Paid", Soft Amber for "Under Capitol Review", Soft Coral/Red for "Deficiency Flagged".
Typography: Clean modern sans-serif (Inter or Geist). Sharp typographic hierarchy, legible 12px–14px data cells, bold headline summaries.
SCREENS & VIEWS TO GENERATE (Create 4 key screens in 1440x900 desktop viewport):
SCREEN 1: MUNICIPAL ASSESSOR APPRAISAL WORKSPACE (Module 1)

Layout: Slim dark/black or clean white left sidebar (Navigation: Dashboard, New Appraisal, Legacy Vault 1949, Endorsement Queue, Settings).
Top Header: Search bar ("Search PIN, ARP, or Owner Name"), municipality selector ("Pasacao, CamSur"), notification bell, user avatar (Appraiser).
Main Body: * Top KPI Stat Cards (3 cards): Total Active Assessments, Pending Capitol Approvals, Legacy Records Cataloged (1949–2026). * Active Transaction Split-Screen Form:
Left Panel (60%): Property Details & SMV Appraisal Form (Fields: PIN, Lot No., Classification dropdown [Residential, Commercial, Agricultural], Area in sqm, Base Market Value auto-calc, Assessment Level slider/tag, and Assessed Value total).
Right Panel (40%): Live Preview of standard Electronic Tax Declaration (e-TD) and Notice of Assessment (NOA) with a primary black button: "Approve & Endorse to Capitol".
SCREEN 2: PROVINCIAL CAPITOL REMOTE REVIEW & DIGITAL APPROVAL (Module 3)

Purpose: Review workspace used by Provincial Capitol Examiners in Pili.
Top Bar: Docket Header showing "Docket #PAS-2026-0849 | Pasacao Assessor Endorsement" with a multi-step horizontal progress tracker: [Encoded] -> [Recommending Endorsement] -> [Capitol Under Review] -> [CIS Approval].
Two-Column Review Layout: * Left Column (Document Viewer): PDF/Docket previewer displaying scanned conveyance deed, tax clearance, and cadastral survey map. * Right Column (Inspection Checklist & Digital Sign-off):
Checklist items with toggles: "SMV Valuation Compliance", "Cadastral Boundary Conformity", "Transfer Tax Verified".
Deficiency remarks text field with a secondary "Flag Discrepancy" button.
Prominent Primary Button: "Sign & Grant CIS Approval" (Certificate of Inspection and Survey).
SCREEN 3: MUNICIPAL TREASURY BILLING & INSTANT CLEARANCE DESK (Module 2)

Header: Real-Time Synchronization Banner: "🟢 Live Sync Active: 1 new assessment roll received from Assessor".
Main Content: * Taxpayer Billing Ledger Card: PIN lookup, Owner name, Assessed Value. * Real-Time Dues Breakdown Table: Basic Tax (1%), SEF (1%), Gross Amount. * Automated Statutory Incentives Badges: "20% Advance Discount (Dec)" or "2% Monthly Surcharge". * Net Amount Due total in bold black display text. * Cashier Action Panel: Official Receipt (OR) input, payment method toggle (Cash, Check), and a high-contrast primary button: "Process Payment & Generate Electronic Tax Clearance".
SCREEN 4: CITIZEN PUBLIC STATUS TRACKING PORTAL (Public Kiosk / Web Tracker)

Minimalist, centered, distraction-free view (White background with a clean centered card container).
Header: "LGU Pasacao Real Property Assessment Tracking Portal".
Tracking Input: Minimalist search bar with a black search button: "Enter 8-digit Tracking Code (e.g. PAS-2026-0849)".
Tracking Result Card: * Property Summary (Owner, PIN, Declared Improvement). * Large, elegant horizontal or vertical Milestone Stepper:
Document Intake (Completed - date/timestamp)
Municipal Appraisal (Completed)
Provincial Capitol Endorsement (Active / Green pulse)
Treasury Billing & Clearance (Pending) * Estimated completion badge: "Estimated Turnaround: < 24 Hours".
```

---

### Initial Prompt B — Municipal Assessor Sub-Screens (Endorsement Queue, Legacy Vault 1949, SMV Matrix 2024)
```text
Design 3 fully-detailed desktop sub-screens (1440x900px) that complete the left sidebar navigation for the "RPAT-IOSS Municipal Assessor Workspace". 

STYLE SYSTEM:
- Minimalist, monochrome with high white dominance (#FFFFFF background, #F9FAFB canvas, #111827 deep black text/buttons, #E5E7EB 1px borders).
- Keep the identical left navigation sidebar (240px wide) across all 3 screens, showing the active item highlighted with background #F3F4F6, text #111827, font weight 600.

================================================================================
VIEW 1: "ENDORSEMENT QUEUE" (Active Sidebar: Provincial Endorsements)
================================================================================
Top Header:
- Title: "Provincial Endorsement & Capitol Queue"
- Subtitle: "Monitor dockets transmitted between Pasacao Assessor and the Provincial Capitol in Pili"
- Right Action: Primary Black Button "#111827" with Lucide 'Send' icon: "Batch Bundle & Transmit to Pili"

Top Metrics Bar (4 cards in row, 270px width each, 1px border #E5E7EB, white background):
- Card 1: "PENDING LOCAL HEAD SIGN" -> "5 Dockets" (Subtext: "Requires Engr. Wilson signature")
- Card 2: "UNDER REVIEW AT CAPITOL" -> "7 Dockets" (Subtext: "Active in Pili Provincial queue")
- Card 3: "DEFICIENCIES FLAGGED" -> "2 Returned" (Subtext: "Requires surveyor correction")
- Card 4: "PROVINCIAL APPROVAL RATE" -> "94.2%" (Subtext: "Avg. turnaround: 18 hours")

Filter & Search Bar:
- Horizontal Status Tabs: [All (42)] [Needs Signature (5)] [At Capitol (7)] [Flagged (2)] [Approved (28)]
- Search Input: "Filter by Docket #, PIN, or Owner Name..."

Full-Width Data Table (White background, 1px border #E5E7EB, radius 8px):
- Table Header: DOCKET ID | PROPERTY INDEX NO. (PIN) | DECLARANT / OWNER | CLASSIFICATION | ASSESSED VALUE | STATUS | ELAPSED TIME | ACTION
- Row 1: 
  * Docket: "PAS-2026-0849" (Bold)
  * PIN: "024-18-0012-005-22" (Mono font)
  * Owner: "Juan M. Dela Cruz"
  * Class: "Residential 1 (450 sqm)"
  * Value: "PHP 108,000.00"
  * Status: Yellow Badge "In Review at Capitol (Pili)"
  * Elapsed: "4 hrs ago"
  * Action: Button "Track Docket" (White, border #D1D5DB)
- Row 2: 
  * Docket: "PAS-2026-0847"
  * PIN: "024-18-0004-019-10"
  * Owner: "Elena S. Villafuerte"
  * Class: "Agricultural (2.4 ha)"
  * Value: "PHP 284,000.00"
  * Status: Red Badge "Deficiency: Survey Discrepancy"
  * Elapsed: "1 day ago"
  * Action: Button "Resolve Notes" (Black text, underline)
- Row 3: 
  * Docket: "PAS-2026-0842"
  * PIN: "024-18-0001-088-02"
  * Owner: "Sta. Rosa Commercial Corp."
  * Class: "Commercial 2 (1,200 sqm)"
  * Value: "PHP 1,450,000.00"
  * Status: Green Badge "CIS Approved & Synced"
  * Elapsed: "2 days ago"
  * Action: Button "View e-TD" (White, border #D1D5DB)

================================================================================
VIEW 2: "LEGACY VAULT 1949" (Active Sidebar: Legacy Records Vault)
================================================================================
Top Header:
- Title: "Historical Assessment Records Vault (1949–Present)"
- Subtitle: "Search, cross-reference, and migrate decades-old municipal ledgers and pre-computerization archives"
- Right Action: Button "Digitize & Ingest New Ledger Page" (Black #111827, white text)

Search & Revision Filter Bar (White container, 1px border #E5E7EB, padding 16px, radius 8px):
- Search input (Full width): "Search by Old Cadastral Lot, Historical Owner, Spanish Title, or Vintage TD No..."
- Revision Chips (Clickable filters): [All Revisions] [• 1949 Foundation] [1967 General Revision] [1970 Revision] [1993 Revision] [2021 eRPT]

Two-Column Vault Layout (Split 450px left list, 690px right document viewer):
- Left Column (Historical Record Matches List):
  * Result Item 1 (Active/Selected, border 2px solid #111827, background #FFFFFF):
    - Title: "Vintage TD No. 1949-0412" (Bold 14px)
    - Original Declarant: "Don Mariano Dela Cruz (Deceased 1968)"
    - Parcel: "Cadastral Lot 4102 (Original Madre Lot), Pasacao"
    - Physical Location Tag: "📍 Vault Room B, Shelf 4, Binder 1949-A"
    - Year Tag: "General Revision 1949"
  * Result Item 2 (Default, border 1px #E5E7EB):
    - Title: "Vintage TD No. 1967-1189" | Declarant: "Fausto M. Asido" | Lot 3891 | "📍 Vault Room A, Binder 1967-08"
- Right Column (Deep Archival Inspection Workspace):
  * Header: "Archival Digital Master & Chain of Title (Vintage TD #1949-0412)"
  * Scanned Document Frame (Height 380px, border 1px #E5E7EB, background #F3F4F6):
    - Realistic paper parchment preview with aged stamp: "PROVINCIAL ASSESSOR CAMARINES SUR - RECORDED MARCH 14, 1949".
    - Handwritten script transcription callout box.
  * Chain-of-Title Timeline (Horizontal mini-stepper):
    [1949: Mariano Dela Cruz (Original)] -> [1972: Estate Partition] -> [2004: Subdivision Lot 4102-B] -> [2026: Juan Dela Cruz (Active Transfer)]
  * Bottom Action Bar:
    - Button "Print Certified True Copy" (White, border #D1D5DB)
    - Primary Button: "Migrate Record to Modern e-TD Draft ->" (Black #111827, white text)

================================================================================
VIEW 3: "SMV MATRIX 2024" (Active Sidebar: SMV Matrix 2024)
================================================================================
Top Header:
- Title: "Provincial Schedule of Base Market Values (SMV Matrix 2024)"
- Subtitle: "Camarines Sur Provincial Ordinance No. 2024-08 | Standard Rates for LGU Pasacao"
- Right Actions: Button "Export SMV PDF" + Button "Open Valuation Simulator" (Black #111827)

Category Navigation Tabs (Underlined minimal tabs):
- [Residential (R-1 to R-4) - ACTIVE] [Commercial (C-1 to C-3)] [Agricultural (Ag-1 to Ag-6)] [Industrial] [Mineral/Special]

Main SMV Lookup Table (White background, 1px border #E5E7EB, radius 8px):
- Columns: SUB-CLASS | DESCRIPTION | APPLICABLE BARANGAY / ZONE | UNIT BASE MARKET VALUE | STATUTORY ASSESSMENT LEVEL | COMPUTATION EXAMPLE
- Row 1: 
  * Sub-Class: "R-1 (Residential First Class)"
  * Description: "Paved concrete road frontage, complete water & power access"
  * Zones: "Poblacion, Sta. Rosa del Sur, Caranan Highway"
  * Base Value: "PHP 1,200.00 / sqm" (Bold Mono)
  * Level: "20.00%"
  * Example: "400 sqm = PHP 480k Base -> PHP 96k Assessed"
- Row 2: 
  * Sub-Class: "R-2 (Residential Second Class)"
  * Description: "Gravel road, interior access within 500m of main highway"
  * Zones: "San Roque, Dalupaon, Balogo"
  * Base Value: "PHP 850.00 / sqm"
  * Level: "20.00%"
  * Example: "400 sqm = PHP 340k Base -> PHP 68k Assessed"
- Row 3: 
  * Sub-Class: "R-3 (Residential Third Class)"
  * Description: "Unpaved barangay road, rural residential clusters"
  * Zones: "Quitang, Tinalmud, Hubo"
  * Base Value: "PHP 550.00 / sqm"
  * Level: "15.00%"
  * Example: "400 sqm = PHP 220k Base -> PHP 33k Assessed"

Bottom Built-In Quick Calculator Dock (Floating card at bottom, 1152px width, background #FFFFFF, border 2px solid #111827, radius 8px, padding 16px, auto-layout horizontal, space-between):
- Left Inputs: "Quick SMV Tester:" | Dropdown: "R-1 (PHP 1,200/sqm)" | Input: "Area: 500 sqm"
- Right Outputs: "Calculated Market Value: PHP 600,000.00" | "Assessed Value (20%): PHP 120,000.00" | Button "Apply to Active Docket"
```

---

### Initial Prompt C — Provincial Capitol Remote Endorsement & Digital Approval Workspace (Module 3)
```text
Design a complete, multi-screen interactive desktop prototype (1440x900px per screen) for the "RPAT-IOSS Provincial Capitol Remote Endorsement & Digital Approval Workspace" (Module 3). 

STRICT DESIGN SYSTEM (MONOCHROME MINIMALIST - PREDOMINANTLY WHITE):
- Canvas / Background: #F9FAFB (Off-white / Zinc 50)
- Card Surfaces & Sidebar: #FFFFFF (Pure White) with 1px solid border #E5E7EB
- Typography: Inter or Geist font. Deep Charcoal Black (#111827) for headings/data, Neutral Gray (#6B7280) for labels.
- Primary Buttons: Solid Black #111827 with Crisp White text.
- Secondary Buttons: White #FFFFFF with 1px border #D1D5DB and Black #111827 text.
- Accent Status Badges:
  * "Under Capitol Review": Background #FFFBEB, Text #92400E, Border 1px #FDE68A
  * "CIS Approved & Dispatched": Background #ECFDF5, Text #065F46, Border 1px #A7F3D0
  * "Deficiency Flagged": Background #FEF2F2, Text #991B1B, Border 1px #FECACA

GLOBAL CAPITOL SIDEBAR (240px width, fixed left, white background, right border 1px #E5E7EB):
- Header: Provincial Seal icon, "PROVINCIAL ASSESSOR", Subtitle "Capitol Complex, Pili, CamSur".
- LGU Filter Chip inside sidebar: Dropdown "[📍 LGU: Pasacao (Active)]"
- Navigation Menu:
  * Item 1: "Master Review Queue" (Lucide 'Inbox' icon, badge: "7 Pending")
  * Item 2: "Remote Inspection Workspace" (Lucide 'FileSearch' icon)
  * Item 3: "CIS Digital Sign-Off" (Lucide 'Stamp' icon, badge: "3")
  * Item 4: "Deficiency Tracker" (Lucide 'AlertCircle' icon, badge: "2")
  * Item 5: "LGU Latency Analytics" (Lucide 'BarChart3' icon)
- User Profile: "Engr. R. Villafuerte" | "Provincial Technical Review Examiner"

================================================================================
SCREEN 1: MASTER REVIEW QUEUE (Sidebar: "Master Review Queue" ACTIVE)
================================================================================
Top Header (Height 64px, White, border bottom 1px #E5E7EB, padding 0 32px):
- Breadcrumbs: "Provincial Capitol > Review Queue > All Component LGUs"
- Right: Search bar "Search Docket ID, PIN, or Declarant..." + LGU Filter Dropdown "[All 35 LGUs / Pasacao Selected]"

Metrics Overview (4 white cards in row, 270px width each, 1px border #E5E7EB):
- Card 1: "TOTAL PENDING REVIEWS" -> "14 Dockets" (Subtext: "Across 35 component LGUs")
- Card 2: "PASACAO PIPELINE" -> "7 Dockets" (Subtext: "Avg. turnaround: 5.4 hours")
- Card 3: "DEFICIENCIES ACTIVE" -> "3 Returned" (Subtext: "Awaiting municipal re-upload")
- Card 4: "CIS ISSUED THIS MONTH" -> "142 Clearances" (Subtext: "Zero paper courier trips")

Filter Tabs & Action Bar:
- Horizontal Tabs: [All Dockets (14)] [Pasacao (7) - ACTIVE] [Canaman (3)] [Magarao (2)] [San Fernando (2)]
- Quick Filter: Checkbox "[x] Prioritize Transfers of Assessment"

Data Table (White, 1px border #E5E7EB, radius 8px):
- Columns: DOCKET ID | MUNICIPALITY | PROPERTY INDEX NO. (PIN) | OWNER / DECLARANT | TRANSACTION | TRANSMITTED | STATUS | ACTION
- Row 1 (CLICK TARGET TO SCREEN 2):
  * Docket: "CAP-PAS-2026-0849" (Bold 13px)
  * LGU: "Pasacao" (Pill badge #F3F4F6)
  * PIN: "024-18-0012-005-22" (Mono font)
  * Owner: "Juan M. Dela Cruz"
  * Transaction: "Transfer of Assessment (Lot 4102-B)"
  * Transmitted: "Today, 09:15 AM"
  * Status: Amber Badge "Under Technical Review"
  * Action: Button "Open Inspection Workspace ->" (Black #111827, white text, 32px height)
- Row 2:
  * Docket: "CAP-PAS-2026-0850" | LGU: "Pasacao" | PIN: "024-18-0008-011-04" | Owner: "Caranan Fishing Corp." | Transaction: "New Commercial Building" | Transmitted: "Today, 11:30 AM" | Status: "Pending Review" | Action: Button "Inspect"
- Row 3:
  * Docket: "CAP-CAN-2026-0312" | LGU: "Canaman" | PIN: "019-04-0002-091-12" | Owner: "Fausto M. Asido" | Transaction: "Subdivision Consolidation" | Transmitted: "Yesterday" | Status: Red Badge "Deficiency Flagged" | Action: Button "View Notes"

================================================================================
SCREEN 2: REMOTE INSPECTION & CADASTRAL VERIFICATION (Sidebar: "Remote Inspection Workspace" ACTIVE)
================================================================================
Top Docket Banner (White container, 1px border #E5E7EB, radius 8px, padding 16px 24px):
- Left info: Title "Inspection Docket #CAP-PAS-2026-0849", Subtitle "Pasacao Recommending Endorsement | Declarant: Juan M. Dela Cruz"
- Stepper Progress Bar:
  1. [x] Municipal Assessor Recommending Endorsement (Completed, 08:30 AM)
  2. [*] Capitol Remote Technical Audit (ACTIVE)
  3. [ ] Provincial Assessor Sign-Off & CIS Issuance
  4. [ ] Synced to Pasacao Treasury
- Right Header Actions:
  * Button "Flag Discrepancy" (White, red border #FECACA, text #991B1B) -> CLICK TARGET TO MODAL
  * Button "Forward to Provincial Assessor for Sign-Off ->" (Black #111827, white text) -> CLICK TARGET TO SCREEN 3

Two-Column Workspace (Split 640px left viewer, 500px right audit panel, 680px height):
- Left Column (Multi-Tab Document Viewer, White, 1px border #E5E7EB, radius 8px):
  * Top Tab Navigation: 
    [Tab 1: Cadastral Survey Plan - ACTIVE (Underlined)] [Tab 2: Deed of Absolute Sale] [Tab 3: BIR eCAR & Transfer Tax] [Tab 4: Municipal FAAS]
  * Document Canvas: High-precision cadastral plot blueprint:
    - Text overlay: "Lot 4102-B, Cad. 544-D, Sta. Rosa del Sur, Pasacao"
    - Bearing data: "N 45° 12' E, 15.00m | Area: 450.00 sqm | Tie Line: BLLM No. 1"
    - Clean vector map showing road frontage and boundary coordinates.
  * Viewer Toolbar: Zoom In, Zoom Out, 100%, Rotate, Fullscreen, Watermark toggle ("CAPITOL AUDIT COPY").

- Right Column (Provincial Examiner Audit Checklist, White, 1px border #E5E7EB, radius 8px, padding 24px):
  * Section Title: "Provincial Statutory Verification Checklist"
  * Audit Item 1: Toggle [ON] "1. Schedule of Base Market Values (SMV) Compliance"
    - Subtext: "Verified Pasacao R-1 Unit Value @ PHP 1,200.00/sqm = PHP 540,000.00 Base Value."
  * Audit Item 2: Toggle [ON] "2. Cadastral Boundary & Non-Overlap Check"
    - Subtext: "Cross-checked against provincial cadastral index; no overlap with Lot 4102-A."
  * Audit Item 3: Toggle [ON] "3. Tax Clearance & Prior Lien Verification"
    - Subtext: "Pasacao Treasury OR #7849102 verified. Zero arrears."
  * Audit Item 4: Toggle [ON] "4. Documentary Stamp & BIR eCAR Completeness"
    - Subtext: "eCAR No. 2026-00088921 verified with BIR RDO 65."
  * Examiner Internal Note Box: Textarea containing "All survey bearings conform with Provincial Survey standards. Ready for final statutory endorsement."
  * Examiner Stamp: "Audited by: Engr. R. Villafuerte, Technical Examiner (Sept 24, 2026, 10:22 AM)"

================================================================================
MODAL OVERLAY: DEFICIENCY NOTIFICATION DRAWER (Triggers on "Flag Discrepancy" click)
================================================================================
Centered Modal Frame: 520px width x 480px height, Background #FFFFFF, Border 1px #E5E7EB, Radius 12px, Shadow 0 20px 25px -5px rgba(0,0,0,0.1).
- Modal Header: Title "Flag Deficiency for Docket #CAP-PAS-2026-0849", Subtitle "This will immediately halt the queue and notify the Pasacao Assessor."
- Discrepancy Reason Checkboxes:
  [ ] Incorrect SMV Unit Rate applied
  [x] Cadastral Boundary overlap / missing surveyor signature
  [ ] Incomplete BIR eCAR or unnotarized Deed of Sale
  [ ] Discrepancy in declared land area
- Detailed Remarks Input: Textarea filled with: "Cadastral survey tie-line bearing deviates by 1.2m on the eastern boundary of Lot 4102-A. Please request the geodetic surveyor to submit an amended CIS sketch."
- Modal Actions: 
  * Button "Cancel & Keep Under Review" (White, border #D1D5DB) -> Closes Modal back to Screen 2
  * Button "Dispatch Deficiency Notice to LGU" (Solid Red #DC2626, white text) -> Navigates to Screen 4

================================================================================
SCREEN 3: PROVINCIAL ASSESSOR FINAL SIGN-OFF & CIS ISSUANCE (Sidebar: "CIS Digital Sign-Off" ACTIVE)
================================================================================
Top Header:
- Title: "Final Statutory Endorsement & CIS Execution"
- Subtitle: "Provincial Assessor statutory approval under RA 7160 Section 202"

Main Verification Container (Centered, 780px width, Background #FFFFFF, 1px border #E5E7EB, radius 12px, padding 32px):
- Header Callout: "Docket CAP-PAS-2026-0849 has cleared technical examination."
- Document Summary Table:
  * Municipality: "Pasacao, Camarines Sur"
  * Declarant: "Juan M. Dela Cruz" | PIN: "024-18-0012-005-22"
  * Assessed Value: "PHP 108,000.00"
  * Recommended by: "Engr. Wilson M. Pasacao (Municipal Assessor)"
  * Audited by: "Engr. R. Villafuerte (Provincial Examiner)"
- Certificate of Inspection & Survey (CIS) Official Seal Box:
  * Border 2px solid #111827, Padding 24px, Radius 8px:
  * "REPUBLIC OF THE PHILIPPINES | PROVINCIAL ASSESSOR'S OFFICE | PROVINCE OF CAMARINES SUR"
  * CIS Serial Number: "CIS-CAM-2026-1104" (Large bold Mono font)
  * QR Code Placeholder (80x80px square with digital signature hash)
  * Checkbox: "[x] I hereby certify that the appraisal, assessment, and boundaries for this real property have been examined and statutorily approved for taxation purposes."
- Bottom Action Buttons:
  * Secondary Button: "Back to Inspection Workspace" -> CLICK TARGET TO SCREEN 2
  * Primary Button: "Sign, Issue CIS & Auto-Sync with Pasacao Treasury ->" (Full width, Height 48px, Black #111827, white text)

================================================================================
SCREEN 4: DEFICIENCY & RESOLUTION TRACKER (Sidebar: "Deficiency Tracker" ACTIVE)
================================================================================
Top Header:
- Title: "Flagged Discrepancies & Resolution Tracker"
- Subtitle: "Monitor dossiers returned to component municipalities awaiting re-upload or clarification"

Data Table (White, 1px border #E5E7EB, radius 8px):
- Columns: DOCKET ID | LGU | FLAGGED REASON | EXAMINER | FLAGGED DATE | STATUS | ACTION
- Row 1:
  * Docket: "CAP-PAS-2026-0849" | LGU: "Pasacao" | Reason: "Boundary overlap on Lot 4102-A" | Examiner: "R. Villafuerte" | Date: "Today, 10:30 AM" | Status: Red Badge "Awaiting LGU Re-upload" | Action: Button "View Discrepancy Thread"
- Row 2:
  * Docket: "CAP-CAN-2026-0312" | LGU: "Canaman" | Reason: "Missing BIR eCAR Notarization" | Examiner: "M. Chavez" | Date: "Sept 22, 2026" | Status: Green Badge "Re-uploaded by LGU (Ready for Re-check)" | Action: Button "Re-inspect Now ->" (Black #111827)
```

---

### Initial Prompt D — Municipal Treasury Synchronization & Ledger Reconciliation Workspace (Module 2)
```text
Design a complete, multi-screen interactive desktop prototype (1440x900px per screen) for the "RPAT-IOSS Municipal Treasury Synchronization & Ledger Reconciliation Workspace" (Module 2).

STRICT DESIGN SYSTEM (MONOCHROME MINIMALIST - PREDOMINANTLY WHITE):
- Canvas / Background: #F9FAFB (Off-white / Zinc 50)
- Card Surfaces & Sidebar: #FFFFFF (Pure White) with 1px solid border #E5E7EB
- Typography: Inter or Geist font. Deep Charcoal Black (#111827) for text, headings, and numbers; Neutral Slate (#6B7280) for labels.
- Primary Buttons: Solid Black #111827 with Crisp White text, radius 6px.
- Secondary Buttons: White #FFFFFF with 1px border #D1D5DB and Black #111827 text.
- Accent Status Badges (Subtle pastels):
  * "Payment Settled / Cleared": Background #ECFDF5, Text #065F46, Border 1px #A7F3D0
  * "Live Sync Pending Payment": Background #FFFBEB, Text #92400E, Border 1px #FDE68A
  * "Delinquent / Overdue": Background #FEF2F2, Text #991B1B, Border 1px #FECACA

GLOBAL TREASURY SIDEBAR (240px width, fixed left, white background, right border 1px #E5E7EB):
- Header: Pasacao Seal icon, "MUNICIPAL TREASURY", Subtitle "Office of the Municipal Treasurer".
- Live Sync Indicator: Green pill with pulsing dot: "🟢 Assessor Sync: Active"
- Navigation Menu:
  * Item 1: "Treasury Dashboard" (Lucide 'LayoutGrid' icon)
  * Item 2: "Tax Billing Calculator" (Lucide 'Calculator' icon, badge: "1 New")
  * Item 3: "Cashier Window & Receipting" (Lucide 'CreditCard' icon)
  * Item 4: "Tax Clearances Issued" (Lucide 'FileCheck' icon)
  * Item 5: "Delinquency Registry" (Lucide 'AlertOctagon' icon)
  * Item 6: "Daily Collection Reports" (Lucide 'BarChart2' icon)
- User Profile: "Maria L. Santos" | "Municipal Treasury Cashier / Revenue Collector"

================================================================================
SCREEN 1: TREASURY DASHBOARD & LIVE SYNC FEED (Sidebar: "Treasury Dashboard" ACTIVE)
================================================================================
Top Header (Height 64px, White, border bottom 1px #E5E7EB, padding 0 32px):
- Breadcrumbs: "Municipal Treasury > Dashboard & Live Assessment Stream"
- Right: Search input "Search Taxpayer Name, PIN, or OR Number..." + Date Display "Thursday, Sept 24, 2026"

Real-Time Sync Notification Banner (Full width container, 1px border #E5E7EB, radius 8px, padding 14px 20px, background #FFFFFF):
- Auto-layout horizontal: Green badge "REAL-TIME ASSESSOR BRIDGE" + Text: "1 new approved Tax Declaration synchronized from Capitol approval 6 minutes ago (PIN 024-18-0012-005-22). Ready for immediate billing calculation."

Metrics Overview (4 white cards in row, 270px width each, 1px border #E5E7EB, radius 8px, padding 16px):
- Card 1: "TODAY'S RPT COLLECTIONS" -> "PHP 184,520.00" (Subtext: "48 Transactions processed")
- Card 2: "NEW ASSESSOR ROLLS SYNCED" -> "12 Properties" (Subtext: "Zero manual roll encoding")
- Card 3: "DISCOUNTS GRANTED (Q1)" -> "PHP 18,452.00" (Subtext: "10% prompt payment incentive")
- Card 4: "TAX CLEARANCES RELEASED" -> "41 Issued" (Subtext: "Average release: 3 minutes")

Main Content Layout (Two sections: Active Synchronization Queue on left 820px, Quick Lookups on right 340px):
- Left Section: Live Incoming Assessment Queue Table (White, 1px border #E5E7EB, radius 8px):
  * Table Header: SYNC TIME | PROPERTY INDEX NO. | OWNER NAME | CLASSIFICATION | ASSESSED VALUE | ROLL SOURCE | ACTION
  * Row 1 (CLICK TARGET TO SCREEN 2):
    - Sync Time: "10:28 AM (6m ago)"
    - PIN: "024-18-0012-005-22" (Mono font)
    - Owner: "Juan M. Dela Cruz"
    - Class: "Residential 1 (450 sqm)"
    - Assessed Value: "PHP 108,000.00"
    - Source: Pill "Capitol CIS Approved"
    - Action: Button "Calculate Billing & Collect ->" (Black #111827, white text, 32px height)
  * Row 2:
    - Sync Time: "09:45 AM" | PIN: "024-18-0003-014-08" | Owner: "Salvador B. Ramos" | Class: "Commercial 1" | Value: "PHP 840,000.00" | Source: "Assessor Roll" | Action: Button "View Ledger"
  * Row 3:
    - Sync Time: "08:15 AM" | PIN: "024-18-0009-002-15" | Owner: "Beatriz A. Gomez" | Class: "Agricultural" | Value: "PHP 92,000.00" | Source: "Assessor Roll" | Action: Button "View Ledger"

- Right Section: Quick Taxpayer Lookup Card (White, 1px border #E5E7EB, radius 8px, padding 20px):
  * Title: "Direct Parcel Ledger Lookup"
  * Input 1: "Enter PIN or Old TD No."
  * Input 2: "Tax Year (e.g. 2026)"
  * Button: "Fetch Assessment Ledger" (White, border 1px #D1D5DB, full width)
  * Callout Box: "Note: Real-time synchronization eliminates the need to cross-check physical books in the Assessor's office."

================================================================================
SCREEN 2: TAX BILLING & DUES CALCULATOR (Sidebar: "Tax Billing Calculator" ACTIVE)
================================================================================
Top Header:
- Breadcrumbs: "Treasury > Billing Calculator > Docket #PAS-2026-0849"
- Right Actions: Button "Print Assessment Notice" + Button "Proceed to Cashier Payment ->" (Black #111827, white text) -> CLICK TARGET TO SCREEN 3

Taxpayer & Property Profile Card (White, 1px border #E5E7EB, radius 8px, padding 20px, margin-bottom 20px):
- 4-Column Grid:
  * Col 1: Taxpayer Name: "Juan M. Dela Cruz" | Contact: "0917-555-8912"
  * Col 2: Property PIN: "024-18-0012-005-22" | Location: "Brgy. Sta. Rosa del Sur, Pasacao"
  * Col 3: Class: "Residential 1 (R-1)" | Land Area: "450.00 sqm"
  * Col 4: Market Value: "PHP 540,000.00" | Assessed Value: "PHP 108,000.00 (20%)"

Itemized Annual Real Property Tax Computation Table (White, 1px border #E5E7EB, radius 8px, padding 24px):
- Table Header: TAX COMPONENT | STATUTORY RATE | BASIS (ASSESSED VALUE) | GROSS ANNUAL DUE | APPLICABLE INCENTIVE / PENALTY | NET DUE
- Row 1: Basic Real Property Tax | 1.00% (RA 7160) | PHP 108,000.00 | PHP 1,080.00 | -10% Prompt Discount (-PHP 108.00) | PHP 972.00
- Row 2: Special Education Fund (SEF) | 1.00% (Sec. 235) | PHP 108,000.00 | PHP 1,080.00 | -10% Prompt Discount (-PHP 108.00) | PHP 972.00
- Row 3 (Summary Row, background #F9FAFB, font-weight bold):
  * "TOTAL REAL PROPERTY TAX DUE (TAX YEAR 2026)": Gross PHP 2,160.00 | Total Discount: -PHP 216.00 | NET PAYABLE: "PHP 1,944.00"

Automated Statutory Rule Explainer (Horizontal auto-layout, padding 16px, background #F3F4F6, radius 6px, margin-top 16px):
- Icon: Lucide 'Info' 20px.
- Text: "Statutory Rule Applied: 10% Prompt Payment Discount automatically applied in accordance with Pasacao Municipal Revenue Code (Payment made in Q1). No prior-year delinquencies detected from 1949–2025 archival audit."

Quarterly Installment Breakdown (4 equal columns across bottom):
- Q1 (Due Mar 31): PHP 486.00 (Current)
- Q2 (Due Jun 30): PHP 486.00
- Q3 (Due Sep 30): PHP 486.00
- Q4 (Due Dec 31): PHP 486.00
- Toggle Switch: "[• Full Annual Settlement (Recommended for Clearance)]"

================================================================================
SCREEN 3: CASHIER PAYMENT DESK & OFFICIAL RECEIPT REGISTER (Sidebar: "Cashier Window" ACTIVE)
================================================================================
Top Header:
- Title: "Cashier Payment Window #3 | Real Property Tax Collection"
- Subtitle: "Record official payment, validate ledger balance, and issue clearance"

Two-Column Cashier Layout (Split 680px left payment entry, 480px right receipt summary):
- Left Column: Payment Intake Form (White, 1px border #E5E7EB, radius 8px, padding 24px):
  * Section 1: Settlement Particulars
    - Payor Name: Input "Juan M. Dela Cruz"
    - Settlement Scope: Radio button selected "(•) Full Year 2026 Assessment (PHP 1,944.00)"
  * Section 2: Payment Instrument
    - Payment Method Tabs: [• Cash - ACTIVE] [LandBank Link.Biz / e-LGU] [Manager's Check]
    - Net Amount Due: Displayed large "PHP 1,944.00"
    - Amount Tendered: Input field with value "PHP 2,000.00"
    - Change Due: Auto-calculated callout box: "CHANGE: PHP 56.00" (Bold 18px)
  * Section 3: Official Receipt Sequencing
    - Electronic OR Serial: Auto-generated "OR-2026-993841" (Mono font, badge "Valid Series")
    - Fund Allocation: General Fund (PHP 972.00) + Special Education Fund (PHP 972.00)
  * Primary Action Button: Full-width Black Button (Height 48px): 
    "Validate Payment, Issue OR #993841 & Generate Electronic Tax Clearance ->" -> CLICK TARGET TO SCREEN 4

- Right Column: Real-Time Payment Ledger Summary (White, 1px border #E5E7EB, radius 8px, padding 24px):
  * Account Status: Green Badge "READY FOR SETTLEMENT"
  * Verification Checklist:
    [x] Assessor e-TD verified & synchronized (TD-2026-024-04912)
    [x] Provincial Capitol CIS clearance attached (CIS-CAM-2026-1104)
    [x] Zero prior year encumbrances or court litigation
  * Live Receipt Preview Box (Height 320px, dashed 1px border #D1D5DB, background #F9FAFB, padding 16px):
    - Top: "MUNICIPALITY OF PASACAO | OFFICIAL RECEIPT"
    - Date: "September 24, 2026 - 10:35 AM"
    - Received from: "Juan M. Dela Cruz"
    - Sum of: "One Thousand Nine Hundred Forty-Four Pesos Only"
    - Cashier Signature: "Maria L. Santos, Revenue Collector"

================================================================================
SCREEN 4: ELECTRONIC TAX CLEARANCE CERTIFICATE (Sidebar: "Tax Clearances Issued" ACTIVE)
================================================================================
Top Header:
- Title: "Electronic Tax Clearance Certificate Generated"
- Subtitle: "Authenticated real property tax clearance issued upon full payment reconciliation"
- Right Actions:
  * Button "Email to Taxpayer" (White, border #D1D5DB)
  * Button "Print Official Certificate" (Black #111827, white text, Lucide 'Printer' icon)
  * Button "Return to Treasury Dashboard" (White, border #D1D5DB) -> CLICK TARGET TO SCREEN 1

Main Certificate Container (Centered, 780px width, Background #FFFFFF, border 2px solid #111827, radius 12px, padding 40px, shadow 0 10px 15px -3px rgba(0,0,0,0.05)):
- Header Block (Centered):
  * "REPUBLIC OF THE PHILIPPINES | PROVINCE OF CAMARINES SUR"
  * "MUNICIPALITY OF PASACAO"
  * "OFFICE OF THE MUNICIPAL TREASURER"
  * Title: "CERTIFICATION OF REAL PROPERTY TAX PAYMENT (TAX CLEARANCE)" (18px Bold #111827, margin-top 12px)
- Serial & Date Bar (Auto-layout space-between, margin-top 16px, border-bottom 1px solid #E5E7EB, padding-bottom 8px):
  * Clearance Serial No.: "TC-PAS-2026-0419" (Bold Mono)
  * Date Issued: "September 24, 2026" | Validity: "Valid until December 31, 2026"
- Certification Body Text:
  * "TO WHOM IT MAY CONCERN: This is to certify that according to the records of this Office, the real property declared in the name of JUAN M. DELA CRUZ, covered by Tax Declaration No. TD-2026-024-04912, Property Index Number 024-18-0012-005-22, situated at Brgy. Sta. Rosa del Sur, Pasacao, Camarines Sur, with an Assessed Value of ONE HUNDRED EIGHT THOUSAND PESOS (PHP 108,000.00), has been FULLY PAID of all Real Property Taxes and Special Education Funds up to and including Tax Year 2026."
  * "This certification is issued upon the request of the interested party for the purpose of TRANSFER OF ASSESSMENT / CONVEYANCE REGISTRATION."
- Payment Audit Metadata Box (Light gray background #F9FAFB, border 1px #E5E7EB, padding 16px, radius 6px, margin-top 24px):
  * Official Receipt No.: "OR-2026-993841"
  * Total Amount Paid: "PHP 1,944.00"
  * Payment Date: "Sept 24, 2026 - 10:35 AM"
  * Inter-Office Transaction Latency: "Total turnaround: 2 hours 20 mins (Zero counter hopping)"
- Bottom Sign-off & Verification Seal (2-columns, margin-top 32px):
  * Left: QR Code graphic (90x90px) with caption "Scan to verify authentic LGU Pasacao Tax Clearance token."
  * Right: Official Signature Line:
    - "HON. MUNICIPAL TREASURER"
    - "Municipal Treasurer, Pasacao, Camarines Sur"
```

---

## Phase 2 — Iterative HCI Redesign, WCAG 2.2 AA Remediation & Production Architecture

---

### Prompt 1 — Comprehensive HCI & Accessibility Research Synthesis (Zero-Hallucination Grounding)
```text
Conduct a comprehensive, zero-shortcut audit of all project research, accessibility evaluations, and dataset artifacts inside the `Document/` directory. Synthesize all findings strictly from the source files without introducing unverified assumptions:
- Extract every empirical finding, UX law evaluation, and remediation item across `Design_recomendation.pdf` (26 expert findings), `GROUP 23_Case Study & UX Laws Evaluation.pdf`, `GRP23_Accessibility_UX_Case_Study_WCAG2.2.pdf` (12 POUR issue clusters), `WCAG 2.2 CHECKLIST.pdf`, and both ISO 9241-210 case study manuscripts.
- Cross-check all authentic LGU Pasacao property parcels, tax roll figures, and collection records from `Assessment_Roll.tsv` and `Treasurer_Collections.tsv`.
- Identify any conflicting data, design gaps, or open confirmation items prior to architectural planning.
```
- **Outcome:** Mapped all 26 design findings, 12 WCAG 2.2 AA POUR clusters, 5 Laws of UX, target municipal & PWD personas, and authentic Pasacao datasets into a verified redesign specification.

---

### Prompt 2 — Role-Based User-Centered Architecture Plan (ISO 9241-210 & WCAG 2.2 AA)
```text
Re-architect RPAT-IOSS from a single-page presentation switcher into a user-centered, role-based civic-tech system aligned with `rubrics.md`, ISO 9241-210, and WCAG 2.2 Level AA:
- Draft an end-to-end implementation plan detailing:
  1. Role-based Employee ID authentication (`LoginGateway`) routing staff directly to their authorized Municipal Assessor, Provincial Capitol, or Municipal Treasury workspace.
  2. Real-time reactive state (`RpatisContext`) synchronizing appraisals, Capitol endorsements, cryptographic SHA-256 CIS approvals, and Form 56 Treasury payments across offices.
  3. Full POUR accessibility remediation (Multi-Cue Status Chips with ≥ 4.5:1 contrast, semantic HTML5 tables/landmarks, 44px+ interactive targets, `aria-live="polite"` sync toasts, 1-click fuzzy search recovery, and two-step financial confirmation modals).
```
- **Outcome:** Produced `plan_role_based_rpatis.md`, then implemented `RpatisContext`, `LoginGateway`, `RoleLayout`, `AuthenticQrCode`, `StatusChip`, and rebuilt all office modules.

---

### Prompt 3 — Full-Screen Edge-to-Edge Enterprise Viewport Layout
```text
Refactor the entire application shell—including the staff authentication gateway, role-based office workspaces, and citizen portal—from boxed centered cards into a crisp, full-screen edge-to-edge layout (`w-full`, `min-h-screen`) optimized for 1440×900 desktop government terminals while preserving clean responsive breakpoints.
```
- **Outcome:** Removed constrained outer wrappers across `RoleLayout.tsx`, `LoginGateway.tsx`, and all workspace views to maximize usable data density and table legibility.

---

### Prompt 4 — Production Environment Isolation vs. Presentation Sandbox (`/?demo=1`)
```text
Refactor all primary UI views strictly for real-life LGU production deployment:
- Remove all presentation-only shortcuts, one-click persona autofill cards, in-app role switchers, sample test chips, and internal academic annotations (`(Finding [#])`, `(WCAG)`, `(FR#)`) from standard production routes.
- Isolate presentation walkthrough controls into a dedicated `DemoPresenterBar` component that mounts exclusively when `?demo=1` is explicitly passed in the URL.
```
- **Outcome:** Hardened production views for authentic staff deployment while preserving an isolated `/?demo=1` presenter bar for defense walkthroughs.

---

### Prompt 5 — Standalone Public Citizen Portal Routing (`/citizen`)
```text
Enforce strict network and portal separation between internal LGU staff systems and public taxpayer access:
- Remove all public tracking links and Citizen Portal toggles from the internal LGU Staff Login gateway (`/`).
- Expose the Pasacao Citizen Real Property Portal exclusively via dedicated public paths (`/citizen`, `/portal`, and `/track`) with RA 10173 owner-name privacy masking.
```
- **Outcome:** Separated public self-service tracking cleanly onto standalone paths in `App.tsx`, enforcing zero public portal leakage on the staff authentication screen.

---

### Prompt 6 — Citizen's Charter 11 Official Municipal Assessor Frontline Services
```text
Audit every official Municipal Assessor frontline service documented in `Document/ServicesDocu/` (ignoring `CurentSystem/` legacy screenshots) against our implemented system:
- Transcribe all 11 official Camarines Sur Citizen's Charter services, including service SLAs, statutory fees, documentary requirements, and the 3 Transfer tracks (*Standard Residential/Agricultural Sale*, *DAR EP/CLOA*, and *Extra-Judicial Settlement with Deed of Sale*).
- Plan and implement complete digital workflows organized under Hick's Law into 3 clear sidebar groups (*Appraisal & Endorsement*, *Frontline Counter Services*, and *Archives, Rates & Disputes*).
```
- **Outcome:** Implemented `ViewCertifications.tsx`, `ViewLiensMortgages.tsx`, `ViewValidationPinId.tsx`, and `ViewProblemResolution.tsx`; added 3-track Transfer verification checklists in `Screen1Assessor.tsx`; and embedded all 6 Citizen's Charter readiness checklists in `Screen4CitizenPortal.tsx`.

---

### Prompt 7 — Exemplary Rubric Self-Audit & 1440px Zero-Clipping Optimization
```text
Evaluate the live application strictly against all five Exemplary evaluation criteria in `rubrics.md` across a 1440×900 desktop viewport. Identify and resolve any layout overflow, horizontal table clipping, contrast issues, or workflow gaps before final verification.
```
- **Outcome:** Consolidated Treasury's Assessment Roll table into 8 non-clipping columns fitting cleanly at `1440px` without horizontal overflow, and verified `StatusChip` precedence (`Unpaid` always renders red `AlertTriangle`).

---

### Prompt 8 — Historical Cadastre Vault Naming, Digitization & Transfer-to-Modern Workflow
```text
Refine the archival module for real-life municipal operations:
- Rename the legacy archive section cleanly to **Historical Cadastre Vault** across navigation labels, headings, and alerts.
- Provide two structured, blank-by-default modal workflows inside the vault:
  1. **Digitize Paper Ledger:** Ingest historical Spanish-era and pre-computerization tax declarations into the read-only vault.
  2. **Transfer Record to Modern System:** Display the vintage record side-by-side (read-only) with a modern Property Record & FAAS transfer form that generates a live Assessment Roll row and Assessor Docket while preserving the original archive untouched.
```
- **Outcome:** Updated `ViewLegacyVault.tsx` and `RpatisContext.tsx` (`addLegacyRecord`, `migrateLegacyToModern`), ensuring state-safe transition directly into the FAAS Appraisal Engine.

---

### Prompt 9 — Blank-by-Default Operational Forms & Dedicated Property Records Register
```text
Audit every operational form across Assessor, Capitol, Treasury, and the Citizen Portal to enforce clean data entry:
- Ensure all intake, search, billing, cashiering, certification, lien, ocular, problem-log, and FAAS fields initialize strictly blank (`''` or unchecked `false`) with clear placeholder guidance instead of pre-populated sample values.
- Add a dedicated **Property Records (Roll)** view inside the Municipal Assessor workspace so staff can search, filter, and inspect all registered parcels and open any record directly in the FAAS Appraisal Engine.
```
- **Outcome:** Created `ViewAssessmentRoll.tsx` inside `Screen1Assessor.tsx` and cleared default hardcoded values across all operational forms.

---

### Prompt 10 — Complete RA 7160 Real Property Coverage (Land, Buildings, Structures & Machinery)
```text
Extend the FAAS Appraisal & Valuation Engine to record all four statutory real property classifications mandated under Republic Act 7160:
1. Land Valuation (RA 7160 Sec. 218)
2. Building Sub-Components
3. **Other Permanent Structures & Improvements** (blank-by-default optional section with replacement cost, depreciation %, and statutory assessment level)
4. **Machinery Appraisal** (RA 7160 Sec. 218(c) classification levels—Agricultural 40%, Residential 50%, Commercial/Industrial 80%—and Sec. 225 80% max depreciation / 20% residual floor)
Ensure total market/assessed valuations persist cleanly on saved dockets, render item-by-item in the live Draft Tax Declaration preview, and display as declared property badges in Capitol's Dual-Pane Inspection FAAS tab.
```
- **Outcome:** Extended `rpatis.ts`, `Screen1Assessor.tsx`, and `Screen2CapitolInspection.tsx` so declarations can cover any combination of Land, Buildings, Other Permanent Structures, and Machinery.

---

### Prompt 11 — Sidebar-First Full-Height Shell & Content Focus Mode
```text
Streamline the desktop workspace chrome for maximum viewport efficiency and distraction-free content focus:
- Remove the top global header bar and remove the visual `Session: 15m lock` timer badge.
- Move the office brand icon, `RPAT-IOSS` badge, department title, and sync indicator to the top of the left sidebar, and anchor the interactive user profile & Sign Out popover flush to the bottom of a full-height (`100dvh`) non-clipped sidebar (`CollapsibleSidebarLayout`).
- Use a unified 3-bar (`Menu`) icon button (plus `Ctrl+B` shortcut) to collapse and expand the navigation sidebar into full-width Content Focus Mode.
```
- **Outcome:** Removed the header from `RoleLayout.tsx`, created `CollapsibleSidebarLayout.tsx`, locked the `100dvh` desktop flex chain in `index.css`, and unified all three office workspaces (`Screen1Assessor`, `Screen2Capitol`, `Screen3Treasury`).

---

### Prompt 12 — Action-Priority Sorting Across All Operational Tables & Queues
```text
Audit every operational table and record list across Municipal Assessor, Provincial Capitol, and Municipal Treasury, and enforce consistent action-first sorting (using non-mutating copies):
- **Endorsement Queue:** `Needs Signature` (Eligible) → `Flagged` → `At Capitol` → `Under Technical Review` → `Ready for Sign-Off` → `Approved` → `Paid` → `Draft`.
- **Assessment Roll & Treasury Ledger:** `Unpaid` → `Partial` → `Paid`.
- **Capitol Queues:** Review/Flagged items first (`Under Technical Review` → `At Capitol` → `Ready for Sign-Off` → `Flagged`), with completed items at the bottom.
- **Counter Services, SMV Matrix & Historical Vault:** Pending/Open items first, statutory classification order for SMV, and chronological vintage TD order for archives.
```
- **Outcome:** Applied deterministic priority + natural numeric tie-break sorting across all 11 operational tables and queues (`ViewEndorsementQueue`, `ViewAssessmentRoll`, `Screen3TreasuryDashboard`, `Screen2CapitolMasterQueue`, `Screen4CapitolDeficiencyTracker`, `ViewCertifications`, `ViewLiensMortgages`, `ViewValidationPinId`, `ViewProblemResolution`, `ViewSmvMatrix`, `ViewLegacyVault`).

---

### Prompt 13 — Name-to-TD Tax Declaration Lookup & Certification Preview Cleanup
```text
Enhance Municipal Assessor counter usability:
1. In **Tax Declaration Validation**, allow clerks to search by **Owner Name, PIN, or TD No.** and display matching parcels with owner details so the clerk can pinpoint and validate the exact target Tax Declaration number (especially when an owner holds multiple parcels).
2. In **Certifications & CTC**, remove the manual bottom signature block from the printable certificate preview card, keeping only the official certificate text, serial/OR metadata, and cryptographic verification QR code.
```
- **Outcome:** Upgraded `ViewValidationPinId.tsx` with live multi-match person-to-TD selection and simplified the printable certificate footer in `ViewCertifications.tsx`.

---

### Prompt 14 — Dynamic Provincial SMV Schedule Updates via Official Notice / Ordinance
```text
Convert the Provincial Schedule of Base Market Values (`SMV Matrix`) from a static reference table into a live, notice-driven schedule:
- Store `smvRates`, `activeSmvNotice`, and an immutable `smvRevisions` audit log inside `RpatisContext`.
- Add an **Update SMV from New Notice** workflow modal (and per-row **Revise** action) with blank-by-default fields supporting both **Revise Existing Sub-Class** and **Add New Sub-Class** under a new Provincial Ordinance or Memorandum Circular.
- Synchronize updated unit values, assessment levels, and governing notice citations immediately into the FAAS Appraisal Engine.
```
- **Outcome:** Added `SmvRateEntry` / `SmvNoticeRevision` types, context actions (`updateSmvFromNotice`), notice modal + revision log in `ViewSmvMatrix.tsx`, and live rate provenance lookup in `Screen1Assessor.tsx`.

---

### Prompt 15 — Capitol Dual-Pane Docket Switcher & Full-Width CIS Sign-Off Workspace
```text
Optimize the Provincial Capitol examiner and chief approver workflow:
1. Inside **Dual-Pane Inspection**, add an inline queued docket selector (`Select Queued Docket`) with `Prev` / `Next` controls and automatic checklist state reset on docket change.
2. Introduce a formal `'Ready for Sign-Off'` status when forwarding from Dual-Pane Inspection.
3. Redesign **CIS Sign-Off & Seal** into a full-width two-column workspace strictly filtered to **only dockets marked for Sign-Off** (plus an **Issued CIS Seals** history tab and sidebar counter badge), and ensure CIS issuance atomically syncs approved parcels into the Treasury Assessment Roll.
```
- **Outcome:** Added `Ready for Sign-Off` state across types, `StatusChip`, and `RpatisContext` (fixing async state batching in `approveAndIssueCis`), added the Dual-Pane docket switcher in `Screen2CapitolInspection.tsx`, and rebuilt `Screen3CapitolSignoff.tsx`.

---

### Prompt 16 — Collectible-Only Treasury Roll Pickers & Payor Auto-Fill in Cashier Window #3
```text
Streamline RPT collection across Treasury Billing and Cashiering:
- Embed a clean searchable roll picker inside **Tax Billing Calculator** displaying **only collectible accounts (`Unpaid` / `Partial`)** with `Paid` accounts excluded and no unnecessary status toggle clutter.
- Embed a matching searchable collectible-account queue inside **Cashier Window #3** with unique per-TD candidate clearance serials, and auto-fill the **Payor Name** field automatically from the selected taxpayer record when proceeding from Billing or switching accounts.
```
- **Outcome:** Built clean collectible roll pickers inside `Screen3TreasuryBilling.tsx` and `Screen3TreasuryCashier.tsx` wired via `Screen3Treasury.tsx`, with automatic payor name pre-fill and blank tendered-amount safety.

---

### Prompt 17 — Full-Stack Audit & Node.js / Express + MySQL Backend Architecture Plan
```text
Audit every workflow across the frontend to catalog real functional bugs vs. prototype limitations, then architect a complete production backend implementation plan (`BACKEND_PLAN.md`) using **Node.js, Express 5, TypeScript, and MySQL (`mysql2/promise`)**:
- Specify a normalized 17-table InnoDB schema using `DECIMAL(14,2)` precision across all 4 property kinds, Capitol CIS seals, Form 56 payments, PIN reservations, attachments, Legacy archives, and COA audit logs.
- Define REST endpoints, multipart file uploads, bcrypt + `HttpOnly` JWT RBAC middleware, server-side RA 7160 valuation/SHA-256 verification, and `<1s` SSE cross-office synchronization, plus remediation plans for all audited functional gaps.
```
- **Outcome:** Audited 8 code-level functional gaps and documented the complete backend blueprint in `BACKEND_PLAN.md` ahead of full-stack implementation.
