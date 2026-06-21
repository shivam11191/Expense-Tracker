from app.analytics.analysis import expense_analysis
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user

from app import db
from app.models.expense import Expense

expenses = Blueprint("expenses", __name__)

# ---------------- HOME ---------------- #
@expenses.route("/home")
def home():

    return render_template("home.html")

# ---------------- DASHBOARD ---------------- #

@expenses.route("/dashboard")
@login_required
def dashboard():

    all_expenses = Expense.query.filter_by(
        user_id=current_user.id
    ).all()

    analytics = expense_analysis(all_expenses)

    return render_template(
        "dashboard.html",
        expenses=all_expenses,
        total=analytics["total"],
        category_data=analytics["category_data"],
        highest_category=analytics["highest_category"],
        health_score=analytics.get("health_score", 100),
        predictive_forecast=analytics.get("predictive_forecast", 0)
    )


# ---------------- ADD EXPENSE ---------------- #

@expenses.route("/add", methods=["GET", "POST"])
@login_required
def add_expense():

    if request.method == "POST":

        title = request.form.get("title")

        amount = request.form.get("amount")

        category = request.form.get("category")

        date = request.form.get("date")

        new_expense = Expense(
            title=title,
            amount=amount,
            category=category,
            date=date,
            user_id=current_user.id
        )

        db.session.add(new_expense)

        db.session.commit()

        flash("Expense added successfully!", "success")

        return redirect(url_for("expenses.dashboard"))

    return render_template("add_expense.html")


# ---------------- EDIT EXPENSE ---------------- #

@expenses.route("/edit/<int:id>", methods=["GET", "POST"])
@login_required
def edit_expense(id):

    expense = Expense.query.get_or_404(id)

    # Ensure users can only edit their own expenses
    if expense.user_id != current_user.id:
        flash("Unauthorized action.", "danger")
        return redirect(url_for("expenses.dashboard"))

    if request.method == "POST":

        expense.title = request.form.get("title")
        expense.amount = request.form.get("amount")
        expense.category = request.form.get("category")
        expense.date = request.form.get("date")

        db.session.commit()

        flash("Expense updated successfully!", "success")

        return redirect(url_for("expenses.dashboard"))

    return render_template("edit_expense.html", expense=expense)


# ---------------- DELETE EXPENSE ---------------- #

@expenses.route("/delete/<int:id>")
@login_required
def delete_expense(id):

    expense = Expense.query.get_or_404(id)

    # Ensure users can only delete their own expenses
    if expense.user_id != current_user.id:
        flash("Unauthorized action.", "danger")
        return redirect(url_for("expenses.dashboard"))

    db.session.delete(expense)

    db.session.commit()

    flash("Expense deleted.", "info")

    return redirect(url_for("expenses.dashboard"))