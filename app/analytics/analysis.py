import pandas as pd
from datetime import datetime

def expense_analysis(expenses):

    if not expenses:
        return {
            "total": 0,
            "category_data": {},
            "highest_category": "None",
            "health_score": 100,
            "predictive_forecast": 0
        }

    data = []

    for expense in expenses:
        data.append({
            "title": expense.title,
            "amount": expense.amount,
            "category": expense.category,
            "date": expense.date
        })

    df = pd.DataFrame(data)

    total_spending = df["amount"].sum()

    category_totals = (
        df.groupby("category")["amount"]
        .sum()
        .to_dict()
    )

    highest_category = max(
        category_totals,
        key=category_totals.get
    )

    # Calculate Financial Health Score
    essential_categories = ["Food", "Bills", "Health", "Education"]
    essential_spending = sum(v for k, v in category_totals.items() if k in essential_categories)
    
    if total_spending > 0:
        essential_ratio = essential_spending / total_spending
        # Base score of 50. High essential ratio pushes score to 100.
        health_score = int(50 + (essential_ratio * 50))
    else:
        health_score = 100

    # Predictive Spending Forecast
    df['date'] = pd.to_datetime(df['date'])
    min_date = df['date'].min()
    max_date = df['date'].max()
    days_elapsed = (max_date - min_date).days + 1
    
    if days_elapsed > 0:
        daily_average = total_spending / days_elapsed
        predictive_forecast = int(daily_average * 30)
    else:
        predictive_forecast = int(total_spending * 30)

    return {
        "total": total_spending,
        "category_data": category_totals,
        "highest_category": highest_category,
        "health_score": health_score,
        "predictive_forecast": predictive_forecast
    }