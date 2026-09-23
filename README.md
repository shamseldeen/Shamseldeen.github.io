# Shams Insights — Shamseldeen Ismaiil

Portfolio connecting 10+ years in retail pharmacy with hands-on data analytics and business intelligence.

- **Portfolio:** [shamsinsights.com](https://shamsinsights.com/)
- **Flagship case study:** [Saudi Pharma Commercial Intelligence](https://shamsinsights.com/saudi-pharma.html)
- **CV:** [View / download](https://shamsinsights.com/assets/Shamseldeen_Ismaiil_Data_Analyst_CV.pdf)
- **Email:** [shams@shamsinsights.com](mailto:shams@shamsinsights.com)
- **LinkedIn:** [Shamseldeen Ismaiil](https://www.linkedin.com/in/shamseldeen-ismaiil-53186097)

## Flagship project

Saudi Pharma Commercial Intelligence is a six-page Power BI report for a fictional Saudi pharmaceutical distributor. It covers sales, profitability, products, customers, sales-agent targets and inventory risk. All business data is synthetic; there is no employer or patient data.

The case study includes a live report, screenshots and walkthroughs for every page, a user guide (with an Arabic quick-start), model grain and relationships, a metric dictionary, findings, validation and current limitations.

### Verified dataset scope

| Dataset | Rows / count | Grain |
| --- | ---: | --- |
| Sales | 150,000 | Invoice line |
| Distinct invoices | 48,613 | Invoice |
| Targets | 2,592 | Month × sales agent |
| Inventory | 1,080 | Warehouse × SKU at 31 Aug 2026 |
| Products | 180 | Product master; 177 have sales |
| Customers | 1,200 | Customer master; 1,148 have sales |
| Sales agents | 72 | Sales agent |
| Suppliers / warehouses | 40 / 6 | Reference entities |

Sales coverage: **1 Sep 2023–31 Aug 2026**. The source contains **70 DAX measures**, including helper and formatting definitions, and **11 active single-direction relationships**.

### Report pages

1. Executive Overview
2. Sales Performance
3. Products & Categories
4. Customers & Channels
5. Agents & Targets
6. Inventory & Expiry

### Use and interpretation

Load the report from the case-study page, choose an analytical question, select the corresponding page and inspect the relevant filters. On a phone, landscape orientation or the direct full-report link offers more space. The website's Reset report control reloads the embedded report.

For target comparisons, keep the customer **Region** filter at **All**. The customer-geography filter changes sales without reducing the target denominator in the current model. Use period and agent selections or the territory chart for target analysis. Inventory is a single snapshot, and expiry exposure flags the full value of positions based on nearest expiry; it is not a confirmed loss estimate.

## Technical references

- [All 70 DAX definitions](power-bi-measures.md)
- [Project data and checks](project-evidence.json)
- [Published public report](https://app.powerbi.com/view?r=eyJrIjoiYmM0NGQ0MmUtZmJlMi00YWZhLTk5MGMtZTA5YzU3OTdiNGZhIiwidCI6ImUyNTlmZjI5LTQyOTgtNDcyNC1hNGYxLWUwNjJhN2ViY2FiNyJ9&pageName=b666e32ee00e3b344f02)

Stored-data checks include unique grains, relationship-key matching (with extracted key types aligned), and gross-to-net reconciliation. The calculations and selected report interactions were checked; this is not exhaustive verification of all DAX contexts.

## Other portfolio work

- [Pharmacy Enterprise Data Warehouse](https://github.com/shamseldeen/pharmacy-enterprise-data-warehouse) — in development; Bronze ingestion checkpoint shown on the portfolio.
- [Synthetic Pharmacy Data Platform](https://github.com/shamseldeen/pharmacy-chain-data-platform-sql) — supporting work in development.
- [Histopathology Image Exploration](https://github.com/shamseldeen/Ovarian-cancer) — exploratory machine-learning notebook.

## Website implementation

Plain HTML, CSS and JavaScript on GitHub Pages. No build step or framework is required.

| File | Purpose |
| --- | --- |
| `index.html` | Professional introduction, flagship and supporting work, experience and contact |
| `saudi-pharma.html` | Complete flagship case study and interactive report |
| `style.css` | Shared styling and responsive layouts |
| `script.js` | Navigation, on-demand report loading and reset |
| `p00-*.jpg` | Actual screenshots from the published report |
| `power-bi-measures.md` | Extracted DAX reference |
| `project-evidence.json` | Dataset snapshot and validation results |
| `assets/` | Existing CV and project assets |
| `CNAME` | Custom GitHub Pages domain |

The report loads on demand. Screenshots, descriptions and direct links remain available if the embedded report cannot load. Main content stays readable without JavaScript, and navigation supports keyboard use.

## Run locally

```bash
git clone https://github.com/shamseldeen/Shamseldeen.github.io.git
cd Shamseldeen.github.io
python -m http.server 8000
```

Open `http://localhost:8000`. GitHub Pages deploys updates from `main`.

## Updating the case study

When the PBIX or public report changes, refresh its screenshots, metrics, DAX reference and interpretation notes together. Screenshots and the written baseline describe the documented snapshot; the embedded report is hosted separately in Power BI.



## DataCamp learning and applied analysis

The [learning record](https://shamsinsights.com/learning.html) documents 74 completed courses, 7 completed tracks and 25 guided project completion records as of 23 September 2026. The count preserves legacy entries and is not a claim of 25 distinct production projects.

The [food composition case study](https://shamsinsights.com/nutrition.html) documents a December 2023 DataCamp publication and a reproducible 2026 review of 7,793 food records. Source and results: [learning/nutrition](learning/nutrition). Course and track verification links: [learning](learning).


## Arabic and English editions

- [English portfolio](https://shamsinsights.com/) · [البورتفوليو بالعربية](https://shamsinsights.com/index-ar.html)
- [Learning and certificates](https://shamsinsights.com/learning.html) · [رحلة التعلم والشهادات](https://shamsinsights.com/learning-ar.html)
- [Food analysis](https://shamsinsights.com/nutrition.html) · [تحليل الأغذية](https://shamsinsights.com/nutrition-ar.html)
- [Power BI case study](https://shamsinsights.com/saudi-pharma.html) · [دراسة Power BI](https://shamsinsights.com/saudi-pharma-ar.html)

The learning pages contain 11 original certificate images (7 tracks and 4 selected courses), original PDFs, official verification links, a dated learning journey and direct access to the public case studies. All 74 course links and 25 guided completion records remain searchable. Certificate dates follow the official PDFs; course and track statements are distinct from professional certification exams.

Arabic pages translate the narrative, guide, metric definitions and interface. Official course names, source code and the original embedded Power BI report remain in English. The surrounding site works without sign-in; DataCamp exercise pages may require an account or subscription.
