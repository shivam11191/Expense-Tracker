# Finora - Smart Expense Analytics

Finora is a **beautifully designed expense analytics application** that helps you
track your daily spending, understand your financial habits, and forecast future
expenses using predictive analytics.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [Running the Application](#running-the-application)
6. [Testing & Development](#testing--development)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features

- **Beautiful UI** – Modern, clean, responsive design built with Flask templates and CSS.
- **Smart Insights** – Dynamic *Financial Health Score* and predictive spending forecasts.
- **Visual Analytics** – Interactive charts that visualise expenses by category.
- **Secure Authentication** – User registration and login powered by Flask‑Login.
- **Quick Entry** – Add, edit, and delete expense records with a streamlined form.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | **Python 3.8+**, **Flask**, **Flask‑SQLAlchemy**, **Flask‑Login** |
| Database | **SQLite** (default, can be swapped for PostgreSQL/MySQL) |
| Analytics | **pandas** for data manipulation and forecasting |
| Front‑end | **HTML5**, **CSS3**, **Jinja2** templates |
| Environment | **python‑dotenv** for configuration |

---

## Project Structure

```
Expense tracker/
│   README.md                # <‑‑ This file (generated)
│   requirements.txt         # Python dependencies
│   .env.example             # Example environment variables
│   .gitignore               # Ignored files/folders
│   config.py                # Application configuration
│   init_db.py               # Database initialisation script
│   run.py                   # Entry point to start the server
│
└───app-src/
    │   README.md            # Original project readme (kept for reference)
    │   ...
    └───app/
        │   __init__.py       # Flask app factory & extensions
        ├───analytics/
        │       analysis.py   # Core expense‑analysis logic (pandas)
        ├───models/
        │       expense.py   # SQLAlchemy model for expenses
        │       user.py      # SQLAlchemy model for users & authentication
        ├───routes/
        │       auth.py      # Registration & login routes
        │       expenses.py  # CRUD for expense records & dashboard
        ├───static/
        │       tidal.css    # Custom stylesheet
        │       js/...       # JavaScript assets (if any)
        └───templates/
                base.html          # Base layout
                home.html          # Landing page
                login.html         # Login form
                register.html      # Registration form
                dashboard.html     # Expense overview & analytics
                add_expense.html   # Form to add new expense
                edit_expense.html  # Form to edit existing expense
```

The **`app/src`** directory contains the actual source code. The top‑level files
are convenience wrappers for running the application and managing the
environment.

---

## Installation & Setup

### Prerequisites

- **Python 3.8+**
- **Git** (to clone the repository)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your‑username/finora.git
   cd finora
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS / Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env if you want to change the SECRET_KEY or DB location
   ```

5. **Initialise the database**
   ```bash
   python init_db.py
   ```

---

## Running the Application

```bash
python run.py
```

The development server will start at **`http://127.0.0.1:5000`**. Open this URL
in your browser, register a new account, and start tracking expenses.

---

## Testing & Development

The project currently does not include a test suite, but you can add one using
`pytest` or Flask’s built‑in testing utilities. A typical workflow would be:

```bash
pytest            # run tests (once they are added)
```

Feel free to extend the repository with unit tests for the models, routes, and
the analytics functions.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Commit your changes with clear messages.
4. Open a pull request describing the changes.

Make sure to run the application locally and verify that no regressions are
introduced.

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for
details.

---
