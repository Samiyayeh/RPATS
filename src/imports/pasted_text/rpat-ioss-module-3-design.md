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
