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
