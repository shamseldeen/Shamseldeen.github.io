# Saudi Pharma Commercial Intelligence — DAX reference

This reference contains the 70 measure expressions extracted from the published project’s PBIX source, including KPI, ranking, label and conditional-formatting measures. Expressions are provided for review; this file does not execute them.

The dataset is synthetic. Read the [case study and interpretation notes](https://shamsinsights.com/saudi-pharma.html) before using the metrics. Targets have month × sales-agent grain; inventory is a single snapshot.

## Net Sales

Table: `_Measures`

```dax
Net Sales =
SUM ( Pharma_Sales[NetSalesExclVATSAR] )
```

## Gross Profit

Table: `_Measures`

```dax
Gross Profit =
SUM ( Pharma_Sales[GrossProfitSAR] )
```

## Gross Margin %

Table: `_Measures`

```dax
Gross Margin % =
DIVIDE ( [Gross Profit], [Net Sales] )
```

## Sales Target

Table: `_Measures`

```dax
Sales Target =
SUM ( Sales_Targets[SalesTargetSAR] )
```

## Target Achievement %

Table: `_Measures`

```dax
Target Achievement % =
DIVIDE ( [Net Sales], [Sales Target] )
```

## Invoice Count

Table: `_Measures`

```dax
Invoice Count =
DISTINCTCOUNT ( Pharma_Sales[InvoiceNumber] )
```

## Units Sold

Table: `_Measures`

```dax
Units Sold =
SUM ( Pharma_Sales[SalesUnits] )
```

## Returned Units

Table: `_Measures`

```dax
Returned Units =
SUM ( Pharma_Sales[ReturnedUnits] )
```

## Return Rate %

Table: `_Measures`

```dax
Return Rate % =
DIVIDE ( [Returned Units], [Units Sold], 0)
```

## Profit per Invoice

Table: `_Measures`

```dax
Profit per Invoice =
DIVIDE ( [Gross Profit], [Invoice Count] )
```

## Data Coverage Label

Table: `_Measures`

```dax
Data Coverage Label =
VAR MaxDataDate =
    CALCULATE (
        MAX ( Pharma_Sales[InvoiceDate] ),
        REMOVEFILTERS ()
    )
VAR SalesLines =
    CALCULATE (
        COUNTROWS ( Pharma_Sales ),
        REMOVEFILTERS ()
    )
RETURN
    "Data through "
        & FORMAT ( MaxDataDate, "dd MMM yyyy" )
        & "  "
        & UNICHAR ( 8226 )
        & "  "
        & FORMAT ( SalesLines, "#,0" )
        & " sales lines"
```

## KPI Target Achievement Color

Table: `_Measures`

```dax
KPI Target Achievement Color =
VAR Achievement =
    [Target Achievement % (Valid Context)]
RETURN
    SWITCH (
        TRUE (),
        ISBLANK ( Achievement ), "#687B74",
        Achievement >= 1, "#198754",
        Achievement >= 0.95, "#C57B13",
        "#C44747"
    )
```

## KPI Return Rate Color

Table: `_Measures`

```dax
KPI Return Rate Color =
VAR Rate =
    [Return Rate %]
RETURN
    SWITCH (
        TRUE (),
        ISBLANK ( Rate ), "#687B74",
        Rate <= 0.0035, "#198754",
        Rate <= 0.005, "#C57B13",
        "#C44747"
    )
```

## Target Context Is Valid

Table: `_Measures`

```dax
Target Context Is Valid =
VAR HasProductFilter =
    ISFILTERED ( 'Linked_Drugs'[CategoryEN] )
        || ISFILTERED ( 'Linked_Drugs'[DrugNameEN] )
        || ISFILTERED ( 'Linked_Drugs'[BrandName] )

VAR HasCustomerFilter =
    ISFILTERED ( 'Customers'[CustomerType] )
        || ISFILTERED ( 'Customers'[CustomerNameEN] )
        || ISFILTERED ( 'Customers'[CustomerID] )

RETURN
    IF (
        HasProductFilter || HasCustomerFilter,
        0,
        1
    )
```

## Sales Target (Valid Context)

Table: `_Measures`

```dax
Sales Target (Valid Context) =
IF (
    [Target Context Is Valid] = 1,
    [Sales Target],
    BLANK ()
)
```

## Target Achievement % (Valid Context)

Table: `_Measures`

```dax
Target Achievement % (Valid Context) =
DIVIDE (
    [Net Sales],
    [Sales Target (Valid Context)]
)
```

## Units per Invoice

Table: `_Measures`

```dax
Units per Invoice =
DIVIDE (
    [Units Sold],
    [Invoice Count]
)
```

## Average Order Value

Table: `_Measures`

```dax
Average Order Value =
DIVIDE (
    [Net Sales],
    [Invoice Count]
)
```

## Discount Amount

Table: `_Measures`

```dax
Discount Amount =
SUM ( Pharma_Sales[DiscountAmountSAR] )
```

## Discount Rate %

Table: `_Measures`

```dax
Discount Rate % =
DIVIDE (
    [Discount Amount],
    [Gross Sales]
)
```

## Gross Sales

Table: `_Measures`

```dax
Gross Sales =
SUM ( Pharma_Sales[GrossSalesSAR] )
```

## Gross-to-Net Value

Table: `_Measures`

```dax
Gross-to-Net Value =
VAR SelectedStep =
    SELECTEDVALUE ( 'Gross-to-Net Steps'[Step] )
RETURN
    SWITCH (
        SelectedStep,
        "Gross Sales", [Gross Sales],
        "Discount", - [Discount Amount],
        "Returns", - [Return Value],
        "Net Sales", [Net Sales],
        BLANK ()
    )
```

## Return Value

Table: `_Measures`

```dax
Return Value =
SUM ( Pharma_Sales[ReturnValueSAR] )
```

## Products Sold

Table: `_Measures`

```dax
Products Sold =
DISTINCTCOUNT ( Pharma_Sales[DrugID] )
```

## Sales per Product

Table: `_Measures`

```dax
Sales per Product =
DIVIDE ( [Net Sales], [Products Sold] )
```

## Units per Product

Table: `_Measures`

```dax
Units per Product =
DIVIDE ( [Units Sold], [Products Sold] )
```

## Product Sales Rank

Table: `_Measures`

```dax
Product Sales Rank =
VAR CurrentProductSales =
    [Net Sales]
VAR ProductsToRank =
    CALCULATETABLE (
        VALUES ( 'Linked_Drugs'[DrugNameEN] ),
        ALLSELECTED ( 'Linked_Drugs' )
    )
RETURN
    RANKX (
        ProductsToRank,
        VAR CandidateProduct =
            'Linked_Drugs'[DrugNameEN]
        RETURN
            CALCULATE (
                [Net Sales],
                ALLSELECTED ( 'Linked_Drugs' ),
                KEEPFILTERS (
                    'Linked_Drugs'[DrugNameEN] = CandidateProduct
                )
            ),
        CurrentProductSales,
        DESC,
        DENSE
    )
```

## Product Sales Share %

Table: `_Measures`

```dax
Product Sales Share % =
VAR SelectedPortfolioSales =
    CALCULATE (
        [Net Sales],
        ALLSELECTED ( 'Linked_Drugs' )
    )
RETURN
    DIVIDE ( [Net Sales], SelectedPortfolioSales )
```

## Customers Served

Table: `_Measures`

```dax
Customers Served =
DISTINCTCOUNT ( Pharma_Sales[CustomerID] )
```

## Sales per Customer

Table: `_Measures`

```dax
Sales per Customer =
DIVIDE (
    [Net Sales],
    [Customers Served]
)
```

## Invoices per Customer

Table: `_Measures`

```dax
Invoices per Customer =
DIVIDE (
    [Invoice Count],
    [Customers Served]
)
```

## Customer Sales Share %

Table: `_Measures`

```dax
Customer Sales Share % =
VAR SelectedCustomerPortfolio =
    CALCULATE (
        [Net Sales],
        REMOVEFILTERS (
            Customers[CustomerID],
            Customers[CustomerNameEN]
        )
    )
RETURN
    DIVIDE (
        [Net Sales],
        SelectedCustomerPortfolio
    )
```

## Customer Sales Rank

Table: `_Measures`

```dax
Customer Sales Rank =
VAR CurrentCustomerSales =
    [Net Sales]
VAR CustomersToRank =
    CALCULATETABLE (
        VALUES ( Customers[CustomerID] ),
        ALLSELECTED ( Customers )
    )
RETURN
    RANKX (
        CustomersToRank,
        VAR CandidateCustomer =
            Customers[CustomerID]
        RETURN
            CALCULATE (
                [Net Sales],
                ALLSELECTED ( Customers ),
                KEEPFILTERS (
                    Customers[CustomerID] = CandidateCustomer
                )
            ),
        CurrentCustomerSales,
        DESC,
        DENSE
    )
```

## Agents With Sales

Table: `_Measures`

```dax
Agents With Sales =
DISTINCTCOUNT ( Pharma_Sales[SalesAgentID] )
```

## Sales per Agent

Table: `_Measures`

```dax
Sales per Agent =
DIVIDE (
    [Net Sales],
    [Agents With Sales]
)
```

## Invoices per Agent

Table: `_Measures`

```dax
Invoices per Agent =
DIVIDE (
    [Invoice Count],
    [Agents With Sales]
)
```

## Target Variance

Table: `_Measures`

```dax
Target Variance =
VAR TargetValue =
    [Sales Target (Valid Context)]
RETURN
    IF (
        NOT ISBLANK ( TargetValue ),
        [Net Sales] - TargetValue
    )
```

## Target Variance %

Table: `_Measures`

```dax
Target Variance % =
DIVIDE (
    [Target Variance],
    [Sales Target (Valid Context)]
)
```

## Agents With Target

Table: `_Measures`

```dax
Agents With Target =
COUNTROWS (
    FILTER (
        VALUES ( Sales_Agents[SalesAgentID] ),
        [Sales Target (Valid Context)] > 0
    )
)
```

## Agents Meeting Target

Table: `_Measures`

```dax
Agents Meeting Target =
COUNTROWS (
    FILTER (
        VALUES ( Sales_Agents[SalesAgentID] ),
        VAR AgentTarget =
            [Sales Target (Valid Context)]
        VAR AgentSales =
            [Net Sales]
        RETURN
            AgentTarget > 0
                && AgentSales >= AgentTarget
    )
)
```

## Agents Below Target

Table: `_Measures`

```dax
Agents Below Target =
[Agents With Target] - [Agents Meeting Target]
```

## Agents by Target Status

Table: `Agent Target Status`

```dax
Agents by Target Status =
VAR SelectedStatus =
    SELECTEDVALUE ( 'Agent Target Status'[Status] )
RETURN
    COUNTROWS (
        FILTER (
            VALUES ( Sales_Agents[SalesAgentID] ),
            VAR AgentTarget =
                [Sales Target (Valid Context)]
            VAR AgentAchievement =
                DIVIDE ( [Net Sales], AgentTarget )
            RETURN
                AgentTarget > 0
                    && SWITCH (
                        TRUE (),
                        SelectedStatus = "Met / Exceeded",
                            AgentAchievement >= 1,
                        SelectedStatus = "Near Target",
                            AgentAchievement >= 0.95
                                && AgentAchievement < 1,
                        SelectedStatus = "At Risk",
                            AgentAchievement >= 0.90
                                && AgentAchievement < 0.95,
                        SelectedStatus = "Critical",
                            AgentAchievement < 0.90,
                        FALSE ()
                    )
        )
    )
```

## Agent Sales Rank

Table: `_Measures`

```dax
Agent Sales Rank =
VAR CurrentAgentSales =
    [Net Sales]
VAR AgentsToRank =
    CALCULATETABLE (
        VALUES ( Sales_Agents[SalesAgentID] ),
        ALLSELECTED ( Sales_Agents )
    )
RETURN
    RANKX (
        AgentsToRank,
        VAR CandidateAgent =
            Sales_Agents[SalesAgentID]
        RETURN
            CALCULATE (
                [Net Sales],
                ALLSELECTED ( Sales_Agents ),
                KEEPFILTERS (
                    Sales_Agents[SalesAgentID] = CandidateAgent
                )
            ),
        CurrentAgentSales,
        DESC,
        DENSE
    )
```

## Agent Sales Share %

Table: `_Measures`

```dax
Agent Sales Share % =
VAR SelectedPortfolioSales =
    CALCULATE (
        [Net Sales],
        REMOVEFILTERS (
            Sales_Agents[SalesAgentID],
            Sales_Agents[SalesAgentNameEN]
        )
    )
RETURN
    DIVIDE (
        [Net Sales],
        SelectedPortfolioSales
    )
```

## Inventoryf

Table: `_Measures`

```dax
Inventoryf =
"Inventory snapshot as of 31 Aug 2026 • 6 warehouses"
```

## Inventory Label

Table: `_Measures`

```dax
Inventory Label =
VAR SnapshotDate =
    CALCULATE (
        MAX ( Inventory[SnapshotDate] ),
        REMOVEFILTERS ()
    )
VAR WarehouseCount =
    CALCULATE (
        DISTINCTCOUNT ( Warehouses[WarehouseID] ),
        REMOVEFILTERS ()
    )
VAR InventoryPositionCount =
    CALCULATE (
        COUNTROWS ( Inventory ),
        REMOVEFILTERS ()
    )
RETURN
    "Inventory snapshot as of "
        & FORMAT ( SnapshotDate, "dd MMM yyyy" )
        & "  "
        & UNICHAR ( 8226 )
        & "  "
        & FORMAT ( WarehouseCount, "#,0" )
        & " warehouses"
        & "  "
        & UNICHAR ( 8226 )
        & "  "
        & FORMAT ( InventoryPositionCount, "#,0" )
        & " warehouse-SKU positions"
```

## Inventory Value

Table: `_Measures`

```dax
Inventory Value =
SUM ( Inventory[InventoryValueSAR] )
```

## Inventory Units

Table: `_Measures`

```dax
Inventory Units =
SUM ( Inventory[StockLevelUnits] )
```

## Daily Demand Units

Table: `_Measures`

```dax
Daily Demand Units =
SUM ( Inventory[AverageDailyDemandUnits] )
```

## Stock Coverage Days

Table: `_Measures`

```dax
Stock Coverage Days =
DIVIDE (
    [Inventory Units],
    [Daily Demand Units]
)
```

## Inventory Positions

Table: `_Measures`

```dax
Inventory Positions =
COUNTROWS ( Inventory )
```

## Replenishment Risk Positions

Table: `_Measures`

```dax
Replenishment Risk Positions =
COUNTROWS (
    FILTER (
        Inventory,
        Inventory[StockLevelUnits]
            < Inventory[ReorderLevelUnits]
    )
)
```

## Reorder Gap Units

Table: `_Measures`

```dax
Reorder Gap Units =
SUMX (
    FILTER (
        Inventory,
        Inventory[StockLevelUnits]
            < Inventory[ReorderLevelUnits]
    ),
    Inventory[ReorderLevelUnits]
        - Inventory[StockLevelUnits]
)
```

## Stockout Positions

Table: `_Measures`

```dax
Stockout Positions =
COALESCE (
    COUNTROWS (
        FILTER (
            Inventory,
            Inventory[StockLevelUnits] = 0
        )
    ),
    0
)
```

## Stockout Rate

Table: `_Measures`

```dax
Stockout Rate =
VAR TotalPositions =
    CALCULATE (
        [Inventory Positions],
        REMOVEFILTERS ( Inventory[StockStatus] )
    )
VAR StockoutCount =
    COALESCE ( [Stockout Positions], 0 )
RETURN
    IF (
        TotalPositions > 0,
        DIVIDE ( StockoutCount, TotalPositions ),
        BLANK ()
    )
```

## Expired Positions

Table: `_Measures`

```dax
Expired Positions =
COUNTROWS (
    FILTER (
        Inventory,
        Inventory[StockLevelUnits] > 0
            && Inventory[DaysToNearestExpiry] < 0
    )
)
```

## Near Expiry Positions 90D

Table: `_Measures`

```dax
Near Expiry Positions 90D =
COUNTROWS (
    FILTER (
        Inventory,
        Inventory[StockLevelUnits] > 0
            && Inventory[DaysToNearestExpiry] >= 0
            && Inventory[DaysToNearestExpiry] <= 90
    )
)
```

## Expiry Risk Positions

Table: `_Measures`

```dax
Expiry Risk Positions =
[Expired Positions] + [Near Expiry Positions 90D]
```

## Expiry Risk Value

Table: `_Measures`

```dax
Expiry Risk Value =
CALCULATE (
    [Inventory Value],
    FILTER (
        Inventory,
        Inventory[StockLevelUnits] > 0
            && Inventory[DaysToNearestExpiry] <= 90
    )
)
```

## Inventory Value Color

Table: `_Measures`

```dax
Inventory Value Color =
"#15231F"
```

## Stock Coverage Color

Table: `_Measures`

```dax
Stock Coverage Color =
VAR CoverageDays = [Stock Coverage Days]
RETURN
    SWITCH (
        TRUE (),
        ISBLANK ( CoverageDays ), "#687B74",
        CoverageDays < 30, "#C44747",
        CoverageDays < 45, "#C57B13",
        CoverageDays <= 75, "#0F8B6D",
        CoverageDays <= 90, "#C57B13",
        "#C44747"
    )
```

## Replenishment Risk Color

Table: `_Measures`

```dax
Replenishment Risk Color =
IF (
    [Replenishment Risk Positions] = 0,
    "#0F8B6D",
    "#C57B13"
)
```

## Stockout Color

Table: `_Measures`

```dax
Stockout Color =
SWITCH (
    TRUE (),
    [Stockout Positions] = 0, "#0F8B6D",
    [Stockout Positions] > 0, "#C44747",
    "#687B74"
)
```

## Expiry Risk Color

Table: `_Measures`

```dax
Expiry Risk Color =
SWITCH (
    TRUE (),
    [Expired Positions] > 0, "#C44747",
    [Near Expiry Positions 90D] > 0, "#C57B13",
    "#0F8B6D"
)
```

## Expired Inventory Value

Table: `_Measures`

```dax
Expired Inventory Value =
CALCULATE (
    [Inventory Value],
    FILTER (
        Inventory,
        Inventory[StockLevelUnits] > 0
            && Inventory[DaysToNearestExpiry] < 0
    )
)
```

## Near Expiry Value 90D

Table: `_Measures`

```dax
Near Expiry Value 90D =
CALCULATE (
    [Inventory Value],
    FILTER (
        Inventory,
        Inventory[StockLevelUnits] > 0
            && Inventory[DaysToNearestExpiry] >= 0
            && Inventory[DaysToNearestExpiry] <= 90
    )
)
```

## Expiry Risk Value %

Table: `_Measures`

```dax
Expiry Risk Value % =
DIVIDE (
    [Expiry Risk Value],
    [Inventory Value]
)
```

## Replenishment Priority Color

Table: `_Measures`

```dax
Replenishment Priority Color =
IF (
    [Stockout Positions] > 0,
    "#C44747",
    "#C57B13"
)
```

## Expired Inventory Value Chart

Table: `_Measures`

```dax
Expired Inventory Value Chart =
VAR ValueToShow =
    COALESCE ( [Expired Inventory Value], 0 )
RETURN
    IF (
        ValueToShow > 0,
        ValueToShow,
        BLANK ()
    )
```

## Near Expiry Value 90D Chart

Table: `_Measures`

```dax
Near Expiry Value 90D Chart =
VAR ValueToShow =
    COALESCE ( [Near Expiry Value 90D], 0 )
RETURN
    IF (
        ValueToShow > 0,
        ValueToShow,
        BLANK ()
    )
```

