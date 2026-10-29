# Sweety – Blood Glucose Tracker: Screenshots & Demonstration Guide

This directory holds the visual demonstration artifacts and screenshots of the Sweety application.

---

## 📸 Recommended Screenshots Checklist

1. **`01_registration_page.png`**
   - Shows registration form with branding, Full Name, Email, Password, and Confirm Password fields.
2. **`02_login_page.png`**
   - Shows login form with email, password visibility toggle, and Quick-Fill Demo credentials button.
3. **`03_dashboard_view.png`**
   - Dashboard displaying patient greeting ("Hello, Demo Patient!"), today's date, 2 of 4 readings recorded progress, overview cards, and recent readings.
4. **`04_add_reading_modal.png`**
   - Record blood glucose reading modal with date picker, time slot selector, and mg/dL input.
5. **`05_validation_invalid_value.png`**
   - Clear validation alert: `"Value must be between 40 and 600 mg/dl."` on entering invalid input.
6. **`06_validation_duplicate_slot.png`**
   - Conflict error: `"You already have an After lunch reading for this date."`
7. **`07_readings_table_view.png`**
   - Historical readings page with date-range filter, slot filter, status badges (Normal, Elevated, High), and pagination controls.
8. **`08_edit_reading_form.png`**
   - Pre-populated edit modal allowing adjustment of slot or value.
9. **`09_delete_confirmation.png`**
   - Accessible confirmation dialog: *"Are you sure you want to delete this reading?"*
10. **`10_daily_report.png`**
    - Daily report displaying highest, lowest, average (rounded to 1 decimal), total count, and sorted chronological slot list.
11. **`11_month_to_date_report.png`**
    - Month-to-date calculation from 1st of month through selected date with Recharts trend line.
12. **`12_previous_month_report.png`**
    - Complete previous calendar month report with 30-day statistical aggregates and Recharts glucose curve.
13. **`13_empty_report_state.png`**
    - Friendly empty state when no readings exist (null stats displayed as `--`, count = 0, no NaN or 0 values).
14. **`14_responsive_mobile.png`**
    - Responsive mobile layout with compact card view and mobile menu.

---

## 🎥 2–3 Minute Demonstration Walkthrough Sequence

1. **Authentication (0:00 - 0:30)**:
   - Navigate to `/login`.
   - Click "Fill Demo Credentials" (`demo@sweety.app` / `SweetyDemo123!`).
   - Sign in and land on `/dashboard`. Observe session restoration on page reload.
2. **Add Reading & Validation (0:30 - 1:15)**:
   - Click **Quick Add Reading**.
   - Attempt to submit an empty value -> See `"Please enter a glucose value."`.
   - Enter `30` or `700` -> See `"Value must be between 40 and 600 mg/dl."`.
   - Enter a future date -> See `"Date cannot be in the future."`.
   - Submit a valid reading (e.g. After lunch, 138 mg/dL) -> See immediate success message and dashboard update.
   - Try to add the same slot for today again -> See `"You already have an After lunch reading for this date."`.
3. **Manage Readings (1:15 - 1:45)**:
   - Navigate to `/readings`.
   - Filter by date range or time slot (e.g., "Morning (fasting)").
   - Click **Edit** on a reading, modify the glucose level, and save.
   - Click **Delete** on a reading, view confirmation dialog, and confirm deletion.
4. **Reports & Trend Chart (1:45 - 2:30)**:
   - Navigate to `/reports`.
   - View **Daily Report** with standard chronological slot breakdown.
   - Switch to **Month-to-Date** to see statistical aggregates.
   - Switch to **Previous Month** to inspect the Recharts trend chart with target glucose bounds.
   - Select a date in the past with no logs to demonstrate friendly empty state.
5. **Data Isolation (2:30 - 3:00)**:
   - Log out, register a new account (`alice@example.com`), and verify that none of demo patient's readings or reports are visible.
