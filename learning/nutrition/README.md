# Food composition and calorie modeling

Shamseldeen Ismaiil · Python learning study

Original DataCamp publication: 11 December 2023. Portfolio review: 23 September 2026.

- [Case study](https://shamsinsights.com/nutrition.html)
- [Original publication](https://www.datacamp.com/datalab/w/fdca12cd-5848-4e96-a15c-501ce409e1ad)
- [Original code archive](original_2023_reviewed.ipynb)
- [Reproducible review](reviewed_analysis.py)
- [Model comparison](results/model_comparison.csv)

## What the original work demonstrates

The analysis covered 7,793 foods and 25 categories: inspecting data types and missing values, converting nutrient-unit strings to numeric data, grouping and visualizing records, and comparing three exploratory OLS specifications in statsmodels. The notebook extended a macronutrient baseline with category interactions, then alcohol and fiber.

The 98-cell submitted notebook and the later 99-cell workbook contain the same analysis; the later version adds a link to the submission. Original downloaded files are preserved in the personal audit archive. The public notebook preserves the original code, removes bulky stored outputs, and replaces one unsupported health-outcome statement with an association-only explanation. It is historical code and has not been rerun.

## Reproduce the 2026 review

```bash
python -m pip install -r requirements.txt
python reviewed_analysis.py --data nutrition.csv --output results
```

The companion script uses NumPy least squares. It reproduces the saved original baseline coefficients, preserves missingness, and compares three model specifications on identical complete-model-input rows. A deterministic split within category creates 4,278 training and 1,056 test rows from 5,334 eligible foods. Outputs include metrics JSON, comparison CSV and a water-versus-calories plot.

Test RMSE is 15.38 kcal for the baseline, 15.71 for category interactions, and 13.55 for the alcohol/fiber interaction model. Units are kcal per 100 g food. These are new review results, not historical submission results. The full model has rank 126 for 150 design columns, so individual coefficients are not uniquely identifiable.

## Review findings and limitations

The original notebook replaced missing alcohol and other nutrient values with zero. It described the final model as complete-case analysis but passed the earlier zero-filled frame. Its saved errors are in-sample statistics, and its Cartesian prediction grid included nutrient combinations incompatible with 100 g food. These issues are documented rather than presented as validated performance.

The review uses observed rows and a common test split. It is still an internal check: related products may cross the split, complete-case selection can bias results, and food-energy values are related to nutrients by construction. Food composition does not establish clinical outcomes or disease risk. This is an exploratory learning project.

## Data attribution

`nutrition.csv` is the DataCamp competition dataset, modified from USDA FoodData Central: https://fdc.nal.usda.gov/download-datasets.html. Values are per 100 g. The dataset has 7,793 rows and 12 original columns. Dataset and third-party educational material retain their original attribution; no new license is asserted over those materials.
