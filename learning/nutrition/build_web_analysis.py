"""Build the bilingual, static Food analysis from the public project sources.

Run the existing reviewed_analysis.py first to refresh results/metrics.json.
Then run this file. It preserves the case-study header and brand assets,
computes descriptive tables, and renders the archived notebook without running it.
No data, code, or account is fetched by the published pages.
"""
import html
import json
import re
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
RESULTS = HERE / "results"
METRICS = json.loads((RESULTS / "metrics.json").read_text())
RAW = pd.read_csv(HERE / "nutrition.csv")
NAMES = {"Calories": "calories", "Protein": "protein", "Carbohydrate": "carb",
         "Total fat": "fat", "Cholesterol": "cholesterol", "Fiber": "fiber",
         "Water": "water", "Alcohol": "alcohol", "Vitamin C": "vitamin_c"}
DATA = RAW[["FDC_ID", "Item", "Category"]].copy()
for source, target in NAMES.items():
    DATA[target] = pd.to_numeric(RAW[source].astype("string").str.extract(
        r"^\s*([-+]?\d+(?:\.\d+)?)", expand=False), errors="coerce")

# Stop instead of publishing tables beside stale headline metrics.
assert len(DATA) == METRICS["rows"]
assert DATA.Category.nunique() == METRICS["categories"]
assert DATA[list(NAMES.values())].isna().sum().to_dict() == METRICS["missing"]
assert np.isclose(DATA[["water", "calories"]].corr().iloc[0, 1],
                  METRICS["waterCaloriesPearsonR"])

FRUITS = DATA[DATA.Category.eq("Fruits and Fruit Juices")].dropna(
    subset=["vitamin_c"]).nlargest(5, "vitamin_c")
assert FRUITS[["Item", "vitamin_c"]].to_dict("records") == METRICS["topFruitVitaminC"]
CATEGORIES = DATA.groupby("Category", sort=True).size().rename("foods").reset_index()
CATEGORIES.to_csv(RESULTS / "category_counts.csv", index=False)
FRUITS[["FDC_ID", "Item", "vitamin_c"]].to_csv(RESULTS / "fruit_vitamin_c.csv", index=False)
GROUPS = [("All foods", DATA), ("Zero-carbohydrate foods", DATA[DATA.carb.eq(0)]),
          ("500 highest-protein foods", DATA.nlargest(500, "protein"))]
GROUP_RESULTS = []
for name, rows in GROUPS:
    GROUP_RESULTS.append({"group": name, "rows": len(rows),
                          "cholesterol_rows": int(rows.cholesterol.notna().sum()),
                          "mean_calories_kcal": float(rows.calories.mean()),
                          "mean_fat_g": float(rows.fat.mean()),
                          "mean_cholesterol_mg": float(rows.cholesterol.mean())})
pd.DataFrame(GROUP_RESULTS).to_csv(RESULTS / "food_group_comparison.csv", index=False)

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11,
                     "axes.spines.top": False, "axes.spines.right": False,
                     "axes.spines.left": False, "axes.edgecolor": "#d7ddd7",
                     "text.color": "#102a43", "axes.labelcolor": "#60706a",
                     "xtick.color": "#60706a", "ytick.color": "#102a43",
                     "svg.hashsalt": "shams-food-study-v1"})


def chart(path, labels, values, xlabel, maximum, colors):
    """Generate exact vector charts; labels remain selectable text."""
    plt.rcParams["svg.fonttype"] = "none"
    fig, ax = plt.subplots(figsize=(10, 4.9), layout="constrained")
    fig.patch.set_facecolor("#fffdf7")
    ax.set_facecolor("#fffdf7")
    y = np.arange(len(values))
    ax.barh(y, values, color=colors, height=.55, zorder=3)
    ax.set_yticks(y, labels)
    ax.invert_yaxis()
    ax.set_xlim(0, maximum)
    ax.set_xlabel(xlabel, labelpad=14)
    ax.tick_params(axis="y", length=0, pad=12)
    ax.grid(axis="x", color="#d7ddd7", alpha=.7, zorder=0)
    for pos, value in zip(y, values):
        ax.text(value + maximum * .015, pos, f"{value:,.2f}" if maximum < 100 else f"{value:,.1f}",
                va="center", fontsize=11, fontweight="bold")
    fig.savefig(path, metadata={"Date": None})
    plt.close(fig)


chart(RESULTS / "fruit-vitamin-c.svg",
      ["Acerola, raw", "Acerola juice, raw", "Guavas, raw",
       "Jujube, fresh, dried*", "Litchis, dried"], FRUITS.vitamin_c.tolist(),
      "Vitamin C (mg per 100 g food)", 2000,
      ["#00766c", "#5b9f93", "#5b9f93", "#5b9f93", "#5b9f93"])
chart(RESULTS / "model-errors.svg",
      ["Macronutrients", "Category\ninteractions", "Alcohol + fiber\ninteractions"],
      [m["test_rmse_kcal"] for m in METRICS["models"]],
      "Test RMSE (kcal per 100 g food) · lower is better", 19,
      ["#6f8c94", "#6f8c94", "#00766c"])


def esc(value):
    return html.escape(str(value), quote=True)


def table(headers, rows, caption=None):
    cap = f"<caption>{esc(caption)}</caption>" if caption else ""
    head = "".join(f'<th scope="col">{esc(h)}</th>' for h in headers)
    body = []
    for row in rows:
        cells = []
        for item in row:
            numeric = ' data-number=""' if re.fullmatch(r"[-\d.,% /]+", str(item)) else ""
            cells.append(f"<td{numeric}>{esc(item)}</td>")
        body.append("<tr>" + "".join(cells) + "</tr>")
    return f'<div class="table-scroll"><table>{cap}<thead><tr>{head}</tr></thead><tbody>{"".join(body)}</tbody></table></div>'


def details(label, body, code=False):
    content = f'<pre class="source-code" tabindex="0"><code>{esc(body)}</code></pre>' if code else f'<div class="study-details-body">{body}</div>'
    return f'<details class="study-details"><summary>{esc(label)}</summary>{content}</details>'


def archive_text(source):
    """Render only the simple, observed markdown subset; never include raw HTML."""
    safe = esc(source)
    safe = re.sub(r"\[([^\]]+)\]\((https?://[^\s)]+)\)",
                  r'<a href="\2" target="_blank" rel="noopener">\1</a>', safe)
    safe = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", safe)
    safe = re.sub(r"`([^`]+)`", r"<code>\1</code>", safe)
    safe = re.sub(r"^#{1,6}\s+(.+)$", r"<h4>\1</h4>", safe, flags=re.M)
    return f'<div class="archive-text" lang="en" dir="ltr">{safe}</div>'


NOTEBOOK = json.loads((HERE / "original_2023_reviewed.ipynb").read_text())
ARCHIVE = []
for index, cell in enumerate(NOTEBOOK["cells"], 1):
    source = "".join(cell.get("source", []))
    label = f'Cell {index:02d} / {len(NOTEBOOK["cells"])} · {cell["cell_type"]}'
    if cell["cell_type"] == "code":
        content = details(label, source, code=True)
    else:
        content = f'<span class="archive-cell-label" dir="ltr">{esc(label)}</span>{archive_text(source)}'
    ARCHIVE.append(f'<div class="archive-cell" data-cell="{index}">{content}</div>')
ARCHIVE_HTML = "".join(ARCHIVE)
SOURCE = (HERE / "reviewed_analysis.py").read_text()
VITAMIN_SOURCE = (HERE / "vitamin_c_analysis.py").read_text()


def build(lang):
    ar = lang == "ar"
    t = lambda en, arabic: arabic if ar else en
    suffix = "-ar" if ar else ""
    filename = f"nutrition-analysis{suffix}.html"
    base = (ROOT / f"nutrition{suffix}.html").read_text()
    # Reuse the current edition's header, language control, fonts and footer.
    head = base.split("</head>", 1)[0]
    title = t("Vitamin C and calorie analysis, results and code | Shams Insights", "تحليل فيتامين C والسعرات والنتائج والكود | شمس إنسايتس")
    desc = t("Read the complete Food study: data cleaning, vitamin C, water and energy, regression results, reproducible Python and the archived 2023 notebook. No sign-in.",
             "اقرأ تحليل الأغذية كاملًا: تنظيف البيانات وفيتامين C والماء والسعرات ونتائج الانحدار وكود Python ودفتر 2023 الأصلي، دون تسجيل دخول.")
    head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', head)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{title}">', head)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{desc}">', head)
    head = head.replace("nutrition-ar.html", "nutrition-analysis-ar.html").replace("nutrition.html", "nutrition-analysis.html")
    if "nutrition-analysis.css" not in head:
        head += '<link rel="stylesheet" href="nutrition-analysis.css?v=food1">'
    header = re.search(r'(<a class="skip-link".*?</header>)', base, re.S).group(1)
    header = header.replace('href="nutrition.html" lang="en"', 'href="nutrition-analysis.html" lang="en"')
    header = header.replace('href="nutrition-ar.html" lang="ar"', 'href="nutrition-analysis-ar.html" lang="ar"')
    footer = base.split("</main>", 1)[1]
    footer = re.sub(r'<script src="learning.js[^>]*></script>', '', footer)
    parts = [head + '</head><body class="food-study">' + header + '<main id="main">']
    parts.append(f'''<section class="learning-hero">
      <a class="study-back" href="nutrition{suffix}.html">{t('← Back to the case study', 'العودة إلى دراسة الحالة ←')}</a>
      <p class="eyebrow">{t('Python · Full analysis · Review September 2026', 'Python · التحليل الكامل · مراجعة سبتمبر 2026')}</p>
      <h1>{t('Vitamin C and calories.', 'فيتامين C والسعرات.')}<br><em>{t('From question to evidence.', 'من السؤال إلى الدليل.')}</em></h1>
      <p class="lead">{t('Which fruit has the most vitamin C? Raw acerola leads the fruit category in this dataset at 1,677.6 mg per 100 g. Explore the ranking, data preparation, water–energy relationship and reviewed calorie models, with Python code beside the results.', 'أي فاكهة أعلى تركيزًا في فيتامين C؟ تتصدر الأسيرولا النيئة فئة الفواكه في هذه البيانات بتركيز 1,677.6 ملغ لكل 100 غرام. استكشف الترتيب وتجهيز البيانات وعلاقة الماء بالطاقة ونماذج السعرات المراجعة، مع كود Python بجوار النتائج.')}</p>
      <p><a class="text-link" href="#vitamin-c">{t('Jump to the vitamin C result and corrected code →', 'انتقل إلى نتيجة فيتامين C والكود المصحح ←')}</a></p>
      <span class="access-badge">{t('Open to everyone · No sign-in', 'متاح للجميع · دون تسجيل دخول')}</span>
      <div class="learning-stats"><div><strong>7,793</strong><span>{t('Food records', 'سجلًا غذائيًا')}</span></div><div><strong>25</strong><span>{t('Food categories', 'فئة غذائية')}</span></div><div><strong>5,334</strong><span>{t('Eligible modeling rows', 'صفًا مؤهلًا للنمذجة')}</span></div><div><strong>1,056</strong><span>{t('Held-out test rows', 'صفًا للاختبار المنفصل')}</span></div></div>
      <nav class="study-contents" aria-label="{t('Analysis chapters', 'فصول التحليل')}">
      {''.join(f'<a href="#{anchor}">{label}</a>' for anchor,label in [('data',t('01 Data','01 البيانات')),('cleaning',t('02 Cleaning','02 التنظيف')),('exploration',t('03 Findings','03 النتائج')),('models',t('04 Models','04 النماذج')),('code',t('05 Python code','05 كود Python')),('original-notebook',t('06 Original notebook','06 الدفتر الأصلي'))])}</nav></section>''')

    parts.append(f'<section class="learning-section" id="data"><div class="section-label">01 / {t("The data", "البيانات")}</div><h2>{t("One food per row. A common 100 g basis.", "غذاء واحد في كل صف، ومقارنة لكل 100 غرام.")}</h2><p class="section-intro">{t("The DataCamp competition dataset was adapted from USDA FoodData Central. Its 12 columns contain a food identifier, description, category and nine nutrient or energy fields. The names below are preserved from the source.", "عُدلت بيانات مسابقة DataCamp من USDA FoodData Central. تضم 12 عمودًا: معرّف الغذاء ووصفه وفئته وتسعة حقول للعناصر الغذائية أو الطاقة. أسماء الأغذية أدناه محفوظة كما وردت في المصدر.")}</p>')
    sample_rows = [[r.Item, r.Category, f'{r.calories:,.1f}', f'{r.water:,.1f}'] for r in DATA.head(5).itertuples()]
    parts.append(table([t("Food", "الغذاء"), t("Category", "الفئة"), t("Energy (kcal)", "الطاقة (كيلو سعر)"), t("Water (g)", "الماء (غرام)")], sample_rows, t("First five source rows · values per 100 g", "أول خمسة صفوف من المصدر · القيم لكل 100 غرام")))
    parts.append(details(t("View all 25 category counts", "عرض أعداد الأغذية في الفئات الـ25"), table([t("Category", "الفئة"), t("Foods", "عدد الأغذية")], CATEGORIES.values.tolist())))
    parts.append(f'<div class="source-downloads"><a href="learning/nutrition/nutrition.csv" download>{t("Download the dataset (CSV)", "تنزيل البيانات (CSV)")}</a><a href="learning/nutrition/results/category_counts.csv" download>{t("Download category counts", "تنزيل أعداد الفئات")}</a></div></section>')

    parts.append(f'<section class="learning-section" id="cleaning"><div class="section-label">02 / {t("Preparation", "التجهيز")}</div><h2>{t("Convert the units. Preserve missingness.", "تحويل الوحدات مع الحفاظ على القيم المفقودة.")}</h2><p class="section-intro">{t("Numeric values are extracted from strings such as 5.88 g and 307.0 kcal. Missing entries remain missing. Each calculation then selects the inputs it actually needs, instead of dropping every row with any missing field.", "تُستخرج القيم الرقمية من نصوص مثل 5.88 g و307.0 kcal. تبقى القيم غير المسجلة مفقودة، وتختار كل عملية الأعمدة التي تحتاجها فقط، بدل حذف أي صف ينقصه أي حقل.")}</p>')
    missing_labels = {"alcohol":t("Alcohol","الكحول"),"fiber":t("Fiber","الألياف"),"vitamin_c":t("Vitamin C","فيتامين C"),"cholesterol":t("Cholesterol","الكوليسترول")}
    missing_rows = [[missing_labels[key], f'{METRICS["missing"][key]:,}', f'{METRICS["missing"][key] / len(DATA) * 100:.1f}%'] for key in missing_labels]
    parts.append(table([t("Field","الحقل"),t("Missing rows","صفوف بقيم مفقودة"),t("Share of all foods","نسبتها من كل الأغذية")],missing_rows))
    parts.append(f'<p class="caption">{t("Calories, protein, carbohydrate, fat and water have no missing values in this extract.", "لا توجد قيم مفقودة للسعرات أو البروتين أو الكربوهيدرات أو الدهون أو الماء في هذه البيانات.")}</p>')
    clean_source = SOURCE[SOURCE.index("    names="):SOURCE.index("    sample=data")]
    parts.append(details(t("Open the actual cleaning code", "افتح كود التنظيف الفعلي"), "\n".join(line[4:] if line.startswith("    ") else line for line in clean_source.splitlines()), True))
    parts.append('</section>')

    parts.append(f'<section class="learning-section" id="exploration"><div class="section-label">03 / {t("Exploration", "الاستكشاف")}</div><h2>{t("What the food records show.", "ماذا تُظهر سجلات الأغذية؟")}</h2><div class="study-feature"><div><h3>{t("More water, lower energy density", "ماء أكثر وكثافة طاقة أقل")}</h3><p>{t("Across 7,793 foods, water and calories have Pearson r = −0.895. This describes a strong negative association within the dataset on a per-100-g basis.", "عبر 7,793 غذاءً، يبلغ معامل ارتباط بيرسون بين الماء والسعرات −0.895. يصف ذلك ارتباطًا عكسيًا قويًا داخل البيانات على أساس 100 غرام.")}</p></div><figure class="study-figure"><img src="learning/nutrition/results/water-calories.png" width="1600" height="928" loading="lazy" alt="{t("Scatter plot: higher water content is associated with lower calories; r minus 0.895", "رسم مبعثر: ترتبط نسبة الماء الأعلى بسعرات أقل؛ معامل الارتباط سالب 0.895")}"><figcaption>{t("All records have water and calorie values. This is an association between food properties.", "تتوفر قيم الماء والسعرات لجميع الصفوف. العلاقة وصفية بين خصائص الأغذية.")}</figcaption></figure></div>')
    parts.append(f'<h3 id="vitamin-c">{t("Which fruits contain the most vitamin C in this dataset?", "أي الفواكه أعلى في فيتامين C ضمن هذه البيانات؟")}</h3><p class="section-intro">{t("Raw acerola ranks highest among records in the Fruits and Fruit Juices category: 1,677.6 mg per 100 g. Fresh foods, juices and dried foods share the same mass basis but are different product forms.", "تأتي الأسيرولا النيئة أولًا ضمن فئة الفواكه وعصائر الفواكه: 1,677.6 ملغ لكل 100 غرام. تتشارك الأغذية الطازجة والعصائر والمجففة أساس الكتلة نفسه، لكنها أشكال غذائية مختلفة.")}</p><figure class="study-figure"><img src="learning/nutrition/results/fruit-vitamin-c.svg" width="1000" height="490" loading="lazy" alt="{t("Top five fruit records by vitamin C, led by raw acerola and acerola juice", "أعلى خمسة سجلات للفواكه في فيتامين C؛ تتصدرها الأسيرولا النيئة وعصيرها")}"><figcaption>{t("*The abbreviated jujube label retains the source wording ‘fresh, dried’. Full source names and exact values appear below.", "*يحتفظ اسم العناب المختصر بوصف المصدر «طازج، مجفف». تظهر أسماء المصدر الكاملة والقيم الدقيقة أدناه.")}</figcaption></figure>')
    parts.append(table([t("Source food name", "اسم الغذاء في المصدر"),t("Vitamin C (mg / 100 g)", "فيتامين C (ملغ / 100 غرام)")], [[r.Item,f'{r.vitamin_c:,.1f}'] for r in FRUITS.itertuples()]))
    parts.append(f'<p>{t("The ranking includes 349 of 355 records in the fruit category; six with missing vitamin C are excluded only from this calculation. The original printed value used integer truncation (1,677). The corrected result preserves the source precision: 1,677.6 mg per 100 g.", "يشمل الترتيب 349 سجلًا من أصل 355 في فئة الفواكه؛ تُستبعد السجلات الست ذات القيمة المفقودة لفيتامين C من هذا الحساب فقط. أسقطت الطباعة الأصلية الجزء العشري وأظهرت 1,677. تحافظ النتيجة المصححة على دقة المصدر: 1,677.6 ملغ لكل 100 غرام.")}</p>')
    parts.append(f'<p class="caption">{t("This is a ranking within this dataset, not a claim about every fruit worldwide. Fresh, juiced and dried products differ; a common mass does not represent a common usual serving or a clinical recommendation.", "هذا ترتيب داخل مجموعة البيانات، ولا يشمل جميع فواكه العالم. تختلف الأغذية الطازجة والعصائر والمجففة؛ توحيد الكتلة لا يعني توحيد الحصة المعتادة ولا يمثل توصية سريرية.")}</p>')
    parts.append(details(t("Open the corrected vitamin C code", "افتح كود فيتامين C المصحح"), VITAMIN_SOURCE, True))
    parts.append(f'<div class="source-downloads"><a href="learning/nutrition/vitamin_c_analysis.py" download>{t("Download vitamin C analysis (Python)", "تنزيل تحليل فيتامين C (Python)")}</a><a href="learning/nutrition/results/fruit_vitamin_c.csv" download>{t("Download fruit ranking (CSV)", "تنزيل ترتيب الفواكه (CSV)")}</a></div>')
    group_labels = [t("All foods", "جميع الأغذية"), t("Zero-carbohydrate foods", "الأغذية ذات الكربوهيدرات الصفرية"), t("500 highest-protein foods", "أعلى 500 غذاء في البروتين")]
    group_rows = [[group_labels[i],f'{r["rows"]:,}',f'{r["mean_calories_kcal"]:.1f}',f'{r["mean_fat_g"]:.1f}',f'{r["mean_cholesterol_mg"]:.1f}',f'{r["cholesterol_rows"]:,}'] for i,r in enumerate(GROUP_RESULTS)]
    group_content = f'<p>{t("This revisits the original notebook’s food-group question. A food with zero recorded carbohydrate is not a complete diet. Means are unweighted across food records; missing cholesterol is excluded from its mean, with its denominator shown.", "تعود هذه المقارنة إلى سؤال المجموعات الغذائية في الدفتر الأصلي. الغذاء الذي سُجلت له كربوهيدرات صفرية لا يمثل نظامًا غذائيًا كاملًا. المتوسطات غير مرجّحة بين السجلات، وتُستبعد قيم الكوليسترول المفقودة من متوسطه مع توضيح عدد القيم المتاحة.")}</p>'
    group_content += table([t("Food group", "المجموعة"),t("Rows", "الصفوف"),t("Mean kcal", "متوسط السعرات"),t("Mean fat (g)", "متوسط الدهون (غ)"),t("Mean cholesterol (mg)", "متوسط الكوليسترول (ملغ)"),t("Cholesterol values", "قيم الكوليسترول المتاحة")],group_rows)
    group_content += f'<p class="caption">{t("All means use a 100 g basis. These groups overlap and are descriptive selections; they cannot establish dietary benefits, harms or disease risk.", "جميع المتوسطات لكل 100 غرام. هذه مجموعات متداخلة واختيارات وصفية؛ لا تثبت فوائد أو أضرار الأنظمة الغذائية أو خطر الإصابة بالأمراض.")}</p><a class="text-link" href="learning/nutrition/results/food_group_comparison.csv" download>{t("Download comparison CSV", "تنزيل المقارنة CSV")}</a>'
    parts.append(details(t("Explore the original food-group question", "استكشف سؤال المجموعات الغذائية الأصلي"),group_content))
    parts.append('</section>')

    parts.append(f'<section class="learning-section" id="models"><div class="section-label">04 / {t("Model comparison", "مقارنة النماذج")}</div><h2>{t("Evaluate each model on the same foods.", "تقييم كل نموذج على الأغذية نفسها.")}</h2><p class="section-intro">{t("The original macronutrient model, fitted without an intercept, gives 4.137 kcal/g for protein, 8.844 for fat and 3.854 for carbohydrate when recalculated on all positive-calorie rows. The review below uses a separate, common evaluation sample.", "يعطي النموذج الأصلي للعناصر الغذائية الكبرى، دون ثابت انحدار، معاملات 4.137 كيلو سعر/غ للبروتين و8.844 للدهون و3.854 للكربوهيدرات عند إعادة حسابه على جميع الصفوف ذات السعرات الموجبة. تستخدم المقارنة التالية عينة تقييم مشتركة منفصلة.")}</p><ol class="study-methods"><li><strong>{t("1. Same eligible rows", "1. الصفوف المؤهلة نفسها")}</strong><p>{t("5,334 foods with positive calories and complete protein, fat, carbohydrate, alcohol and fiber inputs.", "5,334 غذاءً بسعرات موجبة وقيم مكتملة للبروتين والدهون والكربوهيدرات والكحول والألياف.")}</p></li><li><strong>{t("2. Fixed split", "2. تقسيم ثابت")}</strong><p>{t("Seed 42; approximately 20% within each category for testing: 4,278 training and 1,056 test rows.", "بذرة عشوائية 42 ونحو 20% من كل فئة للاختبار: 4,278 صفًا للتدريب و1,056 للاختبار.")}</p></li><li><strong>{t("3. Compare held-out errors", "3. مقارنة أخطاء الاختبار")}</strong><p>{t("Fit on training rows only, then calculate MAE and RMSE on the same test rows for all three specifications.", "تُقدّر المعاملات من صفوف التدريب فقط، ثم يُحسب MAE وRMSE على صفوف الاختبار نفسها للنماذج الثلاثة.")}</p></li></ol>')
    model_labels = [t("Macronutrients","العناصر الغذائية الكبرى"),t("Category interactions","تفاعلات الفئات"),t("Alcohol and fiber interactions","تفاعلات الكحول والألياف")]
    parts.append(f'<figure class="study-figure"><img src="learning/nutrition/results/model-errors.svg" width="1000" height="490" loading="lazy" alt="{t("Test RMSE: baseline 15.38, category interactions 15.71, alcohol and fiber 13.55 kcal per 100 g", "خطأ RMSE في الاختبار: 15.38 للأساسي و15.71 لتفاعلات الفئات و13.55 للكحول والألياف، لكل 100 غرام")}"><figcaption>{t("Category interactions alone slightly worsen RMSE. Alcohol and fiber interactions reduce it on this split.", "تزيد تفاعلات الفئات وحدها RMSE قليلًا، بينما تقلله إضافة تفاعلات الكحول والألياف في هذا التقسيم.")}</figcaption></figure>')
    model_rows = [[model_labels[i],f'{m["test_mae_kcal"]:.2f}',f'{m["test_rmse_kcal"]:.2f}',f'{m["rank"]} / {m["parameters"]}'] for i,m in enumerate(METRICS["models"])]
    parts.append(table([t("Specification","صيغة النموذج"),"MAE (kcal)","RMSE (kcal)",t("Rank / columns","الرتبة / الأعمدة")],model_rows))
    parts.append(f'<p class="caption">{t("MAE is mean absolute error; RMSE is root mean squared error. Both are in kcal per 100 g. Results come from the September 2026 review, not the original submission.", "MAE هو متوسط الخطأ المطلق، وRMSE جذر متوسط مربع الخطأ. كلاهما بكيلو سعر حراري لكل 100 غرام. هذه نتائج مراجعة سبتمبر 2026، وليست نتائج التقديم الأصلي.")}</p><div class="study-note"><strong>{t("How far the result goes", "حدود تفسير النتيجة")}</strong><p>{t("The final design matrix has rank 126 for 150 columns, so individual coefficients are not uniquely identifiable. Related foods may occur in both splits, and complete-case selection can introduce bias. This is an internal exploratory comparison, not validation on a new population or a clinical prediction tool.", "رتبة مصفوفة النموذج الأخير 126 من أصل 150 عمودًا، لذلك لا تتحدد المعاملات الفردية بصورة فريدة. قد توجد أغذية متشابهة في التدريب والاختبار، وقد يتحيز اختيار الحالات المكتملة. هذه مقارنة استكشافية داخلية، وليست تحققًا على مجتمع جديد أو أداة تنبؤ سريرية.")}</p></div><a class="text-link" href="learning/nutrition/results/model_comparison.csv" download>{t("Download exact model results (CSV)", "تنزيل نتائج النماذج الدقيقة (CSV)")}</a></section>')

    parts.append(f'<section class="learning-section" id="code"><div class="section-label">05 / {t("Reproducible Python", "كود Python القابل لإعادة التشغيل")}</div><h2>{t("Read the code behind the results.", "اقرأ الكود الذي أنتج النتائج.")}</h2><p class="section-intro">{t("The complete review script is available below. It uses pandas for preparation, NumPy least squares for the model specifications and Matplotlib for the scatter plot. Code stays in English in both editions.", "يتوفر سكربت المراجعة كاملًا أدناه. يستخدم pandas للتجهيز، والمربعات الصغرى في NumPy للنماذج، وMatplotlib للرسم المبعثر. يبقى الكود بالإنجليزية في النسختين.")}</p>')
    parts.append(details(t("Open the complete review script", "افتح سكربت المراجعة كاملًا"), SOURCE,True))
    commands = 'python -m pip install -r requirements.txt\npython reviewed_analysis.py --data nutrition.csv --output results\npython build_web_analysis.py'
    parts.append(details(t("Run the analysis locally", "تشغيل التحليل محليًا"), f'<p>{t("Clone the repository and run these commands from learning/nutrition. The last command rebuilds the web tables, additional charts and both full-analysis pages.", "انسخ المستودع وشغّل هذه الأوامر من مجلد learning/nutrition. يعيد الأمر الأخير بناء جداول الويب والرسوم الإضافية وصفحتي التحليل الكامل.")}</p><pre tabindex="0"><code>{esc(commands)}</code></pre>'))
    parts.append(f'<div class="source-downloads"><a href="learning/nutrition/reviewed_analysis.py" download>{t("Review script (.py)", "سكربت المراجعة (.py)")}</a><a href="learning/nutrition/build_web_analysis.py" download>{t("Web tables and chart code (.py)", "كود جداول الويب والرسوم (.py)")}</a><a href="learning/nutrition/requirements.txt" download>{t("Python requirements", "متطلبات Python")}</a><a href="https://github.com/shamseldeen/Shamseldeen.github.io/tree/main/learning/nutrition" target="_blank" rel="noopener">GitHub ↗</a></div></section>')

    parts.append(f'<section class="learning-section" id="original-notebook"><div class="section-label">06 / {t("The original work", "العمل الأصلي")}</div><h2>{t("Read the archived 2023 notebook.", "اقرأ دفتر 2023 المؤرشف.")}</h2><p class="section-intro">{t("All 99 cells in the public archive are preserved below, in their original English. This archive retains the historical code, removes stored outputs and revises one unsupported health-outcome statement. It has not been rerun; the results above belong to the separate 2026 review.", "تظهر أدناه جميع خلايا الأرشيف العام البالغ عددها 99 خلية بلغتها الإنجليزية الأصلية. يحتفظ الأرشيف بالكود التاريخي، مع حذف المخرجات المحفوظة وتعديل عبارة واحدة غير مدعومة عن النتائج الصحية. لم يُعَد تشغيل هذا الدفتر؛ النتائج أعلاه تخص مراجعة 2026 المنفصلة.")}</p><p class="caption">{t("The original zero-filling, in-sample comparisons and hypothetical prediction grids are historical learning steps. The reviewed approach and its limits are explained above.", "تعويض القيم المفقودة بصفر ومقارنات التدريب وشبكات التنبؤ الافتراضية خطوات تعلّم تاريخية. شُرحت المنهجية المُراجعة وحدودها أعلاه.")}</p>')
    parts.append(details(t("Read all 99 archived cells · English", "قراءة جميع الخلايا المؤرشفة الـ99 · بالإنجليزية"), ARCHIVE_HTML))
    parts.append(f'<div class="source-downloads"><a href="learning/nutrition/original_2023_reviewed.ipynb" download>{t("Download archived notebook (.ipynb)", "تنزيل الدفتر المؤرشف (.ipynb)")}</a><a href="https://www.datacamp.com/datalab/w/fdca12cd-5848-4e96-a15c-501ce409e1ad" target="_blank" rel="noopener">{t("DataCamp study · updated ↗", "مشروع DataCamp · محدّث ↗")}</a></div><p class="caption">{t("Original publication: 11 December 2023. Data: DataCamp’s “What Foods Are the Most Nutritious?”, adapted from USDA FoodData Central. This was an unjudged learning competition.", "النشر الأصلي: 11 ديسمبر 2023. البيانات: مسابقة DataCamp بعنوان «What Foods Are the Most Nutritious?» والمعدّلة من USDA FoodData Central. كانت مسابقة تعلّم دون تحكيم.")} <a href="https://fdc.nal.usda.gov/download-datasets.html" target="_blank" rel="noopener">USDA FoodData Central ↗</a></p><div class="hero-actions"><a class="button button-primary" href="nutrition{suffix}.html">{t("Back to the case study", "العودة إلى دراسة الحالة")}</a><a class="button button-secondary" href="learning{suffix}.html">{t("Explore the learning record", "استكشف سجل التعلّم")}</a></div></section>')
    parts.append('</main>' + footer)
    (ROOT / filename).write_text("\n".join(parts))


if __name__ == "__main__":
    for language in ("en", "ar"):
        build(language)
    print("Built 2 full-analysis pages, 2 charts and 3 CSV tables from verified sources.")
