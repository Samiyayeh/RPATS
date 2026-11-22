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
