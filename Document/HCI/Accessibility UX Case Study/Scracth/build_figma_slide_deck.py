"""
Builds the Figma Slide Deck UX Case Study (16:9 Widescreen, 14 Slides) in 3 formats:
1. `GRP23_Figma_Slide_Deck_Accessibility_UX_Case_Study.pdf` (16:9 Widescreen Presentation PDF via Headless Chrome)
2. `GRP23_Figma_Slide_Deck_Accessibility_UX_Case_Study.pptx` (16:9 Editable PowerPoint / Figma Slides Deck via python-pptx)
3. `GRP23_Figma_Interactive_Slide_Deck.html` (Interactive Figma Prototype & Canvas Slide Deck Viewer)
All intermediate files and scripts are stored in `Scracth/`.
"""
import base64
import html
import os
import subprocess
import fitz  # PyMuPDF
from pptx import Presentation
from pptx.util import Inches, Pt

SCRATCH_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.dirname(SCRATCH_DIR)
ASSETS_DIR = os.path.join(SCRATCH_DIR, "assets")
SLIDES_DIR = os.path.join(SCRATCH_DIR, "slides")
os.makedirs(SLIDES_DIR, exist_ok=True)

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME_PATH):
    CHROME_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"


def img_to_data_uri(filename):
    path = os.path.join(ASSETS_DIR, filename)
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:image/png;base64,{b64}"


def figma_top_bar(frame_num, frame_name, section_tag, pill_color="#38BDF8"):
    return f"""
    <div class="figma-bar">
      <div class="figma-left">
        <span class="figma-logo">
          <svg width="16" height="24" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
            <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
            <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
            <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
            <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
          </svg>
        </span>
        <span class="figma-file">GRP23_RPATIS_Accessibility_UX_Case_Study.fig</span>
        <span class="figma-sep">/</span>
        <span class="figma-frame-id">Frame {frame_num:02d} &bull; {html.escape(frame_name)}</span>
      </div>
      <div class="figma-right">
        <span class="figma-sec-pill" style="border-color:{pill_color}; color:{pill_color};">{html.escape(section_tag)}</span>
        <span class="figma-wcag-pill">WCAG 2.2 Level A &amp; AA</span>
        <span class="figma-page-num">Slide {frame_num} / 14</span>
      </div>
    </div>
    """


def figma_footer(left_note="Evaluated Web App: Google Sheets eRPT System (docs.google.com/spreadsheets) -> Proposed Terminal Project: RPATIS (Pasacao, Camarines Sur)"):
    return f"""
    <div class="figma-footer">
      <span>{html.escape(left_note)}</span>
      <span>Group 23: Christian Louise O. Asido &bull; John Kenneth P. Calubad &bull; Angelfranz B. Ibis &bull; Rizalina A. Ortega | BSIT SCIS, University of Nueva Caceres</span>
    </div>
    """


def build_slides_html(interactive=False):
    imgs = {
        "P-01": img_to_data_uri("audit_P01_color_contrast.png"),
        "P-02": img_to_data_uri("audit_P02_canvas_semantics.png"),
        "P-03": img_to_data_uri("audit_P03_reflow_clipping.png"),
        "O-01": img_to_data_uri("audit_O01_keyboard_navigation.png"),
        "O-02": img_to_data_uri("audit_O02_target_size.png"),
        "O-03": img_to_data_uri("audit_O03_focus_obscured.png"),
        "U-01": img_to_data_uri("audit_U01_cryptic_errors.png"),
        "U-02": img_to_data_uri("audit_U02_formula_vulnerability.png"),
        "U-03": img_to_data_uri("audit_U03_language_jargon.png"),
        "R-01": img_to_data_uri("audit_R01_name_role_value.png"),
        "R-02": img_to_data_uri("audit_R02_status_messages.png"),
        "R-03": img_to_data_uri("audit_R03_input_purpose.png"),
        "M1": img_to_data_uri("solution_M1_perceivable.png"),
        "M2": img_to_data_uri("solution_M2_operable.png"),
        "M3": img_to_data_uri("solution_M3_understandable.png"),
        "M4": img_to_data_uri("solution_M4_robust.png"),
        "CHART": img_to_data_uri("audit_summary_charts.png"),
    }

    interactive_Nav = ""
    interactive_js = ""
    if interactive:
        interactive_Nav = """
        <div id="deck-toolbar">
          <div class="dt-left">
            <strong>FIGMA SLIDE DECK VIEWER</strong> &bull; GRP 23 Accessibility UX Case Study (WCAG 2.2)
          </div>
          <div class="dt-center">
            <button onclick="prevSlide()">&#9664; Prev</button>
            <span id="slide-indicator">Slide 1 / 14</span>
            <button onclick="nextSlide()">Next &#9654;</button>
            <button onclick="toggleMode()" id="mode-btn">Switch to Figma Canvas Grid View</button>
          </div>
          <div class="dt-right">
            Use <code>&larr;</code> <code>&rarr;</code> Arrow Keys to Navigate
          </div>
        </div>
        """
        interactive_js = """
        <script>
          let cur = 0;
          let gridMode = false;
          const slides = document.querySelectorAll('.slide-frame');
          function updateView() {
            if (gridMode) {
              document.body.classList.add('canvas-grid-mode');
              slides.forEach(s => s.style.display = 'flex');
              document.getElementById('mode-btn').textContent = 'Switch to Single-Slide Presentation Mode';
            } else {
              document.body.classList.remove('canvas-grid-mode');
              slides.forEach((s, i) => s.style.display = (i === cur) ? 'flex' : 'none');
              document.getElementById('slide-indicator').textContent = 'Slide ' + (cur + 1) + ' / ' + slides.length;
              document.getElementById('mode-btn').textContent = 'Switch to Figma Canvas Grid View';
            }
          }
          function nextSlide() { if (cur < slides.length - 1) { cur++; updateView(); } }
          function prevSlide() { if (cur > 0) { cur--; updateView(); } }
          function toggleMode() { gridMode = !gridMode; updateView(); }
          document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { nextSlide(); }
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') { prevSlide(); }
          });
          slides.forEach((s, idx) => {
            s.addEventListener('click', () => {
              if (gridMode) { cur = idx; gridMode = false; updateView(); }
            });
          });
          updateView();
        </script>
        """

    html_str = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Group 23 — Figma Slide Deck UX Case Study (WCAG 2.2 Accessibility Audit)</title>
<style>
  @page {{
    size: 16in 9in;
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}
  body {{
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    background: #1E1E1E;
    color: #0F172A;
  }}
  .slide-frame {{
    width: 16in;
    height: 9in;
    background: #F8FAFC;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }}
  .slide-frame:last-of-type {{
    page-break-after: auto;
    break-after: auto;
  }}

  /* Figma Top Bar */
  .figma-bar {{
    height: 46px;
    background: #1E293B;
    color: #F8FAFC;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 28px;
    border-bottom: 2px solid #334155;
    flex-shrink: 0;
  }}
  .figma-left {{
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
  }}
  .figma-logo {{
    display: inline-flex;
    align-items: center;
  }}
  .figma-file {{
    color: #94A3B8;
    font-weight: 600;
  }}
  .figma-sep {{
    color: #64748B;
  }}
  .figma-frame-id {{
    color: #FFFFFF;
    font-weight: 800;
    letter-spacing: 0.2px;
  }}
  .figma-right {{
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
  }}
  .figma-sec-pill {{
    background: rgba(15, 23, 42, 0.7);
    border: 1.5px solid #38BDF8;
    padding: 3px 10px;
    border-radius: 999px;
    font-weight: 800;
    letter-spacing: 0.4px;
  }}
  .figma-wcag-pill {{
    background: #2563EB;
    color: #FFFFFF;
    padding: 3px 10px;
    border-radius: 999px;
    font-weight: 700;
  }}
  .figma-page-num {{
    background: #0F172A;
    color: #E2E8F0;
    padding: 3px 10px;
    border-radius: 6px;
    font-weight: 800;
  }}

  /* Slide Body */
  .slide-body {{
    flex: 1;
    padding: 20px 32px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: hidden;
  }}
  .slide-hdr {{
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid #CBD5E1;
    padding-bottom: 8px;
  }}
  .slide-hdr h1 {{
    font-size: 25px;
    font-weight: 900;
    color: #0F172A;
    letter-spacing: -0.3px;
  }}
  .slide-hdr p {{
    font-size: 13.5px;
    color: #475569;
    margin-top: 2px;
    font-weight: 500;
  }}
  .hdr-badge {{
    background: #EFF6FF;
    border: 1.5px solid #2563EB;
    color: #1E3A8A;
    font-weight: 800;
    font-size: 12.5px;
    padding: 5px 12px;
    border-radius: 8px;
    white-space: nowrap;
  }}

  /* Figma Footer */
  .figma-footer {{
    height: 34px;
    background: #0F172A;
    color: #CBD5E1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 28px;
    font-size: 11.5px;
    font-weight: 600;
    flex-shrink: 0;
  }}

  /* Grids & Cards */
  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    flex: 1;
  }}
  .grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    flex: 1;
  }}
  .card {{
    background: #FFFFFF;
    border: 1.5px solid #CBD5E1;
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
  }}
  .card h3 {{
    font-size: 15.5px;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 6px;
  }}
  .card p, .card li {{
    font-size: 12.8px;
    line-height: 1.42;
    color: #334155;
  }}

  /* Severity & Status Pills */
  .pill {{
    display: inline-block;
    padding: 2px 8px;
    border-radius: 5px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
  }}
  .pill-crit {{ background: #FEE2E2; color: #991B1B; border: 1.5px solid #DC2626; }}
  .pill-maj  {{ background: #FFEDD5; color: #9A3412; border: 1.5px solid #EA580C; }}
  .pill-min  {{ background: #DBEAFE; color: #1E40AF; border: 1.5px solid #2563EB; }}
  .pill-wcag {{ background: #F1F5F9; color: #0F172A; border: 1px solid #94A3B8; font-weight: 700; text-transform: none; }}

  /* Audit Issue 3-Column Card */
  .audit-card {{
    background: #FFFFFF;
    border: 2px solid #CBD5E1;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
  }}
  .audit-card-top {{
    display: flex;
    flex-direction: column;
    gap: 5px;
  }}
  .audit-badge-row {{
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }}
  .issue-id-tag {{
    background: #0F172A;
    color: #FFFFFF;
    font-weight: 900;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 5px;
  }}
  .audit-card h3 {{
    font-size: 14.5px;
    font-weight: 800;
    color: #0F172A;
    line-height: 1.28;
  }}
  .audit-img-box {{
    background: #F8FAFC;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    padding: 4px;
    text-align: center;
  }}
  .audit-img-box img {{
    width: 100%;
    height: 235px;
    object-fit: contain;
    border-radius: 4px;
  }}
  .audit-impact-box {{
    background: #FEF2F2;
    border-left: 4px solid #DC2626;
    padding: 8px 10px;
    border-radius: 5px;
    font-size: 12px;
    line-height: 1.38;
    color: #1E293B;
  }}
  .audit-impact-box strong {{
    color: #7F1D1D;
  }}

  /* Solution Slide Layout */
  .sol-layout {{
    display: grid;
    grid-template-columns: 1.38fr 1fr;
    gap: 18px;
    flex: 1;
    align-items: stretch;
  }}
  .sol-mock-card {{
    background: #FFFFFF;
    border: 2px solid #2563EB;
    border-radius: 12px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }}
  .sol-mock-card img {{
    width: 100%;
    height: 555px;
    object-fit: contain;
    border-radius: 6px;
  }}
  .sol-mock-cap {{
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    color: #1E3A8A;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    text-align: center;
  }}
  .sol-fixes-col {{
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: space-between;
  }}
  .sol-fix-item {{
    background: #FFFFFF;
    border: 1.5px solid #CBD5E1;
    border-left: 5px solid #059669;
    border-radius: 10px;
    padding: 10px 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }}
  .sol-fix-item h4 {{
    font-size: 13.5px;
    font-weight: 800;
    color: #065F46;
    margin-bottom: 4px;
  }}
  .sol-fix-item p {{
    font-size: 12px;
    line-height: 1.36;
    color: #1E293B;
  }}
  .sol-gain-pill {{
    margin-top: 6px;
    background: #ECFDF5;
    border: 1px solid #6EE7B7;
    color: #065F46;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 11.5px;
    font-weight: 700;
  }}

  /* Tables on Slides */
  table.slide-tbl {{
    width: 100%;
    border-collapse: collapse;
    font-size: 12.2px;
    background: #FFFFFF;
    border-radius: 8px;
    overflow: hidden;
  }}
  table.slide-tbl th {{
    background: #1E3A8A;
    color: #FFFFFF;
    text-align: left;
    padding: 8px 10px;
    font-weight: 800;
    border: 1px solid #1E3A8A;
  }}
  table.slide-tbl td {{
    padding: 7px 10px;
    border: 1px solid #CBD5E1;
    vertical-align: top;
    color: #1E293B;
    line-height: 1.35;
  }}
  table.slide-tbl tr:nth-child(even) td {{
    background: #F8FAFC;
  }}

  /* Interactive Mode Styles */
  #deck-toolbar {{
    position: sticky;
    top: 0;
    z-index: 9999;
    background: #090D16;
    color: #F8FAFC;
    padding: 10px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #2563EB;
    font-size: 13px;
  }}
  #deck-toolbar button {{
    background: #2563EB;
    color: #FFFFFF;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    margin: 0 4px;
  }}
  #deck-toolbar button:hover {{
    background: #1D4ED8;
  }}
  body.canvas-grid-mode {{
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 24px;
    justify-content: center;
    background: #1E1E1E;
  }}
  body.canvas-grid-mode #deck-toolbar {{
    width: 100%;
  }}
  body.canvas-grid-mode .slide-frame {{
    transform: scale(0.45);
    transform-origin: top left;
    margin-bottom: -480px;
    margin-right: -800px;
    border: 3px solid #38BDF8;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  }}
</style>
</head>
<body>
{interactive_Nav}

<!-- ==================== SLIDE 1: COVER SLIDE ==================== -->
<div class="slide-frame" style="background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 65%, #0F172A 100%); color: #FFFFFF;">
  {figma_top_bar(1, "Cover_Title_UX_Case_Study", "UX CASE STUDY DECK", "#38BDF8")}
  <div class="slide-body" style="justify-content: center; padding: 36px 56px; gap: 24px;">
    <div style="display:flex; gap:12px; align-items:center;">
      <span style="background:#2563EB; color:#FFF; padding:6px 16px; border-radius:999px; font-weight:800; font-size:13px; letter-spacing:0.8px;">HUMAN-COMPUTER INTERACTION (HCI) &bull; ACCESSIBILITY UX CASE STUDY</span>
      <span style="background:rgba(56,189,248,0.18); border:1.5px solid #38BDF8; color:#38BDF8; padding:6px 16px; border-radius:999px; font-weight:800; font-size:13px;">W3C WCAG 2.2 LEVEL A &amp; AA CONFORMANCE</span>
    </div>

    <div>
      <h1 style="font-size:44px; font-weight:900; line-height:1.14; color:#FFFFFF; max-width:1320px;">
        Web Accessibility Audit &amp; Inclusive UX Redesign Case Study
      </h1>
      <p style="font-size:21px; color:#93C5FD; margin-top:12px; max-width:1250px; line-height:1.4; font-weight:500;">
        Evaluating <strong>Google Sheets</strong> as a Municipal Real Property Tax (eRPT) Assessment &amp; Treasury Collection Web Application and Engineering an Accessible Interface for the Proposed <strong>RPATIS Terminal Project</strong>
      </p>
    </div>

    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:18px; margin-top:10px;">
      <div style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(148,163,184,0.35); border-radius:12px; padding:18px;">
        <div style="font-size:11.5px; font-weight:800; color:#38BDF8; text-transform:uppercase; margin-bottom:6px;">Evaluated Baseline Web App</div>
        <div style="font-size:16px; font-weight:800; color:#FFFFFF;">Google Sheets Web App</div>
        <div style="font-size:12.5px; color:#CBD5E1; margin-top:4px;"><code>docs.google.com/spreadsheets</code><br>Configured as <em>Pasacao Municipal eRPT Assessment &amp; Treasury System</em></div>
      </div>
      <div style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(148,163,184,0.35); border-radius:12px; padding:18px;">
        <div style="font-size:11.5px; font-weight:800; color:#34D399; text-transform:uppercase; margin-bottom:6px;">Related Terminal Project</div>
        <div style="font-size:16px; font-weight:800; color:#FFFFFF;">Proposed RPATIS Web System</div>
        <div style="font-size:12.5px; color:#CBD5E1; margin-top:4px;">Real Property Assessment Tracking &amp; Inter-Office Synchronization System (Pasacao, Camarines Sur)</div>
      </div>
      <div style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(148,163,184,0.35); border-radius:12px; padding:18px;">
        <div style="font-size:11.5px; font-weight:800; color:#FBBF24; text-transform:uppercase; margin-bottom:6px;">Audit Scope &amp; Score</div>
        <div style="font-size:16px; font-weight:800; color:#FFFFFF;">52.0% Baseline &rarr; 100% RPATIS</div>
        <div style="font-size:12.5px; color:#CBD5E1; margin-top:4px;">12 POUR Issue Clusters (5 Critical, 6 Major, 1 Minor) across 50 Applicable A/AA Criteria</div>
      </div>
      <div style="background:rgba(255,255,255,0.08); border:1.5px solid rgba(148,163,184,0.35); border-radius:12px; padding:18px;">
        <div style="font-size:11.5px; font-weight:800; color:#C084FC; text-transform:uppercase; margin-bottom:6px;">Group 23 Proponents (BSIT)</div>
        <div style="font-size:13px; font-weight:800; color:#FFFFFF; line-height:1.4;">1. Christian Louise O. Asido<br>2. John Kenneth P. Calubad<br>3. Angelfranz B. Ibis<br>4. Rizalina A. Ortega</div>
        <div style="font-size:12px; color:#CBD5E1; margin-top:4px;">University of Nueva Caceres (SCIS)</div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 2: SECTION A.1 — OVERVIEW & KEY FEATURES ==================== -->
<div class="slide-frame">
  {figma_top_bar(2, "Overview_Evaluated_Website_and_Features", "SECTION A: OVERVIEW", "#38BDF8")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>A.1 Website Audit Preparation: Evaluated Web App &amp; Key Features</h1>
        <p>Why Google Sheets eRPT was selected as the baseline web application for our RPATIS Terminal Project</p>
      </div>
      <span class="hdr-badge">Evaluated URL: https://docs.google.com/spreadsheets</span>
    </div>

    <div class="grid-2" style="grid-template-columns: 1fr 1.35fr; align-items: stretch;">
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="card" style="background:#EFF6FF; border-color:#93C5FD; flex:1;">
          <h3 style="color:#1E3A8A;">Connection to Our Terminal Project (RPATIS)</h3>
          <p style="margin-bottom:8px;">
            Our BSIT Terminal Project—the <strong>Real Property Assessment Tracking and Inter-Office Synchronization System (RPATIS)</strong>—addresses disconnected property records and 7-day transfer delays between the Municipal Assessor's and Treasurer's Offices in <strong>Pasacao, Camarines Sur</strong> (as well as Canaman, Magarao, and San Fernando).
          </p>
          <p>
            Field interviews revealed that municipal staff routinely rely on <strong>browser-based spreadsheets (Google Sheets / Excel web exports)</strong> to maintain 15-column assessment rolls, compute statutory property taxes under <strong>RA 7160</strong>, and cross-check Official Receipts via <code>VLOOKUP</code>. Auditing this live web application exposes the exact accessibility barriers municipal staff and citizens face today.
          </p>
        </div>
        <div class="card" style="border-left: 5px solid #2563EB;">
          <h3>Primary Purpose of the Evaluated Website</h3>
          <p>
            To encode taxable real property declarations (FAAS), calculate statutory market and assessed valuations, record Form 56 Official Receipt tax payments, and reconcile inter-office tax balances across municipal departments.
          </p>
        </div>
        <div class="card" style="background:#ECFDF5; border-color:#6EE7B7;">
          <h3 style="color:#065F46;">Dual Purpose of This WCAG 2.2 Evaluation</h3>
          <p style="color:#064E3B;">
            <strong>1. Diagnostic Audit:</strong> Identify Perceivable, Operable, Understandable, and Robust barriers in spreadsheet-based LGU workflows.<br>
            <strong>2. Inclusive Engineering:</strong> Translate every failure into a WCAG 2.2 AA-compliant UI component for RPATIS.
          </p>
        </div>
      </div>

      <div class="card" style="padding:0; overflow:hidden; border:1.5px solid #1E3A8A;">
        <table class="slide-tbl" style="height:100%;">
          <thead>
            <tr>
              <th style="width:26%;">Key Feature Audited</th>
              <th style="width:46%;">Operational Role in Municipal RPT Workflow</th>
              <th style="width:28%;">UI Components Inspected</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Executive Revenue &amp; KPI Dashboard</strong></td>
              <td>Aggregates 8 mock Pasacao tax rolls, Market Value (&#8369;5,228,500), Assessed Value (&#8369;2,061,700), and Barangay Tax Matrix.</td>
              <td>Merged KPI cells (<code>A4:C5</code>), 3 stacked tables, floating charts (<code>S1, S2</code>).</td>
            </tr>
            <tr>
              <td><strong>2. 15-Column Municipal Assessment Roll</strong></td>
              <td>Assessor's cadastre ledger recording TD No., PIN, Masked Owner (RA 10173), Barangay, Classification, Area, and Unit Value.</td>
              <td>HTML5 <code>&lt;canvas&gt;</code> grid, frozen headers, horizontal scrollbars (<code>S3</code>).</td>
            </tr>
            <tr>
              <td><strong>3. Statutory Valuation Formula Engine</strong></td>
              <td>Computes Market Value (<code>=F4*G4</code>), RA 7160 Sec. 218 Assessment Levels (20%/40%/50%), 1% Basic RPT, and 1% SEF.</td>
              <td>Formula bar (<code>fx</code>), nested <code>=IF(...)</code> strings, 6&times;6 px autofill drag-handle (<code>S4</code>).</td>
            </tr>
            <tr>
              <td><strong>4. Cross-Office Treasury Collection Ledger</strong></td>
              <td>Logs Official Receipt numbers, payment dates, and cash collected; cross-checks Assessor dues via <code>=IFERROR(VLOOKUP(...))</code>.</td>
              <td>Color-coded status rows (Settled, Partial, Missing) &amp; variance cells (<code>S5, S6</code>).</td>
            </tr>
            <tr>
              <td><strong>5. Inter-Office Link Sharing Modal</strong></td>
              <td>Grants Viewer, Commenter, or Editor permissions to municipal clerks and provincial examiners.</td>
              <td>Modal dialog (<code>Share 'Erpt spreadsheet'</code>), role dropdown, copy link (<code>S7</code>).</td>
            </tr>
            <tr>
              <td><strong>6. App Menus &amp; Version History</strong></td>
              <td>Provides file export, print settings, security controls, and chronological edit history for audit trails.</td>
              <td>Tagalog/English top menu bar (<code>File, I-edit, Tingnan...</code>) &amp; overlays (<code>S8</code>).</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 3: SECTION A.2 — TARGET AUDIENCE & PWD PERSONAS ==================== -->
<div class="slide-frame">
  {figma_top_bar(3, "Target_Users_with_Disabilities_Personas", "SECTION A: TARGET USERS (PWD)", "#38BDF8")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>A.2 Target Audience &amp; Potential Users (Focus on People with Disabilities)</h1>
        <p>Grounded in Republic Act No. 7277 (Magna Carta for Disabled Persons) and Pasacao LGU Field Personas</p>
      </div>
      <span class="hdr-badge">5 Core Disability Profiles Audited</span>
    </div>

    <table class="slide-tbl" style="flex:1;">
      <thead>
        <tr>
          <th style="width:19%;">Persona &amp; Municipal Role</th>
          <th style="width:22%;">Disability / Functional Limitation</th>
          <th style="width:23%;">Primary Tasks in RPT Web System</th>
          <th style="width:20%;">Spreadsheet Barriers Encountered</th>
          <th style="width:16%;">Key WCAG 2.2 Criteria</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Ramon S. Alcantara (Age 52)</strong><br><span style="color:#475569;">Municipal Assessor &amp; Senior Reviewer</span></td>
          <td><span class="pill pill-maj">Low Vision / Presbyopia</span><br>Age-related contrast sensitivity loss; relies on <strong>200%&ndash;400% browser zoom</strong>.</td>
          <td>Inspects 15-column assessment rolls, verifies Market vs. Assessed values, and approves FAAS declarations.</td>
          <td>2D horizontal scrolling clips columns I&ndash;O; muted 2.2:1 toolbar hints and 1.3:1 borders disappear.</td>
          <td><strong>1.4.3</strong> Contrast (4.5:1)<br><strong>1.4.4</strong> Resize Text<br><strong>1.4.10</strong> Reflow (400%)</td>
        </tr>
        <tr>
          <td><strong>2. Danilo S. Perez (Age 49)</strong><br><span style="color:#475569;">Property Taxpayer &amp; Revenue Clerk</span></td>
          <td><span class="pill pill-maj">Color Vision Deficiency</span><br>Red-green color blindness (<strong>Deuteranopia / Protanopia</strong>, ~8% of males).</td>
          <td>Checks payment status (Paid vs. Delinquent vs. Underpaid) and compares revenue chart bars.</td>
          <td>Pastel green (<code>#D9EAD3</code>), yellow (<code>#FFF2CC</code>), and pink (<code>#F4CCCC</code>) status rows look identical in luminance.</td>
          <td><strong>1.4.1</strong> Use of Color<br><strong>1.4.11</strong> Non-text Contrast (3:1)</td>
        </tr>
        <tr>
          <td><strong>3. Liza M. Ba&ntilde;ares (Age 38)</strong><br><span style="color:#475569;">Municipal Assessment Clerk</span></td>
          <td><span class="pill pill-crit">Motor / Dexterity Impairment</span><br>Carpal tunnel syndrome &amp; hand tremors; relies on <strong>keyboard-only navigation</strong>.</td>
          <td>Encodes FAAS records, applies statutory tax formulas across rows, and switches between ledger tabs.</td>
          <td>Tab key traps focus in infinite empty columns; 18&times;18 px icons &amp; 6&times;6 px drag handle cause misclicks.</td>
          <td><strong>2.1.1</strong> Keyboard<br><strong>2.4.1</strong> Bypass Blocks<br><strong>2.5.7</strong> Dragging<br><strong>2.5.8</strong> Target Size</td>
        </tr>
        <tr>
          <td><strong>4. Arturo V. Reyes (Age 34)</strong><br><span style="color:#475569;">PWD Records Verifier</span></td>
          <td><span class="pill pill-crit">Blind / Screen Reader User</span><br>Relies on <strong>NVDA 2024.4 / JAWS</strong> speech output and refreshable Braille display.</td>
          <td>Audits tax declaration entries, checks payment clearance status, and configures Share permissions.</td>
          <td><code>&lt;canvas&gt;</code> grid hides <code>&lt;table&gt;</code> semantics; merged KPI cells read 'B4 blank'; silent formula updates.</td>
          <td><strong>1.1.1</strong> Non-text Content<br><strong>1.3.1</strong> Info &amp; Relations<br><strong>4.1.2</strong> Name/Role/Value<br><strong>4.1.3</strong> Status Messages</td>
        </tr>
        <tr>
          <td><strong>5. Carmen R. Villaluz (Age 42)</strong><br><span style="color:#475569;">Treasury Cashier (Peak Tax Rush)</span></td>
          <td><span class="pill pill-crit">Cognitive / Numeracy Load</span><br>Attention fatigue &amp; dyscalculia risk under high-stress January tax queues.</td>
          <td>Matches Form 56 Official Receipts against Assessment Roll and resolves variance errors.</td>
          <td>Single-digit typo outputs cryptic <code>CORD NOT FOUND</code> / <code>N/A</code>; accidental keystroke overwrites live tax formula.</td>
          <td><strong>3.3.1</strong> Error ID<br><strong>3.3.2</strong> Labels/Hints<br><strong>3.3.3</strong> Error Suggestion<br><strong>3.3.4</strong> Error Prevention</td>
        </tr>
      </tbody>
    </table>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 4: SECTION B — METHODOLOGY & TOOLS ==================== -->
<div class="slide-frame">
  {figma_top_bar(4, "Methodology_Tools_Steps_and_WCAG22", "SECTION B: METHODOLOGY", "#A855F7")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>B. Accessibility Audit Methodology: Tools, Testing Steps &amp; WCAG 2.2 Scope</h1>
        <p>Hybrid manual evaluation + assistive technology inspection across 50 applicable WCAG 2.2 Level A &amp; AA criteria</p>
      </div>
      <span class="hdr-badge">2 Manual Evaluations + 4 Inspection Tools</span>
    </div>

    <div class="grid-2" style="grid-template-columns: 1.05fr 1fr;">
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div class="card" style="flex:1;">
          <h3 style="color:#1E3A8A; margin-bottom:8px;">B.1 Evaluation Tools &amp; Assistive Tech Stack</h3>
          <table class="slide-tbl">
            <thead>
              <tr>
                <th style="width:36%;">Tool / Protocol</th>
                <th style="width:64%;">Diagnostic Role in Audit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Manual Keyboard &amp; Target Walkthrough</strong></td>
                <td>Unplugged mouse to test linear <code>Tab</code>, <code>Shift+Tab</code>, <code>Enter</code>, <code>Escape</code>; measured CSS pixel hit targets against WCAG 2.5.8 (24&times;24 px) &amp; 2.5.7 (Dragging).</td>
              </tr>
              <tr>
                <td><strong>2. NVDA 2024.4 + 400% Zoom Reflow Test</strong></td>
                <td>Audited spoken output on merged KPI cards, canvas tables, mixed Tagalog/English menus, and silent formula updates; tested 320 CSS px (400% zoom) reflow.</td>
              </tr>
              <tr>
                <td><strong>3. Chrome DevTools Accessibility Tree</strong></td>
                <td>Inspected DOM nodes (<code>waffle-grid-container</code>, modal <code>div</code> controls) for ARIA roles/states; simulated Deuteranopia, Protanopia &amp; Blurred Vision.</td>
              </tr>
              <tr>
                <td><strong>4. TPGi CCA &amp; WebAIM Contrast Checker</strong></td>
                <td>Sampled exact foreground/background hex ratios on pastel status cells, toolbar icons, and modal borders against 4.5:1 (1.4.3) and 3:1 (1.4.11).</td>
              </tr>
              <tr>
                <td><strong>5. WAVE &amp; axe DevTools Extensions</strong></td>
                <td>Scanned surrounding application chrome for missing landmarks, unrendered icon ligatures (<code>&#9633;</code>), and form label bindings.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        <div class="card" style="background:#F8FAFC;">
          <h3 style="color:#1E3A8A; margin-bottom:6px;">B.2 Six-Step Structured Audit Procedure</h3>
          <ol style="padding-left:18px; display:flex; flex-direction:column; gap:5px; font-size:12.2px; color:#1E293B;">
            <li><strong>Step 1 (Baseline Setup):</strong> Loaded 8 masked Pasacao tax declarations across <code>Executive Dashboard</code>, <code>Assesment Roll</code>, and <code>Treasurer Collections</code> (S1&ndash;S8).</li>
            <li><strong>Step 2 (Perceivable Audit):</strong> Measured contrast ratios, simulated Deuteranopia/Protanopia, and tested 200%/400% zoom reflow.</li>
            <li><strong>Step 3 (Operable Audit):</strong> Executed keyboard-only parcel encoding, formula copying, tab switching, and modal sharing; measured target sizes.</li>
            <li><strong>Step 4 (Understandable Audit):</strong> Injected a transposition typo (<code>TD-26-0080</code>) and partial payment (&#8369;800 vs. &#8369;864) to test error recovery &amp; formula locks.</li>
            <li><strong>Step 5 (Robust Audit):</strong> Inspected DOM Accessibility Tree and NVDA live region announcements during payment posting.</li>
            <li><strong>Step 6 (Triaging &amp; RPATIS Redesign):</strong> Rated issues (Critical / Major / Minor) and engineered 4 WCAG 2.2 AA UI prototypes (<code>M-01</code>&ndash;<code>M-04</code>).</li>
          </ol>
        </div>

        <div class="card" style="background:#EFF6FF; border-color:#93C5FD;">
          <h3 style="color:#1E3A8A; margin-bottom:4px;">B.3 WCAG 2.2 Sections Referenced (50 Applicable Criteria)</h3>
          <p style="font-size:12px;">
            <strong>&bull; 1. Perceivable (20 Criteria):</strong> 1.1.1 Non-text Content, 1.3.1 Info &amp; Relationships, 1.3.5 Input Purpose, 1.4.1 Use of Color, 1.4.3 Contrast, 1.4.4 Resize Text, 1.4.10 Reflow, 1.4.11 Non-text Contrast.<br>
            <strong>&bull; 2. Operable (17 Criteria):</strong> 2.1.1 Keyboard, 2.4.1 Bypass Blocks, 2.4.3 Focus Order, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured <em>(New in 2.2)</em>, 2.5.7 Dragging <em>(New in 2.2)</em>, 2.5.8 Target Size <em>(New in 2.2)</em>.<br>
            <strong>&bull; 3. Understandable (11 Criteria):</strong> 3.1.2 Language of Parts, 3.3.1 Error ID, 3.3.2 Labels/Instructions, 3.3.3 Error Suggestion, 3.3.4 Error Prevention (Legal/Financial).<br>
            <strong>&bull; 4. Robust (2 Criteria):</strong> 4.1.2 Name, Role, Value, 4.1.3 Status Messages.
          </p>
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 5: SECTION C.1 — PERCEIVABLE AUDIT RESULTS ==================== -->
<div class="slide-frame">
  {figma_top_bar(5, "Audit_Results_Perceivable_P01_P02_P03", "SECTION C.1: PERCEIVABLE AUDIT", "#EF4444")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>C.1 Audit Results — PERCEIVABLE (WCAG Principle 1)</h1>
        <p>Information and UI components must be presentable to users in ways they can perceive (1 Critical, 2 Major Issues)</p>
      </div>
      <span class="hdr-badge" style="background:#FEE2E2; border-color:#DC2626; color:#991B1B;">Baseline Score: 50.0% (10 Passed / 10 Failed)</span>
    </div>

    <div class="grid-3">
      <!-- P-01 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">P-01</span>
            <span class="pill pill-maj">Major Severity</span>
            <span class="pill pill-wcag">WCAG 1.4.1 (A) &amp; 1.4.3 (AA)</span>
          </div>
          <h3>Color-Only Status Encoding &amp; Low-Contrast Pastel Fills</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['P-01']}" alt="Issue P-01 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> Reconciliation rows rely on pastel green (<code>#D9EAD3</code>), yellow (<code>#FFF2CC</code>), and pink (<code>#F4CCCC</code>) fills without icons or status prefixes, while muted toolbar hints drop to <strong>2.2:1&ndash;3.4:1</strong> contrast. Clerks with red-green color blindness (Deuteranopia) or monochrome laser printouts cannot distinguish paid vs. delinquent accounts.
        </div>
      </div>

      <!-- P-02 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">P-02</span>
            <span class="pill pill-crit">Critical Severity</span>
            <span class="pill pill-wcag">WCAG 1.3.1 (A) &amp; 1.1.1 (A)</span>
          </div>
          <h3>Canvas Grid (<code>&lt;canvas&gt;</code>) Obscures Table Semantics &amp; Chart Alt Text</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['P-02']}" alt="Issue P-02 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> The entire sheet renders inside an HTML5 <code>&lt;canvas&gt;</code> element lacking native <code>&lt;table&gt;</code> and <code>&lt;th scope="col"&gt;</code> tags. Merged KPI cards (<code>A4:C5</code>) cause NVDA to announce empty coordinates (<em>"B4 blank, C4 blank"</em>), and floating charts in S2 lack programmatic alt text.
        </div>
      </div>

      <!-- P-03 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">P-03</span>
            <span class="pill pill-maj">Major Severity</span>
            <span class="pill pill-wcag">WCAG 1.4.10 (AA) &amp; 1.4.4 (AA)</span>
          </div>
          <h3>Severe 2D Horizontal Scrolling &amp; Chart Clipping at 100%&ndash;400% Zoom</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['P-03']}" alt="Issue P-03 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> Even at 100% desktop width, columns I&ndash;O of the 15-column Assessment Roll and the right half of Dashboard charts (S2) clip off-screen. At 200%&ndash;400% zoom for low-vision assessors, frozen headers consume 65% of the screen, forcing exhausting 2D scrolling.
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 6: SECTION D.1 — PERCEIVABLE SOLUTIONS (M-01) ==================== -->
<div class="slide-frame">
  {figma_top_bar(6, "Proposed_Solutions_Perceivable_Mockup_M01", "SECTION D.1: PERCEIVABLE SOLUTIONS", "#10B981")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>D.1 Proposed Perceivable Solutions &amp; Improved RPATIS UI Mock-up (M-01)</h1>
        <p>Semantic HTML5 <code>&lt;table&gt;</code> Ledger, Multi-Cue High-Contrast Status Chips, Patterned SVG Charts &amp; 400% Card Reflow</p>
      </div>
      <span class="hdr-badge" style="background:#ECFDF5; border-color:#059669; color:#065F46;">Redesigned Score: 100% (20/20 Criteria Passed)</span>
    </div>

    <div class="sol-layout">
      <div class="sol-mock-card">
        <img src="{imgs['M1']}" alt="Proposed Solution M-01 Perceivable UI Mockup" />
        <div class="sol-mock-cap">Improved UI Mock-up M-01: RPATIS Semantic HTML5 Ledger, Multi-Cue Status Chips (9.8:1+), Patterned SVG Charts &amp; 400% Zoom Reflow</div>
      </div>

      <div class="sol-fixes-col">
        <div class="sol-fix-item">
          <div>
            <h4>Fix for P-01 (WCAG 1.4.1 &amp; 1.4.3): Multi-Cue High-Contrast Status Chips</h4>
            <p>Pair every status state with a distinct geometric icon, explicit text prefix, and 2px border: <code>[&#10003; PAID] Fully Settled</code> (<code>#14532D</code> on <code>#DCFCE7</code>, <strong>9.8:1</strong>), <code>[&#9888; PARTIAL] Underpaid (-&#8369;64.00)</code> (<strong>8.4:1</strong>), and <code>[&#10005; ERROR] Record Missing</code> (<strong>10.2:1</strong>).</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Contrast rises from 3.4:1 to 9.8:1+ (AAA); 100% distinguishable for Deuteranopia &amp; B&amp;W printouts.</div>
        </div>

        <div class="sol-fix-item">
          <div>
            <h4>Fix for P-02 (WCAG 1.3.1 &amp; 1.1.1): Native HTML5 <code>&lt;table&gt;</code> &amp; SVG Chart Alt</h4>
            <p>Replace canvas grids with native <code>&lt;table&gt;</code>, <code>&lt;caption&gt;</code>, <code>&lt;thead&gt;</code>, <code>&lt;th scope="col"&gt;</code>, and <code>&lt;th scope="row"&gt;</code> markup. Encode KPI cards as independent <code>&lt;section aria-labelledby&gt;</code> landmarks and add hatched SVG patterns + tabular summaries to charts.</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: NVDA/JAWS automatically announce column + row headers for every cell; 100% chart text access.</div>
        </div>

        <div class="sol-fix-item">
          <div>
            <h4>Fix for P-03 (WCAG 1.4.10 &amp; 1.4.4): Responsive 400% Zoom Card-Table Reflow</h4>
            <p>Use CSS Grid media queries so at 200%&ndash;400% zoom (320 CSS px width), 15-column assessment rows automatically reflow into single-column vertical property cards with expandable appraisal drawers.</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Eliminates 100% of horizontal scrolling at 400% zoom while keeping TD No., PIN, and Tax Due visible.</div>
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 7: SECTION C.2 — OPERABLE AUDIT RESULTS ==================== -->
<div class="slide-frame">
  {figma_top_bar(7, "Audit_Results_Operable_O01_O02_O03", "SECTION C.2: OPERABLE AUDIT", "#EF4444")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>C.2 Audit Results — OPERABLE (WCAG Principle 2)</h1>
        <p>UI components and navigation must be operable via keyboard and pointer without micro-targets (1 Critical, 2 Major Issues)</p>
      </div>
      <span class="hdr-badge" style="background:#FEE2E2; border-color:#DC2626; color:#991B1B;">Baseline Score: 58.8% (10 Passed / 7 Failed)</span>
    </div>

    <div class="grid-3">
      <!-- O-01 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">O-01</span>
            <span class="pill pill-crit">Critical Severity</span>
            <span class="pill pill-wcag">WCAG 2.1.1 (A), 2.4.1 (A) &amp; 2.4.3 (A)</span>
          </div>
          <h3>Multi-Layer Keyboard Navigation, Endless Blank Tabbing &amp; No Skip Links</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['O-01']}" alt="Issue O-01 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> Moving between the menu bar, toolbar, formula bar, grid, and bottom sheet tabs requires arcane chord shortcuts (<code>Alt+Shift+K</code>). Pressing <code>Tab</code> inside the Assessment Roll moves endlessly into blank columns (I..Z), requiring <strong>42+ keystrokes</strong> per row with no 'Skip to Table' link.
        </div>
      </div>

      <!-- O-02 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">O-02</span>
            <span class="pill pill-maj">Major Severity</span>
            <span class="pill pill-wcag">WCAG 2.5.8 (AA) &amp; 2.5.7 (AA) — New in 2.2</span>
          </div>
          <h3>Undersized Toolbar Controls (&lt;24&times;24 px) &amp; 6&times;6 px Drag-Handle Dependency</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['O-02']}" alt="Issue O-02 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> Formatting icons measure <strong>18&times;18 px</strong> and sheet tab chevrons measure <strong>14&times;14 px</strong> (failing WCAG 2.5.8 24&times;24 px minimum). Copying tax formulas across rows requires dragging a microscopic <strong>6&times;6 px</strong> corner square (failing WCAG 2.5.7 Dragging Movements).
        </div>
      </div>

      <!-- O-03 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">O-03</span>
            <span class="pill pill-maj">Major Severity</span>
            <span class="pill pill-wcag">WCAG 2.4.7 (AA) &amp; 2.4.11 (AA) — New in 2.2</span>
          </div>
          <h3>Low-Salience Focus Rings (1.3:1) in Share Modal &amp; Menu Focus Obscuration</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['O-03']}" alt="Issue O-03 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> In the Share modal (S7), the email input and 'Editor' dropdown have faint <code>#E0E0E0</code> borders (<strong>1.3:1</strong> contrast) and lack a high-contrast 2px focus ring. Cascading File menu overlays (S8) also cover the active grid cell focus indicator (A1) (failing WCAG 2.4.11).
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 8: SECTION D.2 — OPERABLE SOLUTIONS (M-02) ==================== -->
<div class="slide-frame">
  {figma_top_bar(8, "Proposed_Solutions_Operable_Mockup_M02", "SECTION D.2: OPERABLE SOLUTIONS", "#10B981")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>D.2 Proposed Operable Solutions &amp; Improved RPATIS UI Mock-up (M-02)</h1>
        <p>Visible Skip Links, 6-Stop Linear Tab Order, 44&times;44 CSS px Targets, Single-Click Actions &amp; 3px Focus Rings</p>
      </div>
      <span class="hdr-badge" style="background:#ECFDF5; border-color:#059669; color:#065F46;">Redesigned Score: 100% (17/17 Criteria Passed)</span>
    </div>

    <div class="sol-layout">
      <div class="sol-mock-card">
        <img src="{imgs['M2']}" alt="Proposed Solution M-02 Operable UI Mockup" />
        <div class="sol-mock-cap">Improved UI Mock-up M-02: RPATIS Keyboard-First Navigation, 44&times;44 px Controls, Non-Drag Rate Button &amp; Accessible Modal</div>
      </div>

      <div class="sol-fixes-col">
        <div class="sol-fix-item">
          <div>
            <h4>Fix for O-01 (WCAG 2.1.1, 2.4.1 &amp; 2.4.3): Skip Links &amp; 6-Stop Linear Tab Flow</h4>
            <p>Add a high-contrast <code>Skip to Assessment Roll Table [Enter]</code> link as the first Tab stop. Structure the workspace into semantic landmarks so <code>Tab</code> moves strictly across interactive controls in <strong>6 logical stops</strong> without trapping focus in empty cells.</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Reduces keyboard navigation from 42+ keystrokes to 6 predictable Tab stops (-85% keystrokes).</div>
        </div>

        <div class="sol-fix-item">
          <div>
            <h4>Fix for O-02 (WCAG 2.5.8 &amp; 2.5.7): 44&times;44 CSS px Targets &amp; Single-Click Actions</h4>
            <p>Size all buttons, role selectors, and section switcher tabs to a minimum of <strong>44&times;44 CSS pixels</strong> with 8px gap. Replace precision formula dragging with automatic server-side calculation and a single-click <code>Apply Statutory Rates to All Rows</code> button.</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Increases clickable target area by 490% (18&times;18 px &rarr; 44&times;44 px) and eliminates 100% of drag gestures.</div>
        </div>

        <div class="sol-fix-item">
          <div>
            <h4>Fix for O-03 (WCAG 2.4.7, 2.4.11 &amp; 2.4.13): 3px Solid Focus Ring &amp; Modal Focus Trap</h4>
            <p>Enforce a global <code>:focus-visible</code> style (<code>outline: 3px solid #2563EB; outline-offset: 2px; box-shadow: 0 0 0 5px rgba(37,99,235,0.25)</code>) with <strong>8.6:1</strong> contrast, and trap focus cleanly inside active modals without obscuring focused elements.</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Focus indicator contrast improves from 1.3:1 to 8.6:1; zero obscured focus states.</div>
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 9: SECTION C.3 — UNDERSTANDABLE AUDIT RESULTS ==================== -->
<div class="slide-frame">
  {figma_top_bar(9, "Audit_Results_Understandable_U01_U02_U03", "SECTION C.3: UNDERSTANDABLE AUDIT", "#EF4444")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>C.3 Audit Results — UNDERSTANDABLE (WCAG Principle 3)</h1>
        <p>Information and UI operation must be readable, predictable, and prevent/recover from errors (2 Critical, 1 Minor Issue)</p>
      </div>
      <span class="hdr-badge" style="background:#FEE2E2; border-color:#DC2626; color:#991B1B;">Baseline Score: 54.5% (6 Passed / 5 Failed)</span>
    </div>

    <div class="grid-3">
      <!-- U-01 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">U-01</span>
            <span class="pill pill-crit">Critical Severity</span>
            <span class="pill pill-wcag">WCAG 3.3.1 (A) &amp; 3.3.3 (AA)</span>
          </div>
          <h3>Cryptic Lookup Error Tokens (<code>CORD NOT FOUND</code>, <code>N/A</code>) Without Suggestions</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['U-01']}" alt="Issue U-01 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> In Row 14 of Treasurer Collections (S6), a single-digit typo in <code>TD-26-0080</code> (instead of <code>TD-26-0008</code>) outputs truncated <code>CORD NOT FOUND</code> and <code>N/A</code> strings. It fails to explain the cause in plain language or suggest the closest matching Tax Declaration.
        </div>
      </div>

      <!-- U-02 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">U-02</span>
            <span class="pill pill-crit">Critical Severity</span>
            <span class="pill pill-wcag">WCAG 3.3.4 (AA) &amp; 3.3.2 (A)</span>
          </div>
          <h3>Unprotected Statutory Tax Formulas &amp; No Legal/Financial Confirmation</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['U-02']}" alt="Issue U-02 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> Binding RA 7160 valuation formulas (<code>=H4*I4</code>, nested <code>=IF(...)</code>) sit directly inside editable cells without persistent format instructions (e.g., <code>PIN: 041-XX-XXX</code>) or a confirmation step. A single stray keypress silently overwrites the formula with a static number.
        </div>
      </div>

      <!-- U-03 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">U-03</span>
            <span class="pill pill-min">Minor Severity</span>
            <span class="pill pill-wcag">WCAG 3.1.2 (AA) &amp; 3.1.4 (AAA)</span>
          </div>
          <h3>Mixed Tagalog/English UI Chrome &amp; Unexpanded Statutory Abbreviations</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['U-03']}" alt="Issue U-03 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> Top menus render in Tagalog (<code>I-edit, Tingnan, Ipasok, Mga tool, Ibahagi</code>) while ledger tables are in English without part-level <code>lang="tl"</code> tags, causing garbled English screen reader pronunciation. Statutory acronyms (<code>PIN, TD No., SEF</code>) also lack expansions.
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 10: SECTION D.3 — UNDERSTANDABLE SOLUTIONS (M-03) ==================== -->
<div class="slide-frame">
  {figma_top_bar(10, "Proposed_Solutions_Understandable_Mockup_M03", "SECTION D.3: UNDERSTANDABLE SOLUTIONS", "#10B981")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>D.3 Proposed Understandable Solutions &amp; Improved RPATIS UI Mock-up (M-03)</h1>
        <p>1-Click Fuzzy-Match Error Recovery, Guided FAAS Form with Locked Formulas &amp; Two-Step Financial Confirmation</p>
      </div>
      <span class="hdr-badge" style="background:#ECFDF5; border-color:#059669; color:#065F46;">Redesigned Score: 100% (11/11 Criteria Passed)</span>
    </div>

    <div class="sol-layout">
      <div class="sol-mock-card">
        <img src="{imgs['M3']}" alt="Proposed Solution M-03 Understandable UI Mockup" />
        <div class="sol-mock-cap">Improved UI Mock-up M-03: RPATIS Actionable Error Recovery Alert, Guided FAAS Form &amp; Legal/Financial Confirmation Safeguard</div>
      </div>

      <div class="sol-fixes-col">
        <div class="sol-fix-item">
          <div>
            <h4>Fix for U-01 (WCAG 3.3.1 &amp; 3.3.3): Plain-Language Error ID &amp; 1-Click Fuzzy Match</h4>
            <p>Attach a programmatic <code>role="alert"</code> message explaining the exact error (<em>"TD-26-0080 does not exist in the 2026 Pasacao Roll"</em>) and query closest Levenshtein/amount matches to offer a 1-click button: <code>Suggested Match: TD-26-0008 (Ramos, E.) &mdash; [Apply Match]</code>.</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Cuts error recovery time from 10+ minutes of manual cross-checking to a 2-second 1-click fix.</div>
        </div>

        <div class="sol-fix-item">
          <div>
            <h4>Fix for U-02 (WCAG 3.3.2 &amp; 3.3.4): Guided FAAS Form, Locked Formulas &amp; 2-Step Confirm</h4>
            <p>Provide persistent format hints (<code>Format: 041-XX-XXX</code>), lock all statutory calculation fields (<code>readonly</code> server-computed Market Value, Assessed Value, Basic RPT, SEF), and require a 2-step summary confirmation before committing changes.</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Eliminates 100% of accidental formula overwrites and fulfills WCAG 3.3.4 financial safeguards.</div>
        </div>

        <div class="sol-fix-item">
          <div>
            <h4>Fix for U-03 (WCAG 3.1.1, 3.1.2 &amp; 3.1.4): Unified Language &amp; Glossary Tooltips</h4>
            <p>Declare <code>&lt;html lang="en-PH"&gt;</code>, tag any Filipino phrases with <code>lang="tl"</code>, and wrap statutory abbreviations (<code>PIN, TD No., SEF, FAAS</code>) in accessible <code>&lt;abbr title="..."&gt;</code> glossary popovers.</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Ensures 100% accurate TTS pronunciation and makes RPT legal terms self-explanatory.</div>
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 11: SECTION C.4 — ROBUST AUDIT RESULTS ==================== -->
<div class="slide-frame">
  {figma_top_bar(11, "Audit_Results_Robust_R01_R02_R03", "SECTION C.4: ROBUST AUDIT", "#EF4444")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>C.4 Audit Results — ROBUST (WCAG Principle 4)</h1>
        <p>Content must be robust enough to be interpreted reliably by assistive technologies (1 Critical, 2 Major Issues)</p>
      </div>
      <span class="hdr-badge" style="background:#FEE2E2; border-color:#DC2626; color:#991B1B;">Baseline Score: 0.0% (0 Passed / 2 Failed)</span>
    </div>

    <div class="grid-3">
      <!-- R-01 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">R-01</span>
            <span class="pill pill-crit">Critical Severity</span>
            <span class="pill pill-wcag">WCAG 4.1.2 Name, Role, Value (Level A)</span>
          </div>
          <h3>Custom Div Controls &amp; Unrendered Icon Ligatures (<code>&#9633;</code>) Lack ARIA Role/State</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['R-01']}" alt="Issue R-01 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> In the Share modal (S7), the close button (<code>&#9633;</code>), globe icon, <code>Editor &#9633;</code> role selector, and <code>&#9633; Copy link</code> button use custom <code>&lt;div&gt;</code> containers and broken icon ligatures that expose raw missing-glyph boxes (<code>&#9633;</code>) to screen readers and lack native <code>&lt;select&gt;</code> states.
        </div>
      </div>

      <!-- R-02 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">R-02</span>
            <span class="pill pill-maj">Major Severity</span>
            <span class="pill pill-wcag">WCAG 4.1.3 Status Messages (Level AA)</span>
          </div>
          <h3>Silent Formula Recalculations &amp; Variance Updates Lack <code>aria-live</code> Notices</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['R-02']}" alt="Issue R-02 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> When a cashier posts an Official Receipt in Treasurer Collections (S5, S6), dependent cells (<code>TOTAL CASH COLLECTED &#8369;23,480.00</code>, <code>Variance -&#8369;64.00</code>, and Reconciliation Status) recalculate silently without <code>role="status"</code> or <code>aria-live="polite"</code> feedback.
        </div>
      </div>

      <!-- R-03 -->
      <div class="audit-card">
        <div class="audit-card-top">
          <div class="audit-badge-row">
            <span class="issue-id-tag">R-03</span>
            <span class="pill pill-maj">Major Severity</span>
            <span class="pill pill-wcag">WCAG 1.3.5 (AA) &amp; 4.1.2 (A)</span>
          </div>
          <h3>Generic Grid Cell Coordinates (<code>C4</code>, <code>F4</code>) Lack Semantic Input Purpose</h3>
        </div>
        <div class="audit-img-box">
          <img src="{imgs['R-03']}" alt="Issue R-03 Screenshot" />
        </div>
        <div class="audit-impact-box">
          <strong>Why It's a Problem (Impact):</strong> Assessment Roll data entry cells (<code>B4</code> for PIN, <code>C4</code> for Owner Name, <code>F4</code> for Area in sqm) expose only grid coordinates without HTML5 <code>type="number"</code>, <code>inputmode="decimal"</code>, or <code>autocomplete="name"</code> attributes required by assistive tools.
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 12: SECTION D.4 — ROBUST SOLUTIONS (M-04) ==================== -->
<div class="slide-frame">
  {figma_top_bar(12, "Proposed_Solutions_Robust_Mockup_M04", "SECTION D.4: ROBUST SOLUTIONS", "#10B981")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>D.4 Proposed Robust Solutions &amp; Improved RPATIS UI Mock-up (M-04)</h1>
        <p>Native HTML5 Controls, Programmatic <code>aria-live="polite"</code> Sync Toast, Input Purpose Metadata &amp; NVDA Verification</p>
      </div>
      <span class="hdr-badge" style="background:#ECFDF5; border-color:#059669; color:#065F46;">Redesigned Score: 100% (2/2 Criteria Passed)</span>
    </div>

    <div class="sol-layout">
      <div class="sol-mock-card">
        <img src="{imgs['M4']}" alt="Proposed Solution M-04 Robust UI Mockup" />
        <div class="sol-mock-cap">Improved UI Mock-up M-04: RPATIS Semantic HTML5/ARIA Architecture, aria-live Toast &amp; Verified NVDA 2024.4 Speech Log</div>
      </div>

      <div class="sol-fixes-col">
        <div class="sol-fix-item">
          <div>
            <h4>Fix for R-01 (WCAG 4.1.2): Native HTML5 <code>&lt;select&gt;</code> &amp; <code>aria-hidden</code> Icons</h4>
            <p>Replace custom <code>&lt;div&gt;</code> dropdowns and buttons with native <code>&lt;select&gt;</code> and <code>&lt;button type="button"&gt;</code> elements. Render decorative icons as inline SVG with <code>aria-hidden="true"</code> so missing web-font glyphs can never corrupt screen reader speech.</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: 100% valid Name, Role, and State exposure across NVDA, JAWS, VoiceOver, and Voice Control.</div>
        </div>

        <div class="sol-fix-item">
          <div>
            <h4>Fix for R-02 (WCAG 4.1.3): Programmatic <code>role="status" aria-live="polite"</code></h4>
            <p>Embed a dedicated live status region in RPATIS that automatically announces payment postings and Assessor-Treasurer ledger sync events without stealing keyboard focus (e.g., <em>"OR #7712304 posted. TD-26-0006 balance updated to &#8369;0.00"</em>).</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Immediate auditory confirmation of every tax calculation and inter-office sync event.</div>
        </div>

        <div class="sol-fix-item">
          <div>
            <h4>Fix for R-03 (WCAG 1.3.5 &amp; 4.1.2): Explicit Input Purpose &amp; Unit Affixes</h4>
            <p>Bind every form control to a visible <code>&lt;label for="..."&gt;</code> and include HTML5 <code>autocomplete="name"</code>, <code>type="number"</code>, <code>inputmode="decimal"</code>, and programmatic unit labels (<code>sqm</code>, <code>PHP</code>).</p>
          </div>
          <div class="sol-gain-pill">Expected Improvement: Enables mobile numeric keypads, autofill, and cognitive reading aid symbol attachment.</div>
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 13: SECTION E — CONCLUSION, SCORE & REFLECTION ==================== -->
<div class="slide-frame">
  {figma_top_bar(13, "Conclusion_Accessibility_Score_and_Reflection", "SECTION E: CONCLUSION & REFLECTION", "#F59E0B")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>E. Conclusion: Overall Accessibility Score &amp; Inclusive Design Reflection</h1>
        <p>Quantitative WCAG 2.2 Level A &amp; AA Conformance Comparison and Reflections on Inclusive Public-Sector UX</p>
      </div>
      <span class="hdr-badge" style="background:#EFF6FF; border-color:#2563EB; color:#1E3A8A;">52.0% Audited Baseline &rarr; 100.0% RPATIS Redesign</span>
    </div>

    <div class="grid-2" style="grid-template-columns: 1.25fr 1fr; align-items: stretch;">
      <div class="card" style="justify-content: space-between; padding:12px;">
        <h3 style="color:#1E3A8A;">E.1 Quantitative WCAG 2.2 Level A &amp; AA Score Breakdown</h3>
        <div style="text-align:center; background:#F8FAFC; border:1px solid #CBD5E1; border-radius:8px; padding:6px;">
          <img src="{imgs['CHART']}" alt="WCAG 2.2 Conformance Chart" style="width:100%; height:310px; object-fit:contain;" />
        </div>
        <table class="slide-tbl" style="font-size:11.5px;">
          <thead>
            <tr>
              <th>POUR Principle</th>
              <th style="text-align:center;">Applicable</th>
              <th style="text-align:center;">Baseline Pass</th>
              <th style="text-align:center;">Baseline Fail</th>
              <th style="text-align:center;">Baseline Score</th>
              <th style="text-align:center;">RPATIS Redesign</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Perceivable</strong></td>
              <td style="text-align:center;">20</td>
              <td style="text-align:center;">10</td>
              <td style="text-align:center;">10</td>
              <td style="text-align:center; color:#DC2626; font-weight:800;">50.0%</td>
              <td style="text-align:center; color:#059669; font-weight:800;">100.0% (20/20)</td>
            </tr>
            <tr>
              <td><strong>2. Operable</strong></td>
              <td style="text-align:center;">17</td>
              <td style="text-align:center;">10</td>
              <td style="text-align:center;">7</td>
              <td style="text-align:center; color:#D97706; font-weight:800;">58.8%</td>
              <td style="text-align:center; color:#059669; font-weight:800;">100.0% (17/17)</td>
            </tr>
            <tr>
              <td><strong>3. Understandable</strong></td>
              <td style="text-align:center;">11</td>
              <td style="text-align:center;">6</td>
              <td style="text-align:center;">5</td>
              <td style="text-align:center; color:#D97706; font-weight:800;">54.5%</td>
              <td style="text-align:center; color:#059669; font-weight:800;">100.0% (11/11)</td>
            </tr>
            <tr>
              <td><strong>4. Robust</strong></td>
              <td style="text-align:center;">2</td>
              <td style="text-align:center;">0</td>
              <td style="text-align:center;">2</td>
              <td style="text-align:center; color:#DC2626; font-weight:800;">0.0%</td>
              <td style="text-align:center; color:#059669; font-weight:800;">100.0% (2/2)</td>
            </tr>
            <tr style="background:#EFF6FF; font-weight:800;">
              <td><strong>OVERALL SCORE</strong></td>
              <td style="text-align:center;"><strong>50 Applicable</strong></td>
              <td style="text-align:center; color:#1E3A8A;"><strong>26 Passed</strong></td>
              <td style="text-align:center; color:#DC2626;"><strong>24 Failed</strong></td>
              <td style="text-align:center; color:#DC2626; font-size:13px;"><strong>52.0%</strong></td>
              <td style="text-align:center; color:#059669; font-size:13px;"><strong>100.0% (AA)</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="card" style="background:#EFF6FF; border-color:#93C5FD; flex:1;">
          <h3 style="color:#1E3A8A;">E.2 Executive Summary of Audit Findings</h3>
          <p>
            While Google Sheets excels at ad-hoc calculation, deploying it as a Municipal eRPT system creates <strong>12 severe accessibility barriers (5 Critical, 6 Major, 1 Minor)</strong>: an opaque <code>&lt;canvas&gt;</code> grid that strips table semantics (P-02), color-only status rows (P-01), severe 2D scrolling at 400% zoom (P-03), 18&times;18 px icons and 6&times;6 px drag handles (O-02), unprotected legal/financial tax formulas (U-02), cryptic <code>CORD NOT FOUND</code> lookup tokens (U-01), and silent recalculations lacking <code>aria-live</code> notices (R-02).
          </p>
        </div>

        <div class="card" style="background:#ECFDF5; border-color:#6EE7B7; flex:1.3;">
          <h3 style="color:#065F46;">E.3 Reflection on the Importance of Inclusive Design</h3>
          <p style="color:#064E3B; margin-bottom:8px;">
            <strong>1. Accessibility as Public-Sector Equity:</strong> Before this audit, we viewed LGU bottlenecks primarily as database synchronization delays. Auditing through the lens of a 52-year-old assessor with presbyopia, a clerk with carpal tunnel syndrome, or a verifier using NVDA showed that <em>an inaccessible government tool actively excludes citizens and employees with disabilities from public service</em> under <strong>RA 7277</strong> and <strong>UN SDG 16</strong>.
          </p>
          <p style="color:#064E3B;">
            <strong>2. The Curb-Cut Effect in Municipal Workflows:</strong> Every WCAG 2.2 fix we designed for RPATIS benefits the <em>entire</em> municipal workforce: replacing cryptic <code>VLOOKUP</code> errors with 1-click fuzzy-match recovery speeds up every cashier during peak January tax queues, while 44&times;44 px targets and locked statutory formulas eliminate costly clerical mistakes across Pasacao's Assessor and Treasurer offices.
          </p>
        </div>
      </div>
    </div>
  </div>
  {figma_footer()}
</div>

<!-- ==================== SLIDE 14: APPENDIX — COMPLETE 12-ISSUE REMEDIATION MATRIX ==================== -->
<div class="slide-frame">
  {figma_top_bar(14, "Master_WCAG22_Audit_and_Remediation_Matrix", "APPENDIX: MASTER MATRIX", "#38BDF8")}
  <div class="slide-body">
    <div class="slide-hdr">
      <div>
        <h1>Master WCAG 2.2 Audit &amp; RPATIS Remediation Matrix (All 12 Issue Clusters)</h1>
        <p>Complete Traceability from Empirical Audit Evidence to Proposed RPATIS Architectural Fix</p>
      </div>
      <span class="hdr-badge">5 Critical &bull; 6 Major &bull; 1 Minor Resolved</span>
    </div>

    <table class="slide-tbl" style="font-size:11.2px; flex:1;">
      <thead>
        <tr>
          <th style="width:6%;">ID</th>
          <th style="width:10%;">POUR</th>
          <th style="width:8%;">Severity</th>
          <th style="width:17%;">WCAG 2.2 Criteria</th>
          <th style="width:27%;">Audited Problem in Google Sheets eRPT</th>
          <th style="width:32%;">Proposed RPATIS Solution &amp; Expected Gain</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>P-01</strong></td>
          <td>Perceivable</td>
          <td><span class="pill pill-maj">Major</span></td>
          <td>1.4.1 (A), 1.4.3 (AA)</td>
          <td>Pastel green/yellow/pink status rows rely on color alone; muted 2.2:1&ndash;3.4:1 labels.</td>
          <td>Multi-cue status chips (<code>[&#10003; PAID]</code>, <code>[&#9888; PARTIAL]</code>, <code>[&#10005; ERROR]</code>) at 9.8:1+ contrast (M-01).</td>
        </tr>
        <tr>
          <td><strong>P-02</strong></td>
          <td>Perceivable</td>
          <td><span class="pill pill-crit">Critical</span></td>
          <td>1.3.1 (A), 1.1.1 (A)</td>
          <td><code>&lt;canvas&gt;</code> grid hides <code>&lt;table&gt;</code> semantics; merged KPI cells read 'B4 blank'; charts lack alt text.</td>
          <td>Native HTML5 <code>&lt;table&gt;</code> + <code>&lt;th scope="col"&gt;</code>, <code>&lt;section&gt;</code> KPI cards, patterned SVG charts (M-01).</td>
        </tr>
        <tr>
          <td><strong>P-03</strong></td>
          <td>Perceivable</td>
          <td><span class="pill pill-maj">Major</span></td>
          <td>1.4.10 (AA), 1.4.4 (AA)</td>
          <td>15-column Assessment Roll &amp; right-pane charts clip horizontally at 100%&ndash;400% zoom.</td>
          <td>Responsive CSS Grid reflows rows into single-column vertical property cards at 400% zoom (M-01).</td>
        </tr>
        <tr>
          <td><strong>O-01</strong></td>
          <td>Operable</td>
          <td><span class="pill pill-crit">Critical</span></td>
          <td>2.1.1 (A), 2.4.1 (A), 2.4.3 (A)</td>
          <td>Arcane chord shortcuts; pressing Tab moves endlessly across blank columns (42+ keystrokes).</td>
          <td>Visible 'Skip to Assessment Roll' link + 6-stop linear landmark Tab order (M-02).</td>
        </tr>
        <tr>
          <td><strong>O-02</strong></td>
          <td>Operable</td>
          <td><span class="pill pill-maj">Major</span></td>
          <td>2.5.8 (AA), 2.5.7 (AA)</td>
          <td>18&times;18 px toolbar buttons, 14&times;14 px tab chevrons, and 6&times;6 px formula drag handle.</td>
          <td>44&times;44 CSS px buttons (+490% area) + single-click 'Apply Statutory Rates' button (M-02).</td>
        </tr>
        <tr>
          <td><strong>O-03</strong></td>
          <td>Operable</td>
          <td><span class="pill pill-maj">Major</span></td>
          <td>2.4.7 (AA), 2.4.11 (AA)</td>
          <td>Faint 1.3:1 input borders &amp; subtle focus in Share modal; menu overlays obscure active cell focus.</td>
          <td>Global 3px solid <code>#2563EB</code> focus ring (8.6:1 contrast) + clean modal focus management (M-02).</td>
        </tr>
        <tr>
          <td><strong>U-01</strong></td>
          <td>Understandable</td>
          <td><span class="pill pill-crit">Critical</span></td>
          <td>3.3.1 (A), 3.3.3 (AA)</td>
          <td>Typo in <code>TD-26-0080</code> outputs truncated <code>CORD NOT FOUND</code> and <code>N/A</code> with zero guidance.</td>
          <td>Plain-language inline <code>role="alert"</code> + 1-click fuzzy match suggestion for <code>TD-26-0008</code> (M-03).</td>
        </tr>
        <tr>
          <td><strong>U-02</strong></td>
          <td>Understandable</td>
          <td><span class="pill pill-crit">Critical</span></td>
          <td>3.3.4 (AA), 3.3.2 (A)</td>
          <td>Editable statutory formulas (<code>=H4*I4</code>) can be overwritten by one accidental keystroke; no hints.</td>
          <td>Guided FAAS form with persistent format hints, locked read-only formulas &amp; 2-step confirm (M-03).</td>
        </tr>
        <tr>
          <td><strong>U-03</strong></td>
          <td>Understandable</td>
          <td><span class="pill pill-min">Minor</span></td>
          <td>3.1.2 (AA), 3.1.4 (AAA)</td>
          <td>Untagged Tagalog menu bar (<code>I-edit, Tingnan</code>) mixed with English tables; unexpanded acronyms.</td>
          <td>Unified <code>lang="en-PH"</code> / <code>lang="tl"</code> tagging + accessible <code>&lt;abbr&gt;</code> glossary popovers (M-03).</td>
        </tr>
        <tr>
          <td><strong>R-01</strong></td>
          <td>Robust</td>
          <td><span class="pill pill-crit">Critical</span></td>
          <td>4.1.2 (A)</td>
          <td>Custom <code>&lt;div&gt;</code> role dropdown and broken icon ligatures (<code>&#9633;</code>) pollute accessible names.</td>
          <td>Native <code>&lt;select&gt;</code> and <code>&lt;button&gt;</code> controls + <code>aria-hidden="true"</code> inline SVG icons (M-04).</td>
        </tr>
        <tr>
          <td><strong>R-02</strong></td>
          <td>Robust</td>
          <td><span class="pill pill-maj">Major</span></td>
          <td>4.1.3 (AA)</td>
          <td>Dynamic updates to Cash Collected and Variance occur silently without screen reader feedback.</td>
          <td>Programmatic <code>role="status" aria-live="polite"</code> synchronization toast banner (M-04).</td>
        </tr>
        <tr>
          <td><strong>R-03</strong></td>
          <td>Robust</td>
          <td><span class="pill pill-maj">Major</span></td>
          <td>1.3.5 (AA), 4.1.2 (A)</td>
          <td>Grid coordinates (<code>C4, F4</code>) lack semantic input types, autocomplete, and unit bindings.</td>
          <td>Explicit HTML5 <code>type="number"</code>, <code>inputmode="decimal"</code>, <code>autocomplete</code> &amp; unit affixes (M-04).</td>
        </tr>
      </tbody>
    </table>
  </div>
  {figma_footer()}
</div>

{interactive_js}
</body>
</html>
"""
    return html_str


def main():
    # 1. Save print HTML and render 16:9 PDF via Headless Chrome
    print_html_path = os.path.join(SCRATCH_DIR, "figma_slide_deck_print.html")
    with open(print_html_path, "w", encoding="utf-8") as f:
        f.write(build_slides_html(interactive=False))

    pdf_out_path = os.path.join(OUT_DIR, "GRP23_Figma_Slide_Deck_Accessibility_UX_Case_Study.pdf")
    cmd = [
        CHROME_PATH,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_out_path}",
        f"file:///{print_html_path.replace(os.sep, '/')}",
    ]
    subprocess.run(cmd, check=True)

    # 2. Save Interactive Figma Slide Deck HTML in OUT_DIR
    interactive_html_path = os.path.join(OUT_DIR, "GRP23_Figma_Interactive_Slide_Deck.html")
    with open(interactive_html_path, "w", encoding="utf-8") as f:
        f.write(build_slides_html(interactive=True))

    # 3. Render each slide of the PDF as a high-res PNG and build the native 16:9 PPTX Deck
    doc = fitz.open(pdf_out_path)
    print(f"Saved Figma Slide Deck PDF ({len(doc)} slides): {pdf_out_path}")

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=200)
        slide_png = os.path.join(SLIDES_DIR, f"slide_{i+1:02d}.png")
        pix.save(slide_png)

        slide = prs.slides.add_slide(blank_layout)
        slide.shapes.add_picture(slide_png, Inches(0), Inches(0), width=Inches(13.333), height=Inches(7.5))

    doc.close()
    pptx_out_path = os.path.join(OUT_DIR, "GRP23_Figma_Slide_Deck_Accessibility_UX_Case_Study.pptx")
    prs.save(pptx_out_path)
    print(f"Saved Figma Slide Deck PPTX: {pptx_out_path}")
    print(f"Saved Interactive Figma Slide Deck HTML: {interactive_html_path}")


if __name__ == "__main__":
    main()
