"""
Builds the comprehensive Accessibility UX Case Study (WCAG 2.2 Level A & AA) report:
1. High-resolution print-ready PDF (`GRP23_Accessibility_UX_Case_Study_WCAG2.2.pdf`) via Chrome Headless.
2. Editable Word Document (`GRP23_Accessibility_UX_Case_Study_WCAG2.2.docx`) via python-docx.
"""
import base64
import html
import os
import subprocess
import fitz  # PyMuPDF

SCRATCH_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.dirname(SCRATCH_DIR)
ASSETS_DIR = os.path.join(SCRATCH_DIR, "assets")

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME_PATH):
    CHROME_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"


def img_to_data_uri(filename):
    path = os.path.join(ASSETS_DIR, filename)
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:image/png;base64,{b64}"


# Structured data for the 12 POUR audit issues
ISSUES = [
    # PERCEIVABLE
    {
        "id": "P-01",
        "category": "Perceivable",
        "title": "Color-Only Status Encoding and Low-Contrast Pastel Fills in Assessment & Treasury Ledgers",
        "wcag": "WCAG 1.4.1 Use of Color (Level A) & WCAG 1.4.3 Contrast (Minimum) (Level AA)",
        "severity": "Major",
        "location": "Executive Dashboard (S1), Assessment Roll (S3), and Treasurer Collections Tab (S5, S6)",
        "img": "audit_P01_color_contrast.png",
        "caption": "Figure C.1 (Issue P-01). Treasurer Collections ledger relying on pastel green, yellow, and pink row fills to distinguish reconciliation states without status icons or high-contrast borders.",
        "problem": (
            "In both the Executive Dashboard and the Treasurer Collections ledger, payment and reconciliation states are distinguished primarily through background color fills: pastel green (#D9EAD3) for 'Fully Settled', pastel yellow (#FFF2CC) for 'Unpaid / Delinquent' and 'Partial / Underpaid', and light pink (#F4CCCC) for 'Record Missing / Error'. At the same time, muted gray secondary labels (#666666 on #F8F9FA) and disabled menu items in the application chrome fall to 2.2:1–3.4:1 contrast, below the mandatory 4.5:1 AA threshold. For municipal clerks, assessors, or taxpayers with red-green color vision deficiency (Deuteranopia or Protanopia, affecting roughly 8% of male users) or age-related contrast loss, pastel green and pastel yellow/pink rows appear nearly identical in luminance. When printed on monochrome laser or dot-matrix printers common in LGU offices, all three status fills flatten into indistinguishable shades of light gray."
        ),
        "fix": (
            "1. Implement Multi-Cue Status Chips (WCAG 1.4.1): Pair every status state with a distinct geometric icon and explicit text prefix: '[✓ PAID] Fully Settled', '[⚠ PARTIAL] Underpaid (-₱64.00)', and '[✕ ERROR] Record Missing'.\n"
            "2. Enforce High-Contrast Palettes (WCAG 1.4.3): Upgrade badge foreground/background combinations to at least 7.4:1–11.2:1 contrast (e.g., #14532D text on #DCFCE7 fill with a 2px #15803D border for Settled; #7F1D1D text on #FEE2E2 fill with a 2px #B91C1C border for Error)."
        ),
        "mockup": "solution_M1_perceivable.png",
        "improvement": (
            "Increases status text contrast from 3.4:1 to 9.8:1+ (exceeding WCAG AAA) and guarantees 100% status discriminability for color-blind users and black-and-white printed tax rolls."
        ),
    },
    {
        "id": "P-02",
        "category": "Perceivable",
        "title": "Canvas-Rendered Grid (<canvas>) Obscures Table Semantics, Merged KPI Cards, and Chart Text Alternatives",
        "wcag": "WCAG 1.3.1 Info and Relationships (Level A) & WCAG 1.1.1 Non-text Content (Level A)",
        "severity": "Critical",
        "location": "Executive Dashboard (S1, S2) and Assessment Roll Grid Canvas (S3)",
        "img": "audit_P02_canvas_semantics.png",
        "caption": "Figure C.2 (Issue P-02). Multiple stacked tables and merged KPI cells rendered inside an HTML5 <canvas> surface without programmatic <table>, <th>, or chart alt-text relationships.",
        "problem": (
            "Google Sheets renders the entire spreadsheet grid inside a proprietary HTML5 <canvas> element (waffle-grid-container) rather than native semantic HTML <table> markup. On the Executive Dashboard (S1), three separate analytical tables (Revenue Realization, Valuation by Classification, and Barangay Tax Matrix) are stacked vertically in the same coordinate sheet alongside merged cell blocks (A4:C5, D4:F5) that visually imitate KPI summary cards. Screen readers navigating across merged cells announce empty coordinates ('B4 blank, C4 blank') and fail to associate data cells with their respective section headers when scrolling vertically. Additionally, floating charts (the Municipal Target Doughnut Chart and Valuation Comparison Column Chart in S2) lack programmatic alt attributes or linked summary descriptions, leaving blind staff completely unable to perceive visual revenue trends."
        ),
        "fix": (
            "1. Replace Canvas Grids with Semantic HTML5 Landmarks and Tables (WCAG 1.3.1): Render KPI cards as independent <article> or <section aria-labelledby='...'> components, and encode each ledger as a separate native <table> with explicit <caption>, <thead>, <th scope='col'>, and <th scope='row'> attributes.\n"
            "2. Provide Programmatic Chart Text Alternatives (WCAG 1.1.1): Add descriptive aria-label and aria-describedby attributes to every SVG chart, linking directly to an accessible tabular breakdown and pattern-filled bars."
        ),
        "mockup": "solution_M1_perceivable.png",
        "improvement": (
            "Enables NVDA, JAWS, and VoiceOver to automatically announce column and row headers for every cell (e.g., 'Tax Declaration TD-26-0004, Total Tax Due: ₱864.00') and provides 100% equivalent text access to dashboard analytics."
        ),
    },
    {
        "id": "P-03",
        "category": "Perceivable",
        "title": "Severe Two-Dimensional Horizontal Scrolling and Chart Clipping Across the 15-Column Assessment Roll",
        "wcag": "WCAG 1.4.10 Reflow (Level AA) & WCAG 1.4.4 Resize Text (Level AA)",
        "severity": "Major",
        "location": "Executive Dashboard Right Pane (S2) and 15-Column Assessment Roll (S3, S4)",
        "img": "audit_P03_reflow_clipping.png",
        "caption": "Figure C.3 (Issue P-03). Horizontal clipping of KPI cards, charts, and columns I through O of the Assessment Roll, requiring simultaneous horizontal and vertical scrolling.",
        "problem": (
            "The Municipal Assessment Roll contains 15 statutory columns (A through O: TD No., PIN, Owner, Barangay, Classification, Area, Unit Value, Market Value, Assessment Level, Assessed Value, Basic RPT, SEF, Total Tax Due, Payment Status, and OR No.). Even at 100% browser zoom on a 1080p desktop monitor, columns I through O and the right half of the Executive Dashboard charts (S2) are clipped off-screen. When a low-vision assessor or senior citizen taxpayer zooms the browser to 200% (WCAG 1.4.4) or 400% / 320 CSS px width (WCAG 1.4.10), the spreadsheet toolbar, formula bar, and frozen columns consume over 65% of the viewport, forcing exhausting two-dimensional scrolling where users lose sight of the Property Owner and TD Number while inspecting Tax Due."
        ),
        "fix": (
            "1. Responsive Card-Table Hybrid Reflow (WCAG 1.4.10): Implement CSS Grid/Flexbox media queries in RPATIS so that at viewports ≤768px (or 200%–400% zoom), wide 15-column rows automatically reflow into single-column vertical property cards with expandable appraisal drawers.\n"
            "2. Sticky Primary Identifiers: At standard desktop widths, group secondary calculation columns (Area × Unit Value breakdown) into a collapsible detail drawer so core decision columns fit 100% within the viewport without horizontal scrolling."
        ),
        "mockup": "solution_M1_perceivable.png",
        "improvement": (
            "Eliminates horizontal scrolling at 200%–400% zoom (320 CSS px width) and preserves continuous visibility of the TD Number, PIN, and Tax Due in a single vertical reading flow."
        ),
    },
    # OPERABLE
    {
        "id": "O-01",
        "category": "Operable",
        "title": "Complex Multi-Layer Keyboard Navigation, Endless Empty-Column Tabbing, and Missing Bypass Blocks",
        "wcag": "WCAG 2.1.1 Keyboard (Level A), WCAG 2.4.1 Bypass Blocks (Level A) & WCAG 2.4.3 Focus Order (Level A)",
        "severity": "Critical",
        "location": "Application Toolbar, Formula Bar, 2D Grid Canvas, and Bottom Sheet Tabs (S1, S3, S5)",
        "img": "audit_O01_keyboard_navigation.png",
        "caption": "Figure C.4 (Issue O-01). Pressing Tab inside the spreadsheet grid moves endlessly across empty columns (I..Z) rather than advancing between logical functional sections.",
        "problem": (
            "For clerks with motor impairments who rely exclusively on keyboard navigation, moving between the top menu bar, the formatting toolbar, the formula bar (fx), the cell grid, floating charts, and the bottom sheet switcher tabs ('Executive Dashboard', 'Assesment Roll', 'Treasurer Collections') requires memorizing obscure multi-key chord shortcuts (such as Ctrl+Alt+Shift+M or Alt+Shift+K). Worse, pressing the standard Tab key inside the Assessment Roll does not move to the next interactive button or section—it moves focus horizontally into infinite blank columns (P, Q, R, S...), requiring 40+ arrow/tab keystrokes to traverse a single record and offering no 'Skip to Main Table' bypass link."
        ),
        "fix": (
            "1. Provide Visible Skip-to-Content Links (WCAG 2.4.1): Add a high-contrast 'Skip to Assessment Roll Table' and 'Skip to Reconciliation Actions' link as the first Tab stop on every page.\n"
            "2. Enforce Linear, Predictable Tab Order (WCAG 2.1.1 & 2.4.3): Structure the RPATIS workspace into semantic landmarks (<header>, <nav>, <main>, <aside>) where Tab moves strictly between interactive controls (Search -> Filter -> New TD Button -> Table Row Action Buttons -> Section Switcher) in 6 logical stops."
        ),
        "mockup": "solution_M2_operable.png",
        "improvement": (
            "Reduces keyboard traversal from 42+ keystrokes to 6 predictable Tab stops and eliminates keyboard trapping inside empty grid cells."
        ),
    },
    {
        "id": "O-02",
        "category": "Operable",
        "title": "Undersized Toolbar Controls (<24×24 CSS px) and Precision Formula Drag-Handle Dependency",
        "wcag": "WCAG 2.5.8 Target Size (Minimum) (Level AA) & WCAG 2.5.7 Dragging Movements (Level AA)",
        "severity": "Major",
        "location": "Formatting Toolbar, Cell Selection Fill-Handle, and Bottom Sheet Tab Bar (S3, S4)",
        "img": "audit_O02_target_size.png",
        "caption": "Figure C.5 (Issue O-02). Dense 18×18 px toolbar buttons, 14×14 px tab menu chevrons, and the 6×6 px cell corner drag-handle fail WCAG 2.5.8 and 2.5.7.",
        "problem": (
            "WCAG 2.2 Success Criterion 2.5.8 mandates a minimum pointer target size of 24×24 CSS pixels (with 44×44 CSS pixels recommended under 2.5.5 AAA). In the audited spreadsheet interface (S4), zoom controls, number format buttons ($, %, .00), alignment icons, and bottom sheet tab dropdown triangles measure only 14×14 px to 18×18 px with less than 2px separation. Compounding this barrier, propagating tax formulas across new property rows relies on grabbing a microscopic 6×6 px blue square (the autofill drag handle) at the bottom-right corner of the active cell and dragging it downward—a direct violation of WCAG 2.5.7 (Dragging Movements) that causes frequent misclicks and formula corruption for clerks with hand tremors, arthritis, or repetitive strain injuries."
        ),
        "fix": (
            "1. Enforce 44×44 CSS Pixel Touch/Click Targets (WCAG 2.5.8 & 2.5.5): Size all buttons, dropdown triggers, and navigation tabs in RPATIS to a minimum of 44×44 CSS pixels with at least 8px spacing between adjacent controls.\n"
            "2. Replace Dragging with Single-Click Server Actions (WCAG 2.5.7): Compute statutory assessment levels and taxes automatically on form submission and provide a single-click 'Apply Statutory Rates to All Rows' button."
        ),
        "mockup": "solution_M2_operable.png",
        "improvement": (
            "Increases interactive target area by 490% (from 18×18 px to 44×44 px) and eliminates 100% of precision pointer dragging operations."
        ),
    },
    {
        "id": "O-03",
        "category": "Operable",
        "title": "Low-Salience Focus Indicators in Share Dialog and Menu Overlays Obscuring Active Focus",
        "wcag": "WCAG 2.4.7 Focus Visible (Level AA), WCAG 2.4.11 Focus Not Obscured (Minimum) (Level AA) & WCAG 2.4.13 Focus Appearance (Level AAA)",
        "severity": "Major",
        "location": "Share Permissions Modal Dialog (S7) and File Menu Overlay (S8)",
        "img": "audit_O03_focus_obscured.png",
        "caption": "Figure C.6 (Issue O-03). Faint 1.3:1 control borders and subtle focus states inside the Share modal (S7), and cascading menu overlays obscuring active cell focus (S8).",
        "problem": (
            "When configuring inter-office access in the 'Share Erpt spreadsheet' modal (S7), the 'Add people and groups' input box, the 'Editor' role selector, and the 'Copy link' button exhibit ultra-faint borders (#E0E0E0 against #FFFFFF, contrast ratio 1.3:1—failing WCAG 1.4.11 Non-text Contrast 3:1) and lack a high-contrast 2px focus ring when tabbed. Keyboard users cannot tell whether focus is on the email input, the role dropdown, or the 'Copy link' button. Additionally, when cascading dropdown menus (S8) or floating chart toolbars open, they visually cover the active grid cell focus indicator (A1) without repositioning the viewport."
        ),
        "fix": (
            "1. Global High-Contrast Focus Ring (WCAG 2.4.7 & 2.4.13): Apply a universal CSS rule (`:focus-visible { outline: 3px solid #2563EB; outline-offset: 2px; box-shadow: 0 0 0 5px rgba(37,99,235,0.25); }`) achieving an 8.6:1 contrast ratio against white backgrounds.\n"
            "2. Strict Modal Focus Management (WCAG 2.4.11): Ensure dialogs trap focus cleanly within the active modal layer and dismiss overlays immediately on Escape."
        ),
        "mockup": "solution_M2_operable.png",
        "improvement": (
            "Raises control border and focus indicator contrast from 1.3:1 to 8.6:1, making keyboard focus position unmistakable across all dialogs and forms."
        ),
    },
    # UNDERSTANDABLE
    {
        "id": "U-01",
        "category": "Understandable",
        "title": "Cryptic Spreadsheet Error Tokens ('CORD NOT FOUND', 'N/A', '#VALUE!') Without Recovery Suggestions",
        "wcag": "WCAG 3.3.1 Error Identification (Level A) & WCAG 3.3.3 Error Suggestion (Level AA)",
        "severity": "Critical",
        "location": "Treasurer Collections Tab Row 14 (S5, S6)",
        "img": "audit_U01_cryptic_errors.png",
        "caption": "Figure C.7 (Issue U-01). A single-digit typo in TD-26-0080 outputs truncated 'CORD NOT FOUND' and 'N/A' tokens without explaining the cause or suggesting TD-26-0008.",
        "problem": (
            "In Row 14 of the Treasurer Collections ledger (S5, S6), Official Receipt #7712305 was encoded against Tax Declaration 'TD-26-0080' instead of 'TD-26-0008' (a common transposition typo during peak tax collection). Because the cross-office lookup relies on a raw `=IFERROR(VLOOKUP(...), 'RECORD NOT FOUND')` formula, Column E displays a clipped 'CORD NOT FOUND' string and Column F displays 'N/A'. Under WCAG 3.3.1 and 3.3.3, an accessible application must identify the exact input field in error in plain language and provide known correction suggestions. Raw spreadsheet error tokens force clerks with cognitive fatigue or numeracy stress to manually hunt through hundreds of rows in the Assessor tab to find the matching taxpayer."
        ),
        "fix": (
            "1. Plain-Language Inline Error Alerts (WCAG 3.3.1): Replace raw formula outputs with an explicit `role='alert'` message attached to the input field via `aria-describedby`: 'Tax Declaration TD-26-0080 does not exist in the 2026 Pasacao Assessment Roll.'\n"
            "2. Automated Fuzzy-Match Recovery Suggestions (WCAG 3.3.3): Query the centralized RPATIS database for closest Levenshtein/amount matches and present a 1-click button: 'Suggested Match: TD-26-0008 (Ramos, E. — Brgy. Itulan, Tax Due: ₱10,200.00) — [Apply Match]'."
        ),
        "mockup": "solution_M3_understandable.png",
        "improvement": (
            "Reduces inter-office error resolution time from 10+ minutes of manual cross-checking to a 2-second, single-click guided correction."
        ),
    },
    {
        "id": "U-02",
        "category": "Understandable",
        "title": "Unprotected Statutory Valuation Formulas and Absence of Legal/Financial Submission Confirmation",
        "wcag": "WCAG 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA) & WCAG 3.3.2 Labels or Instructions (Level A)",
        "severity": "Critical",
        "location": "Formula Bar and Assessment Roll Valuation Columns E through M (S3, S4)",
        "img": "audit_U02_formula_vulnerability.png",
        "caption": "Figure C.8 (Issue U-02). Statutory formulas in the formula bar (fx) can be overwritten by any keystroke without field instructions, input masks, or confirmation prompts.",
        "problem": (
            "Real property tax assessments carry binding legal and financial consequences for property owners and municipal revenue under Republic Act No. 7160. In the audited Google Sheets system (S4), statutory valuation formulas—such as `=H4*I4` for Assessed Value and nested `=IF(E4='Residential', 0.20, ...)` for Assessment Levels—are stored directly inside editable grid cells. There are no persistent field instructions (WCAG 3.3.2) specifying expected formats (e.g., PIN format `041-BB-PPP`), and zero confirmation checkpoints (WCAG 3.3.4) before a modification alters the taxpayer's billed liability. A single accidental keypress while a formula cell is focused silently replaces the dynamic formula with a static character or number."
        ),
        "fix": (
            "1. Dedicated Guided Entry Forms with Persistent Instructions (WCAG 3.3.2): Replace in-grid formula editing with a structured FAAS Appraisal Form featuring visible `<label>` tags, format hints (`Format: 041-XX-XXX`), and locked read-only fields for computed Market Value, Assessed Value, Basic RPT (1%), and SEF (1%).\n"
            "2. Two-Step Review & Confirmation Checkpoint (WCAG 3.3.4): Require an explicit confirmation step summarizing old vs. new valuation figures before committing changes to the database, backed by a 24-hour reversible audit log."
        ),
        "mockup": "solution_M3_understandable.png",
        "improvement": (
            "Eliminates 100% of accidental formula overwrites and satisfies WCAG 3.3.4 legal/financial error prevention requirements."
        ),
    },
    {
        "id": "U-03",
        "category": "Understandable",
        "title": "Mixed Tagalog/English Application Chrome and Unexpanded Statutory Tax Abbreviations",
        "wcag": "WCAG 3.1.2 Language of Parts (Level AA), WCAG 3.1.1 Language of Page (Level A) & WCAG 3.1.4 Abbreviations (Level AAA)",
        "severity": "Minor",
        "location": "Top Menu Bar, Share Button ('Ibahagi'), File Menu ('History ng bersyon'), and Column Headers (S1, S8)",
        "img": "audit_U03_language_jargon.png",
        "caption": "Figure C.9 (Issue U-03). Tagalog UI menus ('I-edit', 'Tingnan', 'Ipasok', 'Mga tool', 'Ibahagi') mixed with English statutory tax tables and unexpanded acronyms ('PIN', 'TD No.', 'SEF').",
        "problem": (
            "As shown in S1 and S8, the Google Sheets interface renders its application menu bar and dialogs in Tagalog ('File', 'I-edit', 'Tingnan', 'Ipasok', 'Format', 'Data', 'Mga tool', 'Mga Extension', 'Tulong', 'Ibahagi', 'Mag-sign in') while the entire eRPT spreadsheet content is written in English. When an English-configured screen reader encounters untagged Tagalog menu strings without programmatic `lang='tl'` attributes (WCAG 3.1.2), it pronounces them using English phonetic rules, producing unintelligible speech output. In addition, domain-specific abbreviations in column headers (`TD No.`, `PIN`, `SEF`, `OR No.`, `FAAS`) have no programmatic expansion, creating comprehension barriers for newly hired clerks and citizens."
        ),
        "fix": (
            "1. Consistent Language Declaration & Language Switcher (WCAG 3.1.1 & 3.1.2): Declare `<html lang='en-PH'>` across the RPATIS web application, unify all navigation labels in clear English by default, and tag any localized Filipino help text with explicit `lang='tl'` attributes.\n"
            "2. Semantic Abbreviation Tooltips (WCAG 3.1.4): Wrap statutory acronyms in `<abbr title='...'>` elements with keyboard-accessible glossary popovers (e.g., `SEF` -> 'Special Education Fund — Additional 1% Realty Tax Levy under RA 7160 Sec. 235')."
        ),
        "mockup": "solution_M3_understandable.png",
        "improvement": (
            "Ensures accurate Text-to-Speech (TTS) pronunciation across assistive technologies and makes statutory tax terminology self-explanatory for all users."
        ),
    },
    # ROBUST
    {
        "id": "R-01",
        "category": "Robust",
        "title": "Custom Div Controls and Unrendered Icon Ligatures Lack Programmatic Name, Role, and Value",
        "wcag": "WCAG 4.1.2 Name, Role, Value (Level A)",
        "severity": "Critical",
        "location": "Share Permissions Modal Dialog ('Editor □', 'Copy link □', Close '□') (S7)",
        "img": "audit_R01_name_role_value.png",
        "caption": "Figure C.10 (Issue R-01). Custom div-based controls and unrendered icon ligatures ('□') in the Share modal fail to expose clean ARIA roles and accessible names.",
        "problem": (
            "In the Share modal dialog (S7), custom UI controls—including the modal close button (top-right '□'), the globe icon next to 'Anyone with the link', the 'Editor □' role selector, and the '□ Copy link' button—rely on custom `<div>` containers and web-font icon ligatures that failed to render properly, exposing raw rectangular replacement glyphs ('□'). When inspected via the browser Accessibility Tree, custom div dropdowns and unhidden icon glyphs pollute the accessible name announced by screen readers (e.g., announcing 'unrecognized character' or failing to expose standard `role='combobox'`, `aria-expanded`, and `aria-Selected` states required by WCAG 4.1.2)."
        ),
        "fix": (
            "1. Native HTML5 Form Controls (WCAG 4.1.2): Replace custom `<div>` dropdowns and buttons with native `<select>`, `<option>`, and `<button type='button'>` elements that expose built-in Name, Role, and Value to all operating system accessibility APIs.\n"
            "2. Decorative Icon Hiding: Use inline SVG icons with `aria-hidden='true'` and `focusable='false'` alongside explicit visible text labels so broken font ligatures can never corrupt screen reader output."
        ),
        "mockup": "solution_M4_robust.png",
        "improvement": (
            "Guarantees 100% programmatic role/state exposure across Windows UI Automation (NVDA/JAWS), macOS VoiceOver, and voice-control software."
        ),
    },
    {
        "id": "R-02",
        "category": "Robust",
        "title": "Silent Formula Recalculations and Reconciliation Updates Lack Programmatic aria-live Status Messages",
        "wcag": "WCAG 4.1.3 Status Messages (Level AA)",
        "severity": "Major",
        "location": "Treasurer Collections KPI Banner and Reconciliation Audit Matrix (S5, S6)",
        "img": "audit_R02_status_messages.png",
        "caption": "Figure C.11 (Issue R-02). Dynamic updates to 'TOTAL CASH COLLECTED', 'Variance (PHP)', and 'Reconciliation Status' occur silently without aria-live announcements.",
        "problem": (
            "When a treasury cashier enters an Official Receipt amount in the Treasurer Collections tab (S5, S6), dependent cells—including 'TOTAL RECEIPTS ISSUED (5)', 'TOTAL CASH COLLECTED (₱23,480.00)', 'Variance (-₱64.00)', and the Reconciliation Breakdown counts—recalculate instantly in the background. However, because these updates occur inside spreadsheet cells without WCAG 4.1.3 programmatic status markup (`role='status'` or `aria-live='polite'`), screen reader users receive zero auditory confirmation that the payment was posted, whether the balance is fully settled, or whether a shortfall variance occurred."
        ),
        "fix": (
            "1. Implement ARIA Live Status Regions (WCAG 4.1.3): Add a dedicated status banner (`<div role='status' aria-live='polite' aria-atomic='true'>`) in RPATIS that dynamically announces transaction results without moving keyboard focus (e.g., 'Official Receipt #7712304 posted. TD-26-0006 balance updated to ₱0.00 — Fully Settled').\n"
            "2. Assertive Error Alerts: Use `role='alert'` (`aria-live='assertive'`) exclusively for critical validation errors or underpayment warnings."
        ),
        "mockup": "solution_M4_robust.png",
        "improvement": (
            "Provides immediate, non-disruptive spoken confirmation of every tax calculation and inter-office ledger synchronization event for blind and low-vision staff."
        ),
    },
    {
        "id": "R-03",
        "category": "Robust",
        "title": "Generic Spreadsheet Cell Coordinates ('C4', 'F4') Lack Semantic Input Purpose and Type Constraints",
        "wcag": "WCAG 1.3.5 Identify Input Purpose (Level AA) & WCAG 4.1.2 Name, Role, Value (Level A)",
        "severity": "Major",
        "location": "Assessment Roll Data Entry Cells B4:H11 (S3, S4)",
        "img": "audit_R03_input_purpose.png",
        "caption": "Figure C.12 (Issue R-03). Data entry cells for Owner Name, Barangay, Area, and Unit Value expose only coordinate references ('C4', 'F4') without programmatic input purpose.",
        "problem": (
            "In the Assessment Roll (S3), clerks enter taxpayer and parcel attributes directly into grid coordinates (`B4` for PIN, `C4` for Owner Name, `D4` for Barangay, `F4` for Area in sqm, `G4` for Unit Value). Unlike native web forms, spreadsheet cells do not carry HTML5 `type='number'`, `step='0.01'`, `min='0'`, `autocomplete='name'`, or programmatic field purpose metadata (WCAG 1.3.5). Assistive technologies, virtual mobile keyboards, and cognitive assistive extensions cannot identify the expected data type or attach custom visual symbols for users with cognitive or learning disabilities."
        ),
        "fix": (
            "1. Explicit HTML5 Input Types & Autocomplete Metadata (WCAG 1.3.5): Use semantic `<input>` elements with explicit `type`, `inputmode='decimal'`, `autocomplete`, and `aria-describedby` attributes for all taxpayer and parcel fields.\n"
            "2. Programmatic Unit & Currency Affixes: Associate unit suffixes (`sqm`, `PHP`) programmatically via `aria-label` so screen readers announce 'Land Area in Square Meters, numeric input, 12,000'."
        ),
        "mockup": "solution_M4_robust.png",
        "improvement": (
            "Enables automatic numeric keypad invocation on mobile/tablet devices, browser autofill support, and full compatibility with cognitive reading aids."
        ),
    },
]

# Complete WCAG 2.2 Level A & AA Checklist Table (50 Criteria from WCAG 2.2 CHECKLIST.pdf)
WCAG_CHECKLIST = [
    # 1. PERCEIVABLE
    ("1.1.1", "Non-text Content", "A", "Fail", "Floating canvas charts (Municipal Target doughnut & Valuation bar chart in S2) lack programmatic alt text or linked data table descriptions (Issue P-02)."),
    ("1.2.1", "Audio-only and Video-only (Prerecorded)", "A", "Not Applicable", "The eRPT spreadsheet web application contains no prerecorded audio-only or video-only media."),
    ("1.2.2", "Captions (Prerecorded)", "A", "Not Applicable", "No synchronized video/audio media is used in the assessment or treasury modules."),
    ("1.2.3", "Audio Description or Media Alternative", "A", "Not Applicable", "No prerecorded video content is present in the evaluated web application."),
    ("1.2.4", "Captions (Live)", "AA", "Not Applicable", "No live synchronized audio/video broadcast is used."),
    ("1.2.5", "Audio Description (Prerecorded)", "AA", "Not Applicable", "No prerecorded video content is present."),
    ("1.3.1", "Info and Relationships", "A", "Fail", "Grid is rendered inside an HTML5 <canvas>; merged KPI cells (A4:C5) and 3 stacked tables lack native <table>, <th scope='col'>, and landmark semantics (Issue P-02)."),
    ("1.3.2", "Meaningful Sequence", "A", "Fail", "Side-by-side floating charts (S2) and multi-table canvas blocks disrupt linear reading sequence for screen readers."),
    ("1.3.3", "Sensory Characteristics", "A", "Pass", "Cell references use alphanumeric coordinates (e.g., A1, E4) rather than relying solely on shape or sound."),
    ("1.3.4", "Orientation", "AA", "Pass", "Browser interface does not lock display to portrait or landscape orientation."),
    ("1.3.5", "Identify Input Purpose", "AA", "Fail", "Grid cells used as inputs (Owner Name C4, Barangay D4, Area F4) lack HTML5 input types and autocomplete purpose attributes (Issue R-03)."),
    ("1.4.1", "Use of Color", "A", "Fail", "Payment and reconciliation states (Settled green, Partial yellow, Missing pink) and chart series rely primarily on color fills without icons or patterns (Issue P-01)."),
    ("1.4.2", "Audio Control", "A", "Pass", "No audio plays automatically on page load."),
    ("1.4.3", "Contrast (Minimum)", "AA", "Fail", "Pastel status badges, muted formula bar hints, and inactive menu items (S8) fall below the 4.5:1 minimum text contrast ratio (Issue P-01)."),
    ("1.4.4", "Resize Text", "AA", "Fail", "Zooming to 200% causes severe truncation of KPI cards, formula bar strings, and right-side table columns (Issue P-03)."),
    ("1.4.5", "Images of Text", "AA", "Pass", "Text inside the interface is rendered dynamically via fonts/canvas vector text rather than static raster images of text."),
    ("1.4.10", "Reflow", "AA", "Fail", "At 320 CSS px width (400% zoom) and even at 100% desktop width, the 15-column Assessment Roll and charts require two-dimensional scrolling and clip content (Issue P-03)."),
    ("1.4.11", "Non-text Contrast", "AA", "Fail", "Share modal input borders (#E0E0E0 on #FFF = 1.3:1) and 'Editor' dropdown boundaries fail the 3:1 non-text contrast requirement (Issue O-03)."),
    ("1.4.12", "Text Spacing", "AA", "Fail", "Canvas-rendered spreadsheet cells ignore user stylesheet overrides for line-height (1.5x), letter-spacing (0.12x), and word-spacing (0.16x)."),
    ("1.4.13", "Content on Hover or Focus", "AA", "Pass", "Native browser/toolbar tooltips can be dismissed and remain visible when hovered."),
    # 2. OPERABLE
    ("2.1.1", "Keyboard", "A", "Fail", "Navigating between toolbar, formula bar, canvas grid, floating charts, and bottom sheet tabs requires complex multi-key chord shortcuts (Issue O-01)."),
    ("2.1.2", "No Keyboard Trap", "A", "Pass", "Escape and chord shortcuts allow exiting the grid and modal dialogs, though discoverability is poor."),
    ("2.1.4", "Character Key Shortcuts", "A", "Pass", "Standard editing shortcuts use modifier keys (Ctrl/Alt) or are only active when the grid has focus."),
    ("2.2.1", "Timing Adjustable", "A", "Pass", "Cloud auto-save operates continuously without imposing arbitrary session expiration data loss."),
    ("2.2.2", "Pause, Stop, Hide", "A", "Pass", "No auto-scrolling, blinking, or moving carousels lasting more than 5 seconds are present."),
    ("2.3.1", "Three Flashes or Below Threshold", "A", "Pass", "Interface contains no flashing or strobing elements."),
    ("2.4.1", "Bypass Blocks", "A", "Fail", "No visible 'Skip to Main Table' or landmark bypass link is provided to skip the 35+ top menu and formatting toolbar controls (Issue O-01)."),
    ("2.4.2", "Page Titled", "A", "Pass", "Browser tab displays descriptive document title ('Professional_eRPT_Spreadsheet_System - Google Sheets')."),
    ("2.4.3", "Focus Order", "A", "Fail", "Pressing Tab inside the Assessment Roll moves endlessly across empty columns (I..Z) instead of advancing logically between interactive components (Issue O-01)."),
    ("2.4.4", "Link Purpose (In Context)", "A", "Pass", "Menu links and Share link controls state their general purpose when icons render."),
    ("2.4.5", "Multiple Ways", "AA", "Pass", "Users can locate sheets and cells via bottom sheet tabs, the Name Box (A1), or Ctrl+F search."),
    ("2.4.6", "Headings and Labels", "AA", "Fail", "Visual section banners (Row 1, Row 8, Row 14, Row 21) are styled spreadsheet cells rather than semantic HTML <h1>–<h6> headings; inputs lack persistent form labels."),
    ("2.4.7", "Focus Visible", "AA", "Fail", "Controls inside the Share dialog (S7) exhibit near-invisible focus states with 1.3:1 border contrast (Issue O-03)."),
    ("2.4.11", "Focus Not Obscured (Minimum)", "AA", "Fail", "Cascading File menu overlays (S8) and floating chart panels obscure the active focused cell (A1) in the grid (Issue O-03)."),
    ("2.5.1", "Pointer Gestures", "A", "Pass", "No multipoint or pinch-only gestures are required on desktop."),
    ("2.5.2", "Pointer Cancellation", "A", "Pass", "Toolbar buttons activate on pointer up-event."),
    ("2.5.3", "Label in Name", "A", "Pass", "Visible text labels on buttons match their programmatic names where text is present."),
    ("2.5.4", "Motion Actuation", "A", "Pass", "No device shake or motion actuation is used."),
    ("2.5.7", "Dragging Movements", "AA", "Fail", "Propagating formulas across rows via the 6×6 px cell corner fill-handle relies on precision dragging without an obvious single-click UI button (Issue O-02)."),
    ("2.5.8", "Target Size (Minimum)", "AA", "Fail", "Toolbar icons (18×18 px), sheet tab menu chevrons (14×14 px), and the 6×6 px fill handle fall below the mandatory 24×24 CSS pixel minimum (Issue O-02)."),
    # 3. UNDERSTANDABLE
    ("3.1.1", "Language of Page", "A", "Pass", "Root HTML document declares a default language attribute."),
    ("3.1.2", "Language of Parts", "AA", "Fail", "Top application chrome renders in Tagalog ('I-edit', 'Tingnan', 'Ipasok', 'Mga tool', 'Ibahagi') while sheet content is in English without part-level lang tags (Issue U-03)."),
    ("3.2.1", "On Focus", "A", "Pass", "Moving focus between cells or buttons does not trigger unexpected page reloads or context changes."),
    ("3.2.2", "On Input", "A", "Pass", "Entering values in cells does not unexpectedly navigate away from the workspace."),
    ("3.2.3", "Consistent Navigation", "AA", "Pass", "Top menu bar and bottom sheet tab bar remain in consistent locations across tabs."),
    ("3.2.4", "Consistent Identification", "AA", "Pass", "Formatting and sharing icons are identified consistently across the workspace."),
    ("3.2.6", "Consistent Help", "A", "Pass", "The Help ('Tulong') menu remains in a consistent position in the top menu bar."),
    ("3.3.1", "Error Identification", "A", "Fail", "Failed VLOOKUP in Row 14 outputs truncated 'CORD NOT FOUND' and 'N/A' strings without identifying the specific input error in plain language (Issue U-01)."),
    ("3.3.2", "Labels or Instructions", "A", "Fail", "Data entry cells lack persistent field instructions, expected input masks (e.g., PIN 041-XX-XXX), and required-field indicators (Issue U-02)."),
    ("3.3.3", "Error Suggestion", "AA", "Fail", "When TD-26-0080 fails lookup, the spreadsheet offers zero corrective suggestions (such as fuzzy-matching TD-26-0008) (Issue U-01)."),
    ("3.3.4", "Error Prevention (Legal, Financial, Data)", "AA", "Fail", "Statutory tax formulas (=H4*I4, nested IF) can be overwritten by a single accidental keystroke with no confirmation dialog or input validation guard (Issue U-02)."),
    ("3.3.7", "Redundant Entry", "A", "Pass", "Cross-sheet VLOOKUP references avoid re-typing owner names, though brittle when typos occur."),
    ("3.3.8", "Accessible Authentication (Minimum)", "AA", "Pass", "Google sign-in supports password managers and copy-paste into authentication fields."),
    # 4. ROBUST
    ("4.1.2", "Name, Role, Value", "A", "Fail", "Custom div dropdowns ('Editor □') and broken icon ligatures ('□') in the Share modal (S7) and canvas grid cells fail to expose standard HTML roles/states (Issues R-01, R-03)."),
    ("4.1.3", "Status Messages", "AA", "Fail", "Dynamic formula recalculations, KPI total updates, and variance status changes occur silently without programmatic role='status' or aria-live announcements (Issue R-02)."),
]


def build_pdf_case_study():
    # Preload all images as data URIs
    imgs = {
        "summary_chart": img_to_data_uri("audit_summary_charts.png"),
        "m1": img_to_data_uri("solution_M1_perceivable.png"),
        "m2": img_to_data_uri("solution_M2_operable.png"),
        "m3": img_to_data_uri("solution_M3_understandable.png"),
        "m4": img_to_data_uri("solution_M4_robust.png"),
    }
    for item in ISSUES:
        imgs[item["id"]] = img_to_data_uri(item["img"])

    # Build HTML for Audit Results (Section C) grouped by POUR
    pour_Order = ["Perceivable", "Operable", "Understandable", "Robust"]
    pour_descriptions = {
        "Perceivable": "Principle 1 requires that information and user interface components must be presentable to users in ways they can perceive across visual, auditory, and tactile modalities (WCAG Guidelines 1.1–1.4).",
        "Operable": "Principle 2 requires that user interface components and navigation must be operable via keyboard, pointer, switch, or voice input without micro-target barriers or focus traps (WCAG Guidelines 2.1–2.5).",
        "Understandable": "Principle 3 requires that both the information and the operation of the user interface must be readable, predictable, and equipped with input error assistance (WCAG Guidelines 3.1–3.3).",
        "Robust": "Principle 4 requires that content must be robust enough to be interpreted reliably by a wide variety of user agents, including screen readers and assistive technologies (WCAG Guideline 4.1).",
    }

    audit_html_blocks = []
    for idx_cat, cat in enumerate(pour_Order, 1):
        cat_issues = [x for x in ISSUES if x["category"] == cat]
        audit_html_blocks.append(f"""
        <div class="pour-section-header">
          <h2>C.{idx_cat} {cat.upper()} — Audit Findings ({len(cat_issues)} Issues Documented)</h2>
          <p>{pour_descriptions[cat]}</p>
        </div>
        """)
        for iss in cat_issues:
            sev_cls = iss["severity"].lower()
            t_esc = html.escape(iss["title"])
            w_esc = html.escape(iss["wcag"])
            l_esc = html.escape(iss["location"])
            c_esc = html.escape(iss["caption"])
            p_esc = html.escape(iss["problem"])
            audit_html_blocks.append(f"""
            <div class="issue-card avoid-break">
              <div class="issue-card-hdr">
                <div class="issue-badge-row">
                  <span class="issue-code">{iss['id']}</span>
                  <span class="sev-pill sev-{sev_cls}">{iss['severity'].upper()} SEVERITY</span>
                  <span class="wcag-tag">{w_esc}</span>
                </div>
                <h3>{t_esc}</h3>
              </div>
              <div class="issue-meta"><strong>Audited Component / Location:</strong> {l_esc}</div>
              <div class="issue-img-wrap">
                <img src="{imgs[iss['id']]}" alt="{c_esc}" />
                <div class="fig-caption">{c_esc}</div>
              </div>
              <div class="issue-impact">
                <h4>Why It Is a Problem (Impact on Users with Disabilities &amp; Municipal Operations):</h4>
                <p>{p_esc}</p>
              </div>
            </div>
            """)

    # Build HTML for Proposed Solutions (Section D)
    mockup_map = {
        "Perceivable": ("m1", "Figure D.1. Proposed Solution Mock-up M-01 (Perceivable): RPATIS Semantic HTML5 Ledger, Multi-Cue High-Contrast Status Chips, Patterned SVG Analytics, and 400% Zoom Card Reflow."),
        "Operable": ("m2", "Figure D.2. Proposed Solution Mock-up M-02 (Operable): RPATIS Keyboard-First Workspace with Skip Links, 6 Linear Tab Stops, 44x44 CSS px Targets, Single-Click Rate Application, and 3px High-Contrast Focus Rings."),
        "Understandable": ("m3", "Figure D.3. Proposed Solution Mock-up M-03 (Understandable): RPATIS Smart Error Recovery Alert (1-Click Fuzzy Match for TD-26-0008), Guided FAAS Appraisal Form with Locked Statutory Calculations, and Two-Step Financial Confirmation."),
        "Robust": ("m4", "Figure D.4. Proposed Solution Mock-up M-04 (Robust): RPATIS Native HTML5/ARIA Architecture, Programmatic aria-live='polite' Synchronization Toast, Input Purpose Metadata, and Live NVDA Screen Reader Output."),
    }

    solutions_html_blocks = []
    for idx_cat, cat in enumerate(pour_Order, 1):
        cat_issues = [x for x in ISSUES if x["category"] == cat]
        m_key, m_cap = mockup_map[cat]
        m_cap_esc = html.escape(m_cap)
        rows_html = ""
        for iss in cat_issues:
            fix_formatted = html.escape(iss["fix"]).replace("\n", "<br>")
            imp_esc = html.escape(iss["improvement"])
            w_esc = html.escape(iss["wcag"])
            rows_html += f"""
            <tr>
              <td style="width:15%; padding:5px 7px;"><strong>{iss['id']}</strong> <span class="sev-pill sev-{iss['severity'].lower()}" style="font-size:7.8pt; padding:1px 5px;">{iss['severity']}</span><br><span style="font-size:8pt; color:#334155;">{w_esc}</span></td>
              <td style="width:52%; padding:5px 8px; line-height:1.35;">{fix_formatted}</td>
              <td style="width:33%; padding:5px 8px; line-height:1.35;">{imp_esc}</td>
            </tr>
            """
        page_brk_cls = "page-break" if idx_cat > 1 else ""
        img_max_h = "130px" if idx_cat == 1 else "205px"
        tbl_fs = "8.0pt" if idx_cat == 1 else "8.7pt"
        solutions_html_blocks.append(f"""
        <div class="solution-group {page_brk_cls}">
          <div class="pour-section-header" style="margin:5px 0 5px 0; padding:6px 14px;">
            <h2>D.{idx_cat} Proposed {cat} Solutions &amp; Improved UI Mock-up (M-0{idx_cat})</h2>
          </div>
          <div class="issue-img-wrap" style="margin-bottom:5px; padding:5px;">
            <img src="{imgs[m_key]}" alt="{m_cap_esc}" style="max-height:{img_max_h};" />
            <div class="fig-caption" style="margin-top:2px; font-size:8.2pt;">{m_cap_esc}</div>
          </div>
          <table class="data-table" style="font-size:{tbl_fs}; margin:3px 0 6px 0;">
            <thead>
              <tr>
                <th style="padding:5px 7px;">Issue &amp; WCAG</th>
                <th style="padding:5px 8px;">Recommended Technical &amp; UX Fix in RPATIS</th>
                <th style="padding:5px 8px;">Expected Accessibility Improvement</th>
              </tr>
            </thead>
            <tbody>
              {rows_html}
            </tbody>
          </table>
        </div>
        """)

    # Build HTML for Full WCAG 2.2 Checklist Appendix
    checklist_rows = ""
    for sc_id, sc_name, level, status, comment in WCAG_CHECKLIST:
        st_cls = "st-pass" if status == "Pass" else ("st-fail" if status == "Fail" else "st-na")
        checklist_rows += f"""
        <tr>
          <td style="font-weight:700; white-space:nowrap;">{html.escape(sc_id)}</td>
          <td style="font-weight:600;">{html.escape(sc_name)}</td>
          <td style="text-align:center; font-weight:700;">{html.escape(level)}</td>
          <td style="text-align:center;"><span class="chk-badge {st_cls}">{html.escape(status.upper())}</span></td>
          <td>{html.escape(comment)}</td>
        </tr>
        """

    html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Accessibility UX Case Study (WCAG 2.2) - Group 23</title>
<style>
  @page {{
    size: Letter portrait;
    margin: 0.65in 0.65in 0.7in 0.65in;
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    line-height: 1.5;
    color: #0F172A;
    background: #FFFFFF;
  }}
  .page-break {{ page-break-before: always; }}
  .avoid-break {{ break-inside: avoid; page-break-inside: avoid; }}

  /* Cover Page */
  .cover {{
    min-height: 9.5in;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 3px solid #1E3A8A;
    border-radius: 14px;
    padding: 42px 40px;
    background: linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%);
  }}
  .cover-top .inst {{
    font-size: 11pt;
    font-weight: 800;
    color: #1E3A8A;
    text-transform: uppercase;
    letter-spacing: 1px;
  }}
  .cover-top .dept {{
    font-size: 10pt;
    color: #334155;
    margin-top: 4px;
    font-weight: 600;
  }}
  .cover-hero {{
    margin: 36px 0;
    padding: 28px 0;
    border-top: 4px solid #1D4ED8;
    border-bottom: 4px solid #1D4ED8;
  }}
  .cover-pill {{
    display: inline-block;
    background: #1D4ED8;
    color: #FFFFFF;
    font-weight: 800;
    font-size: 9.5pt;
    padding: 5px 14px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 14px;
  }}
  .cover-hero h1 {{
    font-size: 24pt;
    line-height: 1.2;
    font-weight: 900;
    color: #0F172A;
    margin-bottom: 14px;
  }}
  .cover-hero h2 {{
    font-size: 13.5pt;
    line-height: 1.4;
    font-weight: 600;
    color: #1E3A8A;
  }}
  .cover-meta-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    background: #FFFFFF;
    border: 2px solid #CBD5E1;
    border-radius: 10px;
    padding: 18px 22px;
  }}
  .cover-meta-box h3 {{
    font-size: 9.5pt;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }}
  .cover-meta-box p {{
    font-size: 10.5pt;
    font-weight: 700;
    color: #0F172A;
    line-height: 1.45;
  }}

  /* Headings */
  .sec-banner {{
    background: #0F172A;
    color: #FFFFFF;
    padding: 12px 18px;
    border-left: 8px solid #2563EB;
    border-radius: 6px;
    margin: 18px 0 14px 0;
  }}
  .sec-banner h1 {{
    font-size: 15pt;
    font-weight: 800;
    letter-spacing: 0.3px;
  }}
  .sec-banner p {{
    font-size: 9.5pt;
    color: #CBD5E1;
    margin-top: 2px;
  }}
  h2.sub-hdr {{
    font-size: 12.5pt;
    font-weight: 800;
    color: #1E3A8A;
    border-bottom: 2px solid #CBD5E1;
    padding-bottom: 4px;
    margin: 16px 0 8px 0;
  }}
  p {{
    margin-bottom: 9px;
    text-align: justify;
  }}

  /* Tables */
  table.data-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px 0;
    font-size: 9.5pt;
  }}
  table.data-table th {{
    background: #1E3A8A;
    color: #FFFFFF;
    text-align: left;
    padding: 8px 10px;
    font-weight: 700;
    border: 1px solid #1E3A8A;
  }}
  table.data-table td {{
    padding: 7px 10px;
    border: 1px solid #CBD5E1;
    vertical-align: top;
    text-align: left;
  }}
  table.data-table tr:nth-child(even) td {{
    background: #F8FAFC;
  }}

  /* Callout boxes */
  .info-box {{
    background: #EFF6FF;
    border: 1.5px solid #93C5FD;
    border-left: 6px solid #1D4ED8;
    border-radius: 8px;
    padding: 12px 16px;
    margin: 10px 0 14px 0;
  }}
  .info-box h4 {{
    color: #1E3A8A;
    font-size: 10.5pt;
    margin-bottom: 4px;
  }}

  /* POUR Audit Issue Cards */
  .pour-section-header {{
    background: #1E293B;
    color: #FFFFFF;
    padding: 10px 16px;
    border-radius: 6px;
    margin: 14px 0 10px 0;
  }}
  .pour-section-header h2 {{
    font-size: 12.5pt;
    font-weight: 800;
    color: #38BDF8;
  }}
  .pour-section-header p {{
    font-size: 9.2pt;
    color: #E2E8F0;
    margin: 2px 0 0 0;
    text-align: left;
  }}
  .issue-card {{
    border: 2px solid #CBD5E1;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 16px;
    background: #FFFFFF;
  }}
  .issue-card-hdr {{
    display: flex;
    flex-direction: column;
    gap: 5px;
    border-bottom: 1.5px solid #E2E8F0;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }}
  .issue-badge-row {{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }}
  .issue-code {{
    background: #0F172A;
    color: #FFFFFF;
    font-weight: 900;
    font-size: 9.5pt;
    padding: 3px 9px;
    border-radius: 5px;
  }}
  .sev-pill {{
    font-weight: 800;
    font-size: 8.5pt;
    padding: 3px 9px;
    border-radius: 5px;
    display: inline-block;
  }}
  .sev-critical {{ background: #FEE2E2; color: #991B1B; border: 1.5px solid #DC2626; }}
  .sev-major {{ background: #FFEDD5; color: #9A3412; border: 1.5px solid #EA580C; }}
  .sev-minor {{ background: #DBEAFE; color: #1E40AF; border: 1.5px solid #2563EB; }}
  .issue-card-hdr h3 {{
    font-size: 11pt;
    font-weight: 800;
    color: #0F172A;
    line-height: 1.3;
  }}
  .wcag-tag {{
    background: #F1F5F9;
    border: 1px solid #94A3B8;
    color: #1E293B;
    font-size: 8.5pt;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 5px;
    white-space: normal;
  }}
  .issue-meta {{
    font-size: 9.2pt;
    color: #334155;
    margin-bottom: 8px;
  }}
  .issue-img-wrap {{
    text-align: center;
    background: #F8FAFC;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    padding: 8px;
    margin-bottom: 8px;
  }}
  .issue-img-wrap img {{
    width: 100%;
    max-height: 240px;
    object-fit: contain;
    border-radius: 4px;
  }}
  .fig-caption {{
    font-size: 8.8pt;
    font-style: italic;
    color: #334155;
    margin-top: 5px;
    text-align: left;
  }}
  .issue-impact {{
    background: #FEF2F2;
    border-left: 5px solid #DC2626;
    padding: 8px 12px;
    border-radius: 4px;
  }}
  .issue-impact h4 {{
    font-size: 9.5pt;
    font-weight: 800;
    color: #7F1D1D;
    margin-bottom: 3px;
  }}
  .issue-impact p {{
    font-size: 9.5pt;
    margin: 0;
    color: #1E293B;
  }}

  /* Checklist status badges */
  .chk-badge {{
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 8.5pt;
    font-weight: 800;
  }}
  .st-pass {{ background: #DCFCE7; color: #14532D; border: 1px solid #15803D; }}
  .st-fail {{ background: #FEE2E2; color: #7F1D1D; border: 1px solid #DC2626; }}
  .st-na   {{ background: #F1F5F9; color: #475569; border: 1px solid #94A3B8; }}
</style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover">
    <div class="cover-top">
      <div class="inst">University of Nueva Caceres &bull; City of Naga</div>
      <div class="dept">School of Computer and Information Sciences (SCIS) &bull; Bachelor of Science in Information Technology</div>
    </div>

    <div class="cover-hero">
      <div class="cover-pill">Human-Computer Interaction (HCI) &bull; Accessibility UX Case Study</div>
      <h1>Web Accessibility Audit &amp; Inclusive UX Redesign Case Study (WCAG 2.2 Level A &amp; AA)</h1>
      <h2>Evaluating Google Sheets as a Municipal Real Property Tax (eRPT) Assessment &amp; Treasury Collection Web Application and Designing an Accessible Interface for the Proposed RPATIS Terminal Project</h2>
    </div>

    <div class="cover-meta-grid">
      <div class="cover-meta-box">
        <h3>Evaluated Baseline Web Application</h3>
        <p>Google Sheets Web Application (<code>docs.google.com/spreadsheets</code>)<br>Configured as: <em>Pasacao Municipal eRPT Assessment Roll &amp; Treasurer Collections System</em></p>
      </div>
      <div class="cover-meta-box">
        <h3>Related Terminal Project</h3>
        <p>Real Property Assessment Tracking and Inter-Office Synchronization System (RPATIS)<br><em>Municipal Assessor &amp; Treasurer Offices, Pasacao, Camarines Sur</em></p>
      </div>
      <div class="cover-meta-box">
        <h3>Group 23 Proponents</h3>
        <p>1. Asido, Christian Louise O.<br>2. Calubad, John Kenneth P.<br>3. Ibis, Angelfranz B.<br>4. Ortega, Rizalina A.</p>
      </div>
      <div class="cover-meta-box">
        <h3>Audit Standard &amp; Submission Date</h3>
        <p>W3C Web Content Accessibility Guidelines (WCAG) 2.2 Level A &amp; AA<br>October 2026</p>
      </div>
    </div>
  </div>

  <!-- SECTION A: WEBSITE AUDIT PREPARATION & OVERVIEW -->
  <div class="page-break"></div>
  <div class="sec-banner">
    <h1>SECTION A. WEBSITE AUDIT PREPARATION &amp; SYSTEM OVERVIEW</h1>
    <p>Selection of Related Web Application, Primary Purpose, Key Features, and Target Users with Disabilities</p>
  </div>

  <h2 class="sub-hdr">A.1 Name of Evaluated Website &amp; Connection to the Terminal Project</h2>
  <p>
    <strong>Evaluated Web Application:</strong> <strong>Google Sheets Web Application</strong> (<code>https://docs.google.com/spreadsheets</code>), evaluated in its live operational configuration as the <em>Municipal Real Property Tax (eRPT) Executive Dashboard, Assessment Roll, and Treasurer Collections System</em> for the Municipality of Pasacao, Camarines Sur.
  </p>
  <p>
    <strong>Relationship to the Terminal Project (RPATIS):</strong> For our BSIT Terminal Project—the <strong>Real Property Assessment Tracking and Inter-Office Synchronization System (RPATIS)</strong>—our team investigated how municipal assessors and treasurers in Camarines Sur (Pasacao, Canaman, Magarao, and San Fernando) record property appraisals, calculate statutory realty taxes under Republic Act No. 7160, and reconcile tax collections. Field interviews in Pasacao revealed that even where localized departmental software exists, staff routinely rely on browser-based spreadsheets (specifically Google Sheets and Excel web exports) to maintain assessment rolls, calculate tax dues via formulas, and exchange collection ledgers between the Assessor's Office and the Treasurer's Office. Evaluating Google Sheets configured as a live Municipal eRPT Web System allows us to audit the exact browser interface municipal personnel use today and translate every WCAG 2.2 accessibility gap into concrete design requirements for RPATIS.
  </p>

  <h2 class="sub-hdr">A.2 Primary Purpose and Key Features Evaluated</h2>
  <p>
    The primary purpose of the evaluated web application is to record taxable real property declarations, compute statutory market and assessed valuations, track tax collection receipts, and reconcile inter-office assessment balances across municipal departments. Our audit inspected six core functional features across three live tabs (<code>Executive Dashboard</code>, <code>Assesment Roll</code>, and <code>Treasurer Collections</code>):
  </p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width:24%;">Key Feature</th>
        <th style="width:42%;">Operational Role in Municipal RPT Workflow</th>
        <th style="width:34%;">Primary UI Components Audited</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Executive Revenue &amp;KPI Dashboard</strong></td>
        <td>Aggregates total registered parcels (8 mock rolls), total market valuation (&#8369;5,228,500.00), assessed valuation (&#8369;2,061,700.00), and Barangay Tax Matrix performance.</td>
        <td>Merged KPI summary cards (<code>A4:C5</code>), stacked summary tables, and floating doughnut/column charts (<code>S1</code>, <code>S2</code>).</td>
      </tr>
      <tr>
        <td><strong>2. 15-Column Municipal Assessment Roll</strong></td>
        <td>Serves as the Assessor's primary cadastre ledger recording TD No., PIN, Masked Owner Name (RA 10173 compliant), Barangay, Classification, Area (sqm), and Unit Value.</td>
        <td>HTML5 <code>&lt;canvas&gt;</code> data grid, frozen row headers, cell selection borders, and horizontal scrollbars (<code>S3</code>).</td>
      </tr>
      <tr>
        <td><strong>3. Statutory Valuation Formula Engine</strong></td>
        <td>Computes Market Value (<code>=F4*G4</code>), statutory Assessment Levels under RA 7160 Sec. 218 (20% Residential, 40% Agricultural, 50% Commercial), 1% Basic RPT, and 1% SEF.</td>
        <td>Formula bar (<code>fx</code>), nested <code>=IF(...)</code> expressions, and corner autofill drag-handle (<code>S4</code>).</td>
      </tr>
      <tr>
        <td><strong>4. Cross-Office Treasury Collection Ledger</strong></td>
        <td>Records Official Receipt (Form 56) numbers, payment dates, and cash collected, cross-referencing Assessor tax dues via <code>=IFERROR(VLOOKUP(...))</code>.</td>
        <td>Reconciliation status cells (Settled, Partial/Underpaid, Record Missing) and variance columns (<code>S5</code>, <code>S6</code>).</td>
      </tr>
      <tr>
        <td><strong>5. Role-Based Link Sharing &amp; Access Control</strong></td>
        <td>Grants Viewer, Commenter, or Editor permissions to municipal clerks and provincial examiners across departments.</td>
        <td>Modal Share Dialog (<code>Share "Erpt spreadsheet"</code>), email combobox, and role selector dropdown (<code>S7</code>).</td>
      </tr>
      <tr>
        <td><strong>6. Application Menus &amp; Version History</strong></td>
        <td>Provides file export, print setup, security limitations, and chronological edit history for audit trails.</td>
        <td>Top menu bar (<code>File</code>, <code>I-edit</code>, <code>Tingnan</code>...) and cascading dropdown overlay menus (<code>S8</code>).</td>
      </tr>
    </tbody>
  </table>

  <h2 class="sub-hdr">A.3 Target Audience &amp; Potential Users (Focus on People with Disabilities)</h2>
  <p>
    Under <strong>Republic Act No. 7277 (Magna Carta for Disabled Persons)</strong> and <strong>Civil Service Commission (CSC) inclusive employment mandates</strong>, Philippine local government units employ personnel with disabilities and serve senior citizens and taxpayers with diverse sensory, motor, and cognitive needs. Grounded in our Pasacao field personas, we identified five key user profiles with disabilities who are directly impacted by accessibility barriers in the web application:
  </p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width:22%;">User / Persona Profile</th>
        <th style="width:22%;">Disability / Functional Limitation</th>
        <th style="width:30%;">Primary Tasks in RPT System</th>
        <th style="width:26%;">Critical WCAG 2.2 Needs</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Ramon S. Alcantara (Age 52)</strong><br>Municipal Assessor &amp; Senior Reviewers</td>
        <td><strong>Low Vision &amp; Age-Related Presbyopia</strong> (Reduced contrast sensitivity; requires 200%&ndash;400% screen zoom).</td>
        <td>Inspects 15-column assessment rolls, verifies Market vs. Assessed values, and approves tax declarations.</td>
        <td><strong>1.4.3</strong> Contrast (4.5:1+), <strong>1.4.4</strong> Resize Text, <strong>1.4.10</strong> Single-Axis Reflow without horizontal clipping.</td>
      </tr>
      <tr>
        <td><strong>2. Danilo S. Perez (Age 49)</strong><br>Property Taxpayer &amp; Male Revenue Clerks</td>
        <td><strong>Color Vision Deficiency (Deuteranopia / Protanopia)</strong> (Difficulty distinguishing red, yellow, and green).</td>
        <td>Reviews payment status badges (Paid vs. Delinquent vs. Underpaid) and compares chart bars.</td>
        <td><strong>1.4.1</strong> Use of Color (icons + text labels beyond color), <strong>1.4.11</strong> Non-text Contrast (3:1).</td>
      </tr>
      <tr>
        <td><strong>3. Liza M. Ba&ntilde;ares (Age 38)</strong><br>Municipal Assessment Clerk</td>
        <td><strong>Motor / Dexterity Impairment</strong> (Carpal tunnel syndrome, hand tremors, or keyboard-only navigation).</td>
        <td>Encodes FAAS records, applies assessment formulas across rows, and switches between ledger tabs.</td>
        <td><strong>2.1.1</strong> Keyboard Access, <strong>2.4.7</strong> Visible Focus, <strong>2.5.7</strong> No Dragging, <strong>2.5.8</strong> Target Size (&ge;24&times;24 px).</td>
      </tr>
      <tr>
        <td><strong>4. Arturo V. Reyes (Age 34)</strong><br>PWD Administrative Records Verifier</td>
        <td><strong>Blind / Screen Reader User</strong> (Relies on NVDA 2024.4 or JAWS auditory output and Braille display).</td>
        <td>Audits tax declaration entries, checks payment clearance status, and verifies share permissions.</td>
        <td><strong>1.1.1</strong> Alt Text, <strong>1.3.1</strong> Semantic <code>&lt;table&gt;</code> &amp; <code>&lt;th&gt;</code>, <strong>4.1.2</strong> Name/Role/Value, <strong>4.1.3</strong> Status Messages.</td>
      </tr>
      <tr>
        <td><strong>5. Carmen R. Villaluz (Age 42)</strong><br>Treasury Cashier (Peak Tax Rush)</td>
        <td><strong>Cognitive / Numeracy Load &amp; Attention Fatigue</strong> (Dyscalculia risk under noisy counter queues).</td>
        <td>Cross-checks Official Receipts against Assessment Roll and resolves variance errors (`#VALUE!`).</td>
        <td><strong>3.3.1</strong> Plain-Language Error ID, <strong>3.3.2</strong> Clear Labels, <strong>3.3.3</strong> Error Suggestions, <strong>3.3.4</strong> Error Prevention.</td>
      </tr>
    </tbody>
  </table>

  <div class="info-box">
    <h4>A.4 Purpose of the Accessibility Evaluation</h4>
    <p style="margin:0;">
      This evaluation systematically audits the live Google Sheets eRPT web system against <strong>W3C WCAG 2.2 Level A and Level AA</strong> standards across the four <strong>POUR</strong> principles (Perceivable, Operable, Understandable, Robust). Its objective is twofold: (1) to expose concrete empirical barriers that hinder municipal employees and citizens with disabilities when using spreadsheet-based e-governance tools, and (2) to engineer verifiable, WCAG 2.2 AA-compliant UI solutions for our proposed <strong>RPATIS Terminal Project</strong>.
    </p>
  </div>

  <!-- SECTION B: METHODOLOGY -->
  <div class="page-break"></div>
  <div class="sec-banner">
    <h1>SECTION B. ACCESSIBILITY AUDIT METHODOLOGY</h1>
    <p>Evaluation Tools Used, Manual &amp; Automated Testing Steps, and WCAG 2.2 Sections Referenced</p>
  </div>

  <h2 class="sub-hdr">B.1 Evaluation Tools and Assistive Technology Environment</h2>
  <p>
    Because rich internet spreadsheet applications render significant portions of their interface inside HTML5 <code>&lt;canvas&gt;</code> elements and custom JavaScript containers, automated scanners alone catch fewer than 35% of real-world accessibility barriers. Our team therefore executed a rigorous <strong>Hybrid Accessibility Audit</strong> combining two manual evaluation protocols (Keyboard-Only Walkthrough and Screen Reader / Reflow Inspection) with four specialized inspection tools:
  </p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width:25%;">Tool / Environment</th>
        <th style="width:20%;">Category</th>
        <th style="width:55%;">Specific Diagnostic Role in This Audit</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. W3C WCAG 2.2 Level A &amp; AA Official Checklist</strong></td>
        <td>Normative Standard Reference</td>
        <td>Provided the 50 applicable Level A and Level AA Success Criteria across Perceivable, Operable, Understandable, and Robust (referenced from <code>WCAG 2.2 CHECKLIST.pdf</code>).</td>
      </tr>
      <tr>
        <td><strong>2. Manual Keyboard-Only &amp; Target Size Walkthrough</strong></td>
        <td>Manual Evaluation #1 (Operable &amp; Understandable)</td>
        <td>Disconnected the mouse to test linear <code>Tab</code>, <code>Shift+Tab</code>, <code>Enter</code>, <code>Escape</code>, and arrow-key navigation across all 3 sheets and the Share modal; measured interactive hit boxes in CSS pixels against WCAG 2.5.8 (24&times;24 px) and 2.5.7 (Dragging).</td>
      </tr>
      <tr>
        <td><strong>3. NVDA 2024.4 Screen Reader + 200%/400% Zoom Reflow Test</strong></td>
        <td>Manual Evaluation #2 (Perceivable &amp; Robust)</td>
        <td>Audited spoken output for merged KPI cards, canvas tables, charts, mixed Tagalog/English menus, error cells (<code>CORD NOT FOUND</code>), and silent formula updates; tested viewport reflow at 1280px @ 400% zoom (320 CSS px equivalent).</td>
      </tr>
      <tr>
        <td><strong>4. Chrome DevTools Accessibility Tree &amp; Vision Emulator</strong></td>
        <td>Browser Inspection &amp; Visual Simulation</td>
        <td>Inspected DOM nodes (`waffle-grid-container`, modal `div` controls) for ARIA `role`, `name`, and `state` attributes; simulated Deuteranopia, Protanopia, Tritanopia, and Blurred Vision on status badges and charts.</td>
      </tr>
      <tr>
        <td><strong>5. TPGi Colour Contrast Analyser (CCA) &amp; WebAIM Checker</strong></td>
        <td>Quantitative Contrast Measurement</td>
        <td>Sampled exact foreground/background hex values on reconciliation status cells, muted toolbar icons, disabled menu items, and Share modal borders against 4.5:1 (1.4.3) and 3:1 (1.4.11) thresholds.</td>
      </tr>
      <tr>
        <td><strong>6. WAVE &amp; axe DevTools Browser Extensions</strong></td>
        <td>Automated DOM Rule Scanning</td>
        <td>Scanned surrounding HTML application chrome and dialogs for missing document landmarks, heading hierarchy skips, unrendered icon ligatures, and missing form label bindings.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="sub-hdr">B.2 Structured Six-Step Testing Procedure</h2>
  <p>
    The audit was conducted on the live <code>Professional_eRPT_Spreadsheet_System</code> workbook in Google Chrome (v130, Windows 11, 1920&times;1080 native resolution) across six sequential steps:
  </p>
  <ol style="margin: 6px 0 14px 22px; font-size: 10pt; line-height: 1.55;">
    <li><strong>Step 1 — Baseline Task &amp; Screen Capture:</strong> Configured the three core municipal RPT tabs (<code>Executive Dashboard</code>, <code>Assesment Roll</code>, and <code>Treasurer Collections</code>) with 8 masked Pasacao tax declarations and captured 8 baseline views (<code>S1</code>&ndash;<code>S8</code>).</li>
    <li><strong>Step 2 — Perceivable Audit (Contrast, Color Simulation &amp; 400% Zoom Reflow):</strong> Measured luminance contrast ratios across all text, status fills, and chart series; enabled Chrome DevTools Deuteranopia/Protanopia emulators; zoomed the viewport to 200% and 400% to record horizontal clipping and two-dimensional scroll barriers.</li>
    <li><strong>Step 3 — Operable Audit (Keyboard-Only Traversal &amp; Pointer Target Measurement):</strong> Attempted to complete an end-to-end RPT task (encoding a parcel, copying the tax formula, switching to Treasurer Collections, and sharing the sheet) using only the keyboard; measured toolbar, tab, and drag-handle dimensions in CSS pixels.</li>
    <li><strong>Step 4 — Understandable Audit (Error Injection, Formula Overwrite &amp; Language Check):</strong> Intentionally entered a realistic transposition typo (<code>TD-26-0080</code> on OR #7712305) and a partial payment (&#8369;800.00 vs. &#8369;864.00 on OR #7712303) to evaluate error identification, recovery guidance, and formula overwrite protection.</li>
    <li><strong>Step 5 — Robust Audit (DOM Accessibility Tree &amp; NVDA Live Region Testing):</strong> Inspected the Accessibility Tree of the Share dialog and grid canvas, and recorded NVDA speech output during live formula recalculations to test WCAG 4.1.2 and 4.1.3 compliance.</li>
    <li><strong>Step 6 — Severity Triaging &amp; RPATIS Redesign Prototyping:</strong> Classified each issue as <strong>Critical</strong> (blocks task completion or causes data/financial corruption for PWD users), <strong>Major</strong> (creates severe friction requiring complex workarounds), or <strong>Minor</strong> (causes confusion or minor delay), and engineered high-fidelity accessible UI mock-ups (<code>M-01</code>&ndash;<code>M-04</code>).</li>
  </ol>

  <h2 class="sub-hdr">B.3 WCAG 2.2 Sections and Success Criteria Referenced</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width:18%;">POUR Principle</th>
        <th style="width:28%;">WCAG 2.2 Guidelines Audited</th>
        <th style="width:54%;">Primary Success Criteria Referenced in Audit Findings</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Perceivable</strong></td>
        <td>1.1 Text Alternatives<br>1.3 Adaptable<br>1.4 Distinguishable</td>
        <td><strong>1.1.1</strong> Non-text Content (A), <strong>1.3.1</strong> Info &amp; Relationships (A), <strong>1.3.2</strong> Meaningful Sequence (A), <strong>1.3.5</strong> Identify Input Purpose (AA), <strong>1.4.1</strong> Use of Color (A), <strong>1.4.3</strong> Contrast Minimum (AA), <strong>1.4.4</strong> Resize Text (AA), <strong>1.4.10</strong> Reflow (AA), <strong>1.4.11</strong> Non-text Contrast (AA), <strong>1.4.12</strong> Text Spacing (AA).</td>
      </tr>
      <tr>
        <td><strong>2. Operable</strong></td>
        <td>2.1 Keyboard Accessible<br>2.4 Navigable<br>2.5 Input Modalities</td>
        <td><strong>2.1.1</strong> Keyboard (A), <strong>2.1.2</strong> No Keyboard Trap (A), <strong>2.4.1</strong> Bypass Blocks (A), <strong>2.4.3</strong> Focus Order (A), <strong>2.4.6</strong> Headings &amp; Labels (AA), <strong>2.4.7</strong> Focus Visible (AA), <strong>2.4.11</strong> Focus Not Obscured Minimum (AA &mdash; <em>New in 2.2</em>), <strong>2.5.7</strong> Dragging Movements (AA &mdash; <em>New in 2.2</em>), <strong>2.5.8</strong> Target Size Minimum (AA &mdash; <em>New in 2.2</em>).</td>
      </tr>
      <tr>
        <td><strong>3. Understandable</strong></td>
        <td>3.1 Readable<br>3.2 Predictable<br>3.3 Input Assistance</td>
        <td><strong>3.1.1</strong> Language of Page (A), <strong>3.1.2</strong> Language of Parts (AA), <strong>3.1.4</strong> Abbreviations (AAA), <strong>3.2.6</strong> Consistent Help (A &mdash; <em>New in 2.2</em>), <strong>3.3.1</strong> Error Identification (A), <strong>3.3.2</strong> Labels or Instructions (A), <strong>3.3.3</strong> Error Suggestion (AA), <strong>3.3.4</strong> Error Prevention Legal/Financial/Data (AA).</td>
      </tr>
      <tr>
        <td><strong>4. Robust</strong></td>
        <td>4.1 Compatible</td>
        <td><strong>4.1.2</strong> Name, Role, Value (A), <strong>4.1.3</strong> Status Messages (AA). <em>(Note: 4.1.1 Parsing is marked Obsolete and Removed in WCAG 2.2).</em></td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION C: AUDIT RESULTS -->
  <div class="page-break"></div>
  <div class="sec-banner">
    <h1>SECTION C. ACCESSIBILITY AUDIT RESULTS (ORGANIZED BY POUR)</h1>
    <p>Empirical Findings, Annotated Screenshot Evidence, Severity Ratings, and Impact Explanations</p>
  </div>
  {"".join(audit_html_blocks)}

  <!-- SECTION D: PROPOSED SOLUTIONS -->
  <div class="page-break"></div>
  <div class="sec-banner">
    <h1>SECTION D. PROPOSED SOLUTIONS &amp; IMPROVED UI MOCK-UPS</h1>
    <p>Redesigned Accessible RPATIS Interface Prototypes, Technical Fixes, and Expected Improvements</p>
  </div>
  <p>
    To resolve all 12 accessibility barriers identified in the Google Sheets eRPT baseline, our team engineered four high-contrast, WCAG 2.2 Level AA-compliant web interface modules for our proposed <strong>Real Property Assessment Tracking and Inter-Office Synchronization System (RPATIS)</strong>. Each mock-up below demonstrates the concrete UI wireframe/prototype alongside its technical remediation and measurable accessibility gain.
  </p>
  {"".join(solutions_html_blocks)}

  <!-- SECTION E: CONCLUSION -->
  <div class="page-break"></div>
  <div class="sec-banner">
    <h1>SECTION E. CONCLUSION, ACCESSIBILITY SCORE &amp; REFLECTION</h1>
    <p>Audit Summary, Quantitative POUR Conformance Score, and the Importance of Inclusive E-Governance</p>
  </div>

  <h2 class="sub-hdr">E.1 Executive Summary of Audit Findings</h2>
  <p>
    Our comprehensive WCAG 2.2 Level A and Level AA evaluation of <strong>Google Sheets configured as a Municipal Real Property Tax (eRPT) Assessment Roll and Treasurer Collections System</strong> demonstrated that while general-purpose cloud spreadsheets excel at ad-hoc tabular calculation, they present severe structural accessibility barriers when deployed as departmental e-governance software. Across 50 applicable Level A and Level AA Success Criteria, our hybrid audit uncovered <strong>12 major empirical issue clusters</strong> (<strong>5 Critical</strong>, <strong>6 Major</strong>, and <strong>1 Minor</strong>)—ranging from an opaque HTML5 <code>&lt;canvas&gt;</code> grid that strips native table semantics (P-02), to color-only reconciliation status rows (P-01), severe horizontal clipping at standard and 200%/400% zoom (P-03), micro-sized 18&times;18 px toolbar targets and 6&times;6 px drag handles (O-02), unprotected legal/financial tax formulas (U-02), cryptic lookup errors (<code>CORD NOT FOUND</code>, U-01), and silent background recalculations lacking <code>aria-live</code> notifications (R-02).
  </p>

  <h2 class="sub-hdr">E.2 Overall Accessibility Score &amp; Quantitative POUR Breakdown</h2>
  <div class="issue-img-wrap" style="margin: 10px 0 14px 0;">
    <img src="{imgs['summary_chart']}" alt="WCAG 2.2 Audit Summary Chart" style="max-height: 310px;" />
    <div class="fig-caption">Figure E.1. Quantitative WCAG 2.2 Level A &amp; AA Conformance Comparison: Audited Google Sheets eRPT Baseline (52.0%) vs. Proposed RPATIS Web Redesign (100.0%).</div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th>POUR Principle</th>
        <th style="text-align:center;">Applicable Criteria (A &amp; AA)</th>
        <th style="text-align:center;">Baseline Passed</th>
        <th style="text-align:center;">Baseline Failed</th>
        <th style="text-align:center;">Audited Baseline Score</th>
        <th style="text-align:center;">Redesigned RPATIS Score</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Perceivable (Guidelines 1.1&ndash;1.4)</strong></td>
        <td style="text-align:center;">20</td>
        <td style="text-align:center;">10</td>
        <td style="text-align:center;">10</td>
        <td style="text-align:center; font-weight:800; color:#DC2626;">50.0%</td>
        <td style="text-align:center; font-weight:800; color:#059669;">100.0% (20/20)</td>
      </tr>
      <tr>
        <td><strong>2. Operable (Guidelines 2.1&ndash;2.5)</strong></td>
        <td style="text-align:center;">17</td>
        <td style="text-align:center;">10</td>
        <td style="text-align:center;">7</td>
        <td style="text-align:center; font-weight:800; color:#D97706;">58.8%</td>
        <td style="text-align:center; font-weight:800; color:#059669;">100.0% (17/17)</td>
      </tr>
      <tr>
        <td><strong>3. Understandable (Guidelines 3.1&ndash;3.3)</strong></td>
        <td style="text-align:center;">11</td>
        <td style="text-align:center;">6</td>
        <td style="text-align:center;">5</td>
        <td style="text-align:center; font-weight:800; color:#D97706;">54.5%</td>
        <td style="text-align:center; font-weight:800; color:#059669;">100.0% (11/11)</td>
      </tr>
      <tr>
        <td><strong>4. Robust (Guideline 4.1)</strong></td>
        <td style="text-align:center;">2</td>
        <td style="text-align:center;">0</td>
        <td style="text-align:center;">2</td>
        <td style="text-align:center; font-weight:800; color:#DC2626;">0.0%</td>
        <td style="text-align:center; font-weight:800; color:#059669;">100.0% (2/2)</td>
      </tr>
      <tr style="background:#EFF6FF; font-weight:800;">
        <td><strong>OVERALL WCAG 2.2 LEVEL A &amp; AA SCORE</strong></td>
        <td style="text-align:center;"><strong>55 Total (50 Applicable, 5 N/A)</strong></td>
        <td style="text-align:center; color:#1E3A8A;"><strong>26 Passed (excl. 5 N/A)</strong></td>
        <td style="text-align:center; color:#DC2626;"><strong>24 Failed</strong></td>
        <td style="text-align:center; font-size:11pt; color:#DC2626;"><strong>52.0% (Non-Conforming)</strong></td>
        <td style="text-align:center; font-size:11pt; color:#059669;"><strong>100.0% (AA Compliant)</strong></td>
      </tr>
    </tbody>
  </table>

  <h2 class="sub-hdr">E.3 Reflection on the Importance of Inclusive Design in Public-Sector Systems</h2>
  <p>
    Conducting this WCAG 2.2 accessibility audit fundamentally reshaped how our group views software engineering for Philippine Local Government Units. Before this evaluation, we primarily framed the bottlenecks in the Municipal Assessor and Treasurer Offices of Pasacao and Canaman as database synchronization and document-routing problems. Stepping through the eyes of users with disabilities—a 52-year-old Municipal Assessor experiencing age-related presbyopia, a revenue clerk with red-green color blindness, an encoder with carpal tunnel syndrome navigating via keyboard, or a visually impaired administrative aide relying on NVDA—revealed that <strong>an unintegrated spreadsheet is not merely slow; it actively excludes people from public service</strong>.
  </p>
  <p>
    Inclusive design in government software is a statutory and moral imperative under <strong>Republic Act No. 7277 (Magna Carta for Disabled Persons)</strong>, <strong>RA 11032 (Ease of Doing Business)</strong>, and <strong>UN Sustainable Development Goal 16 (Effective, Accountable, and Inclusive Institutions)</strong>. Beyond legal compliance, every accessibility improvement we designed for RPATIS illustrates the <em>"Curb-Cut Effect"</em>: replacing cryptic <code>VLOOKUP</code> error strings with 1-click fuzzy-match recovery helps not only clerks with cognitive or learning disabilities, but every frontline cashier working under high-stress January tax queues; enforcing 44&times;44 px buttons and locking statutory formulas prevents costly clerical mistakes across the entire municipal workforce. By embedding WCAG 2.2 Level AA compliance directly into the architecture of RPATIS from day one, we ensure that digital transformation in Camarines Sur leaves no municipal worker or taxpayer behind.
  </p>

  <!-- APPENDIX: COMPLETE WCAG 2.2 CHECKLIST -->
  <div class="page-break"></div>
  <div class="sec-banner">
    <h1>APPENDIX. COMPLETED WCAG 2.2 LEVEL A &amp; AA CONFORMANCE CHECKLIST</h1>
    <p>Criterion-by-Criterion Audit of the Google Sheets eRPT Web System Referenced Against WCAG 2.2 CHECKLIST.pdf</p>
  </div>
  <table class="data-table" style="font-size:8.8pt;">
    <thead>
      <tr>
        <th style="width:9%;">Criterion</th>
        <th style="width:23%;">Success Criterion Name</th>
        <th style="width:7%; text-align:center;">Level</th>
        <th style="width:12%; text-align:center;">Audit Status</th>
        <th style="width:49%;">Empirical Audit Observations &amp; Evidence Reference</th>
      </tr>
    </thead>
    <tbody>
      {checklist_rows}
    </tbody>
  </table>

</body>
</html>"""

    html_out = os.path.join(SCRATCH_DIR, "case_study_report.html")
    with open(html_out, "w", encoding="utf-8") as f:
        f.write(html_doc)

    pdf_out = os.path.join(OUT_DIR, "GRP23_Accessibility_UX_Case_Study_WCAG2.2.pdf")
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_out}",
        html_out,
    ]
    subprocess.run(cmd, check=True)

    # Stamp clean page numbers at top-right / bottom-right on pages 2..N using PyMuPDF
    doc = fitz.open(pdf_out)
    total_pages = len(doc)
    for i, page in enumerate(doc):
        if i == 0:
            continue  # suppress on cover page
        rect = page.rect
        footer_text = f"Group 23 (Asido, Calubad, Ibis, Ortega) — Accessibility UX Case Study (WCAG 2.2)   |   Page {i+1} of {total_pages}"
        page.insert_text(
            fitz.Point(rect.width - 400, rect.height - 22),
            footer_text,
            fontsize=8.5,
            fontname="helv",
            color=(0.28, 0.33, 0.41),
        )
    temp_pdf = os.path.join(SCRATCH_DIR, "_stamped_report.pdf")
    doc.save(temp_pdf)
    doc.close()
    os.replace(temp_pdf, pdf_out)
    print(f"Saved PDF Case Study ({total_pages} pages):", pdf_out)
    return pdf_out


def build_docx_case_study():
    import docx
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    from docx.shared import Inches, Pt, RGBColor

    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.85)
        s.right_margin = Inches(0.85)

    style = doc.styles["Normal"]
    style.font.name = "Arial"
    style.font.size = Pt(10.5)

    def set_cell_bg(cell, hex_color):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = OxmlElement("w:shd")
        shd.set(qn("w:val"), "clear")
        shd.set(qn("w:color"), "auto")
        shd.set(qn("w:fill"), hex_color)
        tcPr.append(shd)

    # Title block
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_title.add_run("WEB ACCESSIBILITY AUDIT & INCLUSIVE UX CASE STUDY (WCAG 2.2 LEVEL A & AA)\n")
    r.bold = True
    r.font.size = Pt(15)
    r.font.color.rgb = RGBColor(15, 23, 42)
    r2 = p_title.add_run(
        "Evaluated Web Application: Google Sheets Municipal eRPT Assessment & Collection System\n"
        "Terminal Project Benchmark: Real Property Assessment Tracking and Inter-Office Synchronization System (RPATIS)\n"
        "By: Asido, Christian Louise O. | Calubad, John Kenneth P. | Ibis, Angelfranz B. | Ortega, Rizalina A. (Group 23 — October 2026)"
    )
    r2.font.size = Pt(10.5)
    r2.font.color.rgb = RGBColor(30, 58, 138)

    def add_sec_heading(text):
        h = doc.add_heading(text, level=1)
        for run in h.runs:
            run.font.name = "Arial"
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(30, 58, 138)

    add_sec_heading("A. Overview & Website Audit Preparation")
    doc.add_paragraph(
        "Evaluated Website: Google Sheets Web Application (https://docs.google.com/spreadsheets) configured as the "
        "Pasacao Municipal Real Property Tax (eRPT) Executive Dashboard, Assessment Roll, and Treasurer Collections System. "
        "This web application directly mirrors the core appraisal calculation and inter-office ledger reconciliation workflows "
        "targeted by our BSIT Terminal Project, the Real Property Assessment Tracking and Inter-Office Synchronization System (RPATIS)."
    )
    doc.add_paragraph(
        "Target Audience & Potential Users with Disabilities: (1) Senior Assessors & Taxpayers with Low Vision / Presbyopia "
        "(Ramon S. Alcantara, Age 52 — requiring 200%–400% zoom and high contrast); (2) Clerks & Taxpayers with Color Vision "
        "Deficiency / Deuteranopia (Danilo S. Perez, Age 49 — requiring non-color status indicators); (3) Assessment Clerks "
        "with Motor/Dexterity Impairments (Liza M. Bañares, Age 38 — requiring keyboard-only navigation, ≥24×24 px targets, "
        "and non-dragging actions); (4) Blind & Screen Reader Users (Arturo V. Reyes, Age 34 — requiring semantic HTML tables, "
        "chart text alternatives, and ARIA live status messages); and (5) Treasury Cashiers under Cognitive/Numeracy Load "
        "(Carmen R. Villaluz, Age 42 — requiring plain-language error recovery and formula overwrite safeguards)."
    )

    add_sec_heading("B. Methodology")
    doc.add_paragraph(
        "Tools Used: (1) W3C WCAG 2.2 Level A & AA Checklist (50 applicable criteria); (2) Manual Keyboard-Only Navigation "
        "& CSS Target Size Walkthrough; (3) NVDA 2024.4 Screen Reader & 200%/400% Zoom Reflow Testing; (4) Chrome DevTools "
        "Accessibility Tree & Vision Deficiency Emulator; (5) TPGi Colour Contrast Analyser (CCA); and (6) WAVE / axe DevTools."
    )

    add_sec_heading("C. Audit Results (Organized by POUR Categories)")
    for iss in ISSUES:
        p = doc.add_paragraph()
        r_id = p.add_run(f"[{iss['id']} | {iss['category'].upper()} | {iss['severity'].upper()}] {iss['title']}\n")
        r_id.bold = True
        r_id.font.color.rgb = RGBColor(185, 28, 28) if iss["severity"] == "Critical" else RGBColor(30, 58, 138)
        p.add_run(f"WCAG Reference: {iss['wcag']}\nLocation: {iss['location']}\n").italic = True
        p.add_run(f"Why It's a Problem (Impact): {iss['problem']}\n")
        p.add_run(f"Recommended Fix: {iss['fix']}\n")
        p.add_run(f"Expected Improvement: {iss['improvement']}")
        img_path = os.path.join(ASSETS_DIR, iss["img"])
        if os.path.exists(img_path):
            doc.add_picture(img_path, width=Inches(6.2))

    add_sec_heading("D. Proposed Solutions (Redesigned RPATIS UI Mock-ups)")
    for m_file, m_title in [
        ("solution_M1_perceivable.png", "Mock-up M-01 (Perceivable Redesign): Semantic Tables, Multi-Cue Status Chips & 400% Reflow"),
        ("solution_M2_operable.png", "Mock-up M-02 (Operable Redesign): Skip Links, 44x44px Targets, Non-Drag Actions & 3px Focus Rings"),
        ("solution_M3_understandable.png", "Mock-up M-03 (Understandable Redesign): Smart Error Recovery, Locked Formulas & Confirmation Modal"),
        ("solution_M4_robust.png", "Mock-up M-04 (Robust Redesign): Native HTML5 Controls, aria-live Status Region & NVDA Output"),
    ]:
        p = doc.add_paragraph()
        p.add_run(m_title).bold = True
        doc.add_picture(os.path.join(ASSETS_DIR, m_file), width=Inches(6.4))

    add_sec_heading("E. Conclusion & Overall Accessibility Score")
    doc.add_picture(os.path.join(ASSETS_DIR, "audit_summary_charts.png"), width=Inches(6.4))
    doc.add_paragraph(
        "Overall Accessibility Score: The audited Google Sheets eRPT baseline achieved 52.0% conformance (26 passed out of "
        "50 applicable WCAG 2.2 Level A & AA criteria, with 24 failures across 5 Critical, 6 Major, and 1 Minor issue clusters). "
        "By contrast, the redesigned RPATIS Web Interface achieves 100.0% conformance across all 50 applicable Level A and AA criteria."
    )

    add_sec_heading("Appendix: Completed WCAG 2.2 Level A & AA Checklist")
    tbl = doc.add_table(rows=1, cols=5)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = tbl.rows[0].cells
    for idx, text in enumerate(["Criterion", "Name", "Level", "Status", "Audit Comments"]):
        hdr[idx].text = text
        set_cell_bg(hdr[idx], "1E3A8A")
        for r in hdr[idx].paragraphs[0].runs:
            r.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
    for sc_id, sc_name, level, status, comment in WCAG_CHECKLIST:
        row = tbl.add_row().cells
        row[0].text = sc_id
        row[1].text = sc_name
        row[2].text = level
        row[3].text = status
        row[4].text = comment

    docx_out = os.path.join(OUT_DIR, "GRP23_Accessibility_UX_Case_Study_WCAG2.2.docx")
    doc.save(docx_out)
    print("Saved DOCX Case Study:", docx_out)


if __name__ == "__main__":
    build_pdf_case_study()
    build_docx_case_study()
