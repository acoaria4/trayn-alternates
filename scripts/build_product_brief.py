"""Build the committed Nurture review brief from repository-owned brand assets.

Requires: reportlab, fonttools[woff], pillow. Run from any working directory.
The PDF is a concept review document, not a validated formulation or label.
"""
from pathlib import Path
from io import BytesIO
import re
import xml.etree.ElementTree as ET
from PIL import Image
from xml.sax.saxutils import escape
from fontTools.ttLib import TTFont as SourceFont
from fontTools.pens.reportLabPen import ReportLabPen
from fontTools.svgLib.path import parse_path
from reportlab.pdfgen import canvas
from reportlab.graphics import renderPDF
from reportlab.graphics.shapes import Drawing
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf'
TEMP = ROOT / 'tmp' / 'pdfs' / 'nurture-review'
ASSETS = ROOT / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
TEMP.mkdir(parents=True, exist_ok=True)

for name, source in [
    ('Display', 'cormorant-garamond-latin-400-normal'),
    ('DisplayItalic', 'cormorant-garamond-latin-400-italic'),
    ('Body', 'manrope-latin-400-normal'),
    ('Medium', 'manrope-latin-500-normal'),
    ('Bold', 'manrope-latin-600-normal'),
]:
    font = SourceFont(ASSETS / 'fonts' / f'{source}.woff2')
    font.flavor = None
    destination = TEMP / f'{name}.ttf'
    font.save(destination)
    pdfmetrics.registerFont(TTFont(name, str(destination)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold', italic='Body', boldItalic='Bold')

W, H = A4
M = 44
CW = W - 2 * M
INK = colors.HexColor('#382A22')
MUTED = colors.HexColor('#69594D')
GOLD = colors.HexColor('#80633F')
CHAMPAGNE = colors.HexColor('#B49A68')
RULE = colors.HexColor('#D6C9B7')
IVORY = colors.HexColor('#FAF7F0')
OAT = colors.HexColor('#EEE5D7')
WHITE = colors.HexColor('#FFFDF8')
styles = {
    'body': ParagraphStyle('body', fontName='Body', fontSize=10, leading=14.7, textColor=INK),
    'small': ParagraphStyle('small', fontName='Body', fontSize=8.25, leading=11.8, textColor=MUTED),
    'tiny': ParagraphStyle('tiny', fontName='Body', fontSize=7.5, leading=10.6, textColor=MUTED),
    'label': ParagraphStyle('label', fontName='Bold', fontSize=8, leading=11.5, textColor=MUTED),
    'table': ParagraphStyle('table', fontName='Body', fontSize=9.3, leading=13.4, textColor=INK),
    'tablehead': ParagraphStyle('tablehead', fontName='Bold', fontSize=8.2, leading=11.5, textColor=INK),
    'headerLight': ParagraphStyle('headerLight', fontName='Bold', fontSize=8.2, leading=11.5, textColor=IVORY),
    'question': ParagraphStyle('question', fontName='Body', fontSize=9.5, leading=14, textColor=INK),
    'title': ParagraphStyle('title', fontName='Display', fontSize=33, leading=35, textColor=INK),
    'section': ParagraphStyle('section', fontName='Display', fontSize=21, leading=24, textColor=INK),
}

filename = OUT / 'nurture-food-technologist-review-brief.pdf'
c = canvas.Canvas(str(filename), pagesize=A4, pageCompression=1)
c.setTitle('Nurture - Food Technologist Review Brief')
c.setAuthor('Nurture by TRAYN Nutrition')
c.setCreator('Nurture product development brief')
c.setSubject('Concept evaluation: hot-water and hot-milk protein beverage powder')
c.setKeywords('Nurture, TRAYN Nutrition, food technology, milk protein, whey, concept review')
checks = []

def asset_transform(value):
    # The repository's outlined wordmark uses only translate and scale.
    for operation, raw in re.findall(r'(translate|scale)\(([^)]*)\)', value):
        numbers = [float(number) for number in re.split(r'[,\s]+', raw.strip())]
        if operation == 'translate':
            c.translate(numbers[0], numbers[1] if len(numbers) > 1 else 0)
        else:
            c.scale(numbers[0], numbers[1] if len(numbers) > 1 else numbers[0])

def wordmark(x, y, width):
    svg = ET.parse(ASSETS / 'brand/nurture-wordmark.svg').getroot()
    _, _, source_width, source_height = map(float, svg.attrib['viewBox'].split())
    scale = width / source_width
    c.saveState()
    c.translate(x, y + source_height * scale)
    c.scale(scale, -scale)
    c.setFillColor(INK)
    group = svg.find('{http://www.w3.org/2000/svg}g')
    asset_transform(group.attrib.get('transform', ''))
    for element in group:
        if element.tag.endswith('path'):
            c.saveState()
            asset_transform(element.attrib.get('transform', ''))
            pen = ReportLabPen(None)
            parse_path(element.attrib['d'], pen)
            pen.path.fillColor = INK
            pen.path.strokeColor = None
            drawing = Drawing()
            drawing.add(pen.path)
            renderPDF.draw(drawing, c, 0, 0)
            c.restoreState()
    c.restoreState()

def brand_lockup(x, y, width=162):
    wordmark(x, y, width)
    partner_width = width * .50
    partner = ImageReader(str(ASSETS / 'brand/trayn-endorsement.webp'))
    source_width, source_height = partner.getSize()
    partner_height = partner_width * source_height / source_width
    partner_x = x + (width - partner_width) / 2 + 7
    c.drawImage(partner, partner_x, y - 22, width=partner_width, height=partner_height, mask='auto')
    c.setFont('Body', 7)
    c.setFillColor(MUTED)
    c.drawString(partner_x - 15, y - 15, 'by')

def para(text, y, kind='body', x=M, width=CW, gap=0):
    p = Paragraph(text, styles[kind])
    _, height = p.wrap(width, H)
    p.drawOn(c, x, y - height)
    checks.append((c.getPageNumber(), kind, y - height, height))
    if y - height < 57:
        raise ValueError(f'Content intrudes into footer: page {c.getPageNumber()} {text[:70]}')
    return y - height - gap

def tracking(text, x, y, size=8, spacing=1.1, font='Medium', color=MUTED):
    c.saveState()
    obj = c.beginText(x, y)
    obj.setFont(font, size)
    obj.setCharSpace(spacing)
    obj.setFillColor(color)
    obj.textLine(text)
    c.drawText(obj)
    c.restoreState()

def page_start(number, descriptor):
    c.setFillColor(IVORY)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(CHAMPAGNE)
    c.rect(0, H - 4, W, 4, stroke=0, fill=1)
    brand_lockup(M, H - 49)
    c.setFillColor(GOLD)
    c.setFont('Medium', 8)
    c.drawRightString(W - M, H - 35, 'PRODUCT DEVELOPMENT')
    c.setFillColor(MUTED)
    c.setFont('Body', 7.7)
    c.drawRightString(W - M, H - 52, 'Technical review  |  17 October 2026')
    c.setStrokeColor(RULE)
    c.setLineWidth(.55)
    c.line(M, H - 80, W - M, H - 80)
    c.line(M, 43, W - M, 43)
    c.setFont('Body', 7.2)
    c.setFillColor(MUTED)
    c.drawString(M, 28, 'Concept for independent evaluation. No validated formulation.')
    c.setFillColor(INK)
    c.setFont('Medium', 8)
    c.drawRightString(W - M, 28, f'NURTURE   /   {number:02d}')
    tracking(descriptor, M, H - 103, size=7.8, spacing=1.25, color=GOLD)
    return H - 118

def section(text, y):
    return para(text, y, 'section', gap=9)

def callout(text, y, fill=OAT, padding=12, kind='body', dark=False):
    style = ParagraphStyle('callout', parent=styles[kind], textColor=IVORY if dark else INK)
    p = Paragraph(text, style)
    _, h = p.wrap(CW - padding * 2, H)
    boxh = h + padding * 2
    c.setFillColor(fill)
    c.rect(M, y - boxh, CW, boxh, fill=1, stroke=0)
    c.setFillColor(CHAMPAGNE)
    c.rect(M, y - boxh, 3, boxh, fill=1, stroke=0)
    p.drawOn(c, M + padding, y - padding - h)
    checks.append((c.getPageNumber(), 'callout', y - boxh, boxh))
    if y - boxh < 57:
        raise ValueError('Callout intrudes into footer')
    return y - boxh

def table(rows, y, widths, header=False):
    cells = []
    for i, row in enumerate(rows):
        cells.append([Paragraph(value, styles['headerLight' if header and i == 0 else 'tablehead' if j == 0 else 'table']) for j, value in enumerate(row)])
    t = Table(cells, colWidths=widths, hAlign='LEFT')
    commands = [
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -1), .45, RULE),
        ('BACKGROUND', (0, 0), (-1, -1), WHITE),
        ('BACKGROUND', (0, 0), (0, -1), OAT),
    ]
    if header:
        commands.append(('BACKGROUND', (0, 0), (-1, 0), INK))
    t.setStyle(TableStyle(commands))
    _, height = t.wrap(CW, H)
    t.drawOn(c, M, y - height)
    checks.append((c.getPageNumber(), 'table', y - height, height))
    if y - height < 57:
        raise ValueError(f'Table intrudes into footer: {y-height}')
    return y - height

# PAGE 1: product intent and the exact brief that needs review.
y = page_start(1, '01  /  PRODUCT INTENT')
hero_top = y
left_width = CW - 186
y = para('Hot-cup<br/><font name="DisplayItalic">protein beverage.</font>', y, 'title', width=left_width, gap=12)
y = para('An enjoyable everyday cup, prepared with <b>hot water or hot milk.</b>', y, width=left_width, gap=13)
y = para('Nurture by TRAYN Nutrition is a proposed dairy-based powder with protein and selected micronutrients. The intended occasion is a daily beverage that customers enjoy enough to choose in place of a habitual tea or coffee cup.', y, width=left_width)
image_x = W - M - 164
c.setFillColor(OAT)
c.rect(image_x, hero_top - 218, 164, 218, fill=1, stroke=0)
# The existing 600x800 delivery is 300 dpi at this physical size. JPEG encoding
# keeps the shareable PDF compact; the whole existing concept frame is retained.
image_buffer = BytesIO()
with Image.open(ASSETS / 'product/finish-angle-small.webp') as product_image:
    product_image.convert('RGB').save(image_buffer, format='JPEG', quality=90, optimize=True)
image_buffer.seek(0)
c.drawImage(ImageReader(image_buffer), image_x + 10, hero_top - 200, width=144, height=192)
c.setFillColor(MUTED)
c.setFont('Body', 6.4)
c.drawCentredString(image_x + 82, hero_top - 208, 'Generated packaging concept')
c.drawCentredString(image_x + 82, hero_top - 216, 'Artwork and claims unapproved')
y = min(y, hero_top - 218) - 15
y = callout('<b>Review requested</b><br/>Please assess feasibility, recommend a formulation direction and identify the tests and changes needed before committing to a product specification.', y, INK, dark=True)
y -= 15
y = section('Development parameters', y)
y = table([
    ['Preparation goal', '<b>Both hot water and hot milk.</b> Spoon preparation should be practical in an ordinary kitchen. Validate each liquid separately.'],
    ['Working trial range', 'Explore <b>10-15 g protein supplied by the powder</b> per serving, initially around <b>180-200 mL prepared beverage</b>. These are trial parameters, not an approved dose or claim.'],
    ['Audience for review', 'Founder\'s initial audience: women <b>18-55</b>. Assess broader adult suitability, potentially including 55+. A <b>25-45</b> marketing focus is a hypothesis, not a nutritional cutoff.'],
    ['Sensory goal', 'Aromatic, smooth and lightly creamy; enjoyable through the last sip. Evaluate foam, graininess, drying, aftertaste and sediment. Initial flavour ideas: cocoa-vanilla or cardamom-vanilla.'],
    ['Use and positioning', 'One daily serving is the proposed design basis. Assess plausible multiple-cup use. Caffeine choice is open; this is not a meal-replacement or deficiency-treatment brief.'],
], y, [116, CW - 116])
y -= 17
y = para('<b>Inputs still to confirm:</b> target price per powder serving, serving weight, pack format, manufacturing scale and caffeine position. India is the assumed launch market. Final nutrient doses, preparation instructions and shelf life remain open.', y, 'small')
y = para('Assess dairy-allergen/lactose implications and intended use explicitly. Pregnancy and breastfeeding require a separate formulation assessment.', y - 9, 'small')
c.showPage()

# PAGE 2: formulation direction, comparison set and micronutrient decisions.
y = page_start(2, '02  /  FORMULATION FOR ASSESSMENT')
y = para('Protein system and fortification', y, 'title', gap=12)
y = callout('<b>Proposed first route</b><br/>Evaluate milk protein concentrate (MPC) with added whey, plus a controlled milk-powder contribution for flavour and body. Assess a small fat adjustment only if it improves the complete cup.', y)
y -= 16
y = para('This architecture is open to your recommendation. Ingredient grades, total casein:whey balance, processing and proportions are not fixed. Milk solids and concentrated milk protein are not interchangeable.', y, gap=12)
y = table([
    ['Compare', 'Question to resolve'],
    ['A  Whey-led base', 'Whey with some skim milk powder: can the simpler system meet both preparation and sensory goals?'],
    ['B  MPC + whey', 'A milk-protein/whey system with less skim milk powder: does it improve the balance of hydration, stability and body?'],
    ['C  Creaminess', 'Modify the better base with a small fat contribution: is the benefit worthwhile without excessive richness in milk?'],
], y, [132, CW - 132], header=True)
y -= 12
y = para('Compare at matched protein contribution and similar sweetness. <b>Hydration and hot-cup stability are separate tasks.</b> Research supports investigating casein/whey systems and agglomeration, but does not validate this proposed household use. [1, 2]', y, 'small', gap=16)
y = section('Micronutrients: shortlist, not specification', y)
y = table([
    ['Candidate', 'Evaluation requested'],
    ['B12 + vitamin D', 'Assess nutritional rationale, permitted forms, amounts and retention. No universal deficiency or outcome benefit is assumed.'],
    ['Calcium', 'Count the base and preparation-milk contribution first. Evaluate any addition for nutritional need, taste and physical stability.'],
    ['Iron', 'Make a separate life-stage and formulation decision. Advise whether inclusion is justified in a broad adult product or a more specific direction. [3]'],
], y, [132, CW - 132], header=True)
y -= 13
y = para('<b>Nutrition design:</b> propose a defined powder dose for both liquids where feasible; calculate each prepared cup separately. Assess total intake, other supplements, tolerance, premix uniformity and nutrient retention. Use applicable Indian references and the confirmed FSSAI category. [4, 5]', y, 'small')
c.showPage()

# PAGE 3: concrete review questions and a compact evidence trail.
y = page_start(3, '03  /  YOUR EVALUATION')
y = para('Questions for your review', y, 'title', gap=12)
y = para('Please challenge the assumptions as well as the proposed route. We would value a practical recommendation on the following six decisions.', y, gap=17)

questions = [
    ('Protein and serving', 'Which protein system, ingredient grades, protein contribution and powder serving weight would you recommend? Please explain the tradeoffs.'),
    ('Hot preparation', 'Can both liquids be supported reliably? Specify a feasible mixing method, temperature window, liquid quantities and standing period to validate.'),
    ('Audience and nutrients', 'What adult age/life-stage positioning and micronutrient package are defensible? Assess iron separately and identify any intended-use limitations.'),
    ('Validation and packaging', 'What bench, sensory, analytical, microbiological, nutrient-uniformity, packaging and shelf-life work is needed before launch?'),
    ('Manufacturing and cost', 'What instantisation/process capabilities, supplier data and commercial inputs are needed? Identify the major cost and scale constraints.'),
    ('Proceed, revise or pivot', 'What should change if protein level, dual-liquid performance, taste and price conflict? Identify the decision gates before further investment.'),
]
column_gap = 25
column_width = (CW - column_gap) / 2
for row in range(3):
    row_bottoms = []
    for column in range(2):
        index = row * 2 + column
        title, text = questions[index]
        x = M + column * (column_width + column_gap)
        c.setStrokeColor(RULE)
        c.setLineWidth(.5)
        c.line(x, y + 4, x + column_width, y + 4)
        tracking(f'{index + 1:02d}', x, y - 10, size=8.3, spacing=.2, font='Bold', color=GOLD)
        bottom = para(f'<b>{title}</b><br/>{text}', y - 19, 'question', x=x, width=column_width, gap=14)
        row_bottoms.append(bottom)
    y = min(row_bottoms)

y = callout('<b>Requested response</b><br/>Your preferred route and reasons; changes to the brief; priority risks; an initial prototype and validation plan; and the commercial information needed from us.', y, INK, padding=11, kind='small', dark=True)
y -= 16
y = section('Selected references', y)
refs = [
    ('[1] Singh et al. (2019). Casein/whey UHT stability. Food Research International.', 'https://pubmed.ncbi.nlm.nih.gov/30716885/'),
    ('[2] Seo (2022). Agglomeration of whey-fortified milk powder.', 'https://pubmed.ncbi.nlm.nih.gov/36415577/'),
    ('[3] NIH Office of Dietary Supplements. Iron: life-stage background.', 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/'),
    ('[4] ICMR-NIN. Nutrient requirements and RDA/EAR publications.', 'https://nin.res.in/bookrecommendations.html'),
    ('[5] FSSAI. Category framework (check applicability and current rules).', 'https://www.fssai.gov.in/standards/health-supplements'),
]
for label, url in refs:
    y = para(f'<link href="{escape(url)}" color="#69594D">{escape(label)}</link>', y, 'tiny', gap=4)
y = para('<link href="https://www.fssai.gov.in/food-law/regulations/amendments/advertising-claims" color="#69594D">FSSAI advertising and claims: accompanying regulations and amendments.</link>', y, 'tiny', gap=4)
y = para('References inform the questions; they do not establish a Nurture formula or approval. The wider discussion, source notes and open decisions are preserved in the companion Markdown.', y - 5, 'tiny')
c.showPage()
c.save()

import json
(TEMP / 'layout-checks.json').write_text(json.dumps(checks, indent=2), encoding='utf-8')
print(filename)
print(f'Expected pages: 3; lowest content baseline: {min(row[2] for row in checks):.1f} pt')
