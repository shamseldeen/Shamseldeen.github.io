"""Reproduce the fruit vitamin C result. Run beside nutrition.csv."""
import pandas as pd

# Reload the source so earlier notebook zero-filling cannot affect this result.
vitamin_c_source = pd.read_csv("nutrition.csv")
vitamin_c_source["Vitamin C_mg"] = pd.to_numeric(
    vitamin_c_source["Vitamin C"].astype("string").str.extract(
        r"^\s*([-+]?\d+(?:\.\d+)?)", expand=False
    ), errors="coerce"
)

# Only missing vitamin C excludes a fruit from this ranking.
df_foodFruit = vitamin_c_source.loc[
    vitamin_c_source["Category"].eq("Fruits and Fruit Juices")
].copy()
fruit_missing = int(df_foodFruit["Vitamin C_mg"].isna().sum())
eligible_fruits = df_foodFruit.dropna(subset=["Vitamin C_mg"])
if eligible_fruits.empty:
    raise ValueError("No fruit records with a reported vitamin C value.")

# Keep every tied maximum and preserve the decimal precision.
ConcVitC = float(eligible_fruits["Vitamin C_mg"].max())
df_foodFruit_HvitC = eligible_fruits.loc[
    eligible_fruits["Vitamin C_mg"].eq(ConcVitC)
]
itemFruitHC = df_foodFruit_HvitC["Item"].tolist()
print(f"Ranked {len(eligible_fruits)} of {len(df_foodFruit)} fruit records; "
      f"excluded {fruit_missing} with missing vitamin C.")
for food_name in itemFruitHC:
    print(f"Highest recorded fruit vitamin C: {food_name} — "
          f"{ConcVitC:,.1f} mg per 100 g.")
print("Scope: Fruits and Fruit Juices in this dataset; product forms vary.")

Top10Fruit = eligible_fruits.nlargest(10, "Vitamin C_mg")
print(Top10Fruit[["Item", "Vitamin C_mg"]].to_string(index=False))
