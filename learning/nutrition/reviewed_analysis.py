"""Reproducible 2026 review of Shamseldeen's 2023 DataCamp nutrition study.

Run: python reviewed_analysis.py --data nutrition.csv --output results
The original study used statsmodels. This companion uses NumPy least squares
to make the specifications and common evaluation sample explicit.
"""
import argparse,json
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--data',default='nutrition.csv')
    parser.add_argument('--output',default='results')
    args=parser.parse_args()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    raw=pd.read_csv(args.data)
    names={'Calories':'calories','Protein':'protein','Carbohydrate':'carb','Total fat':'fat','Cholesterol':'cholesterol','Fiber':'fiber','Water':'water','Alcohol':'alcohol','Vitamin C':'vitamin_c'}
    data=raw[['FDC_ID','Item','Category']].copy()
    for src,dst in names.items():
        data[dst]=pd.to_numeric(raw[src].astype('string').str.extract(r'^\s*([-+]?\d+(?:\.\d+)?)',expand=False),errors='coerce')
    # Missing values stay missing; no unverified assumption that missing means zero.
    missing=data[list(names.values())].isna().sum().to_dict()
    sample=data.dropna(subset=['calories','protein','fat','carb','alcohol','fiber']).copy()
    sample=sample.loc[sample.calories>0].reset_index(drop=True)
    # Same rows and deterministic split across all models, stratified by food category.
    rng=np.random.default_rng(42);test_idx=[]
    for _,group in sample.groupby('Category',sort=True):
        ids=group.index.to_numpy();rng.shuffle(ids)
        if len(ids)>=5:test_idx.extend(ids[:max(1,int(len(ids)*.2))])
    test=np.zeros(len(sample),dtype=bool);test[test_idx]=True;train=~test
    categories=pd.get_dummies(sample.Category,dtype=float).to_numpy()
    def matrix(cols,interactions):
        x=sample[cols].to_numpy(dtype=float)
        return np.column_stack([categories]+[categories*x[:,j,None] for j in range(x.shape[1])]) if interactions else x
    specs=[('Macronutrients',['protein','fat','carb'],False),('Category interactions',['protein','fat','carb'],True),('Alcohol and fiber interactions',['protein','fat','carb','alcohol','fiber'],True)]
    metrics=[];y=sample.calories.to_numpy(dtype=float)
    for label,cols,interactions in specs:
        x=matrix(cols,interactions);beta,_,rank,_=np.linalg.lstsq(x[train],y[train],rcond=None)
        pred=x@beta
        err=pred[test]-y[test]
        metrics.append({'model':label,'train_rows':int(train.sum()),'test_rows':int(test.sum()),'parameters':x.shape[1],'rank':int(rank),'test_mae_kcal':float(np.abs(err).mean()),'test_rmse_kcal':float(np.sqrt(np.mean(err**2))),'test_r2':float(1-np.sum(err**2)/np.sum((y[test]-y[test].mean())**2))})
    # Reproduce the saved original baseline using all positive-calorie records.
    baseline=data.loc[data.calories>0].dropna(subset=['protein','fat','carb'])
    coeff=np.linalg.lstsq(baseline[['protein','fat','carb']].to_numpy(dtype=float),baseline.calories.to_numpy(dtype=float),rcond=None)[0]
    correlation=float(data[['water','calories']].corr().iloc[0,1])
    fruits=data[data.Category=='Fruits and Fruit Juices'].dropna(subset=['vitamin_c']).nlargest(5,'vitamin_c')
    result={'reviewDate':'2026-09-23','originalPublicationDate':'2023-12-11','rows':len(raw),'categories':int(raw.Category.nunique()),'completeAllOriginalColumns':int(raw.dropna().shape[0]),'missing':{k:int(v) for k,v in missing.items()},'modelSampleRows':len(sample),'waterCaloriesPearsonR':correlation,'baselineCoefficients':dict(zip(['protein','fat','carb'],map(float,coeff))),'topFruitVitaminC':fruits[['Item','vitamin_c']].to_dict('records'),'models':metrics,'limitations':['A random row split is an internal check, not validation on a new population. Similar products can occur across the split.','Complete-case sampling can be biased; missing alcohol values are common.','Category-interaction models can be rank deficient; least squares provides one minimum-norm solution.','Energy is closely related to nutrient quantities by construction. High R-squared is not clinical evidence.','This descriptive food-composition study cannot infer health outcomes or recommend diets.']}
    (out/'metrics.json').write_text(json.dumps(result,indent=2))
    pd.DataFrame(metrics).to_csv(out/'model_comparison.csv',index=False)
    plt.rcParams.update({'font.family':'DejaVu Sans','axes.spines.top':False,'axes.spines.right':False,'axes.labelcolor':'#10231e','text.color':'#10231e'})
    fig,ax=plt.subplots(figsize=(10,5.8),layout='constrained');fig.patch.set_facecolor('#f6f3eb');ax.set_facecolor('#f6f3eb')
    ax.scatter(data.water,data.calories,s=7,alpha=.18,color='#176b52',edgecolors='none',rasterized=True)
    ax.set(xlabel='Water (g per 100 g food)',ylabel='Energy (kcal per 100 g food)',title='Water content and energy density')
    ax.text(.98,.96,f'7,793 food records · r = {correlation:.2f}',ha='right',va='top',transform=ax.transAxes)
    fig.savefig(out/'water-calories.png',dpi=160);plt.close(fig)
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()
