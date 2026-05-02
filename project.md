# PRD Prompt — Somali Hotels Management System

**Platform:** Google’s IDX (formerly Project IDX) / Firebase Studio
**Stack:** Next.js 14 (App Router) · Supabase (Postgres + Auth + Storage) · Tailwind CSS · shadcn/ui
**Target Market:** Small-to-mid hotels and guesthouses in Somaliland / Somalia

-----

## Project Overview

Build a **lightweight, white-label Hotel Management System** for Somali hotels. The system covers four core pillars: Billing, Staff, Expenses, and Profit. Each hotel customizes it with their name and logo via Settings — which then appear on the dashboard header and printed receipts.

-----

## Tech Stack & Constraints

- **Framework:** Next.js 14 App Router (TypeScript)
- **Database & Auth:** Supabase (Postgres, Row-Level Security, Supabase Auth)
- **Storage:** Supabase Storage (for hotel logos)
- **UI:** Tailwind CSS + shadcn/ui components
- **Currency:** Dual-currency support — Somali Shilling (SOS) and USD
- **Language:** English UI (Somali labels optional in v2)
- **Deployment:** Vercel or Firebase App Hosting
- **Keep it lightweight** — no heavy dependencies, no unnecessary third-party SaaS

-----

## Database Schema (Supabase / Postgres)

```sql
-- Hotel settings (one row per hotel tenant)
hotels (id, name, logo_url, address, phone, currency_primary, created_at)

-- Rooms
rooms (id, hotel_id, room_number, type, floor, price_per_night, status: available|occupied|maintenance)

-- Guests
guests (id, hotel_id, full_name, phone, id_number, nationality, created_at)

-- Bookings / Billing
bookings (id, hotel_id, guest_id, room_id, check_in, check_out, total_amount, currency, status: active|checked_out|cancelled, paid: boolean, created_at)

-- Payments
payments (id, booking_id, hotel_id, amount, currency, method: cash|zaad|evc|golis|edahab|other, method_note, paid_at)
-- method_note: free-text field used when method = 'other' (e.g. "bank transfer", "cheque")

-- Staff
staff (id, hotel_id, full_name, role, phone, salary, salary_currency, joined_at, status: active|inactive)

-- Staff Attendance
attendance (id, staff_id, hotel_id, date, check_in_time, check_out_time, status: present|absent|late)

-- Expenses
expenses (id, hotel_id, category: utilities|maintenance|supplies|staff|other, description, amount, currency, date, added_by)

-- Profit summary (computed or cached)
-- Calculated on-the-fly from: payments - expenses - staff salaries
```

-----

## Pages & Features

### 1. Settings Page `/settings`

- Upload hotel logo (stored in Supabase Storage)
- Set hotel name, address, phone
- Set primary currency (SOS or USD)
- **On save → hotel name + logo appear in the dashboard sidebar/header immediately**

-----

### 2. Dashboard `/dashboard`

- Header: Hotel logo + hotel name (pulled from settings)
- Summary cards:
  - Total Revenue (this month)
  - Total Expenses (this month)
  - Net Profit (this month)
  - Occupied Rooms / Total Rooms
  - Staff Count
- Recent bookings table (last 5)
- Recent expenses (last 5)
- Occupancy rate bar (simple %)

-----

### 3. Billing / Bookings `/billing`

- Table of all bookings with: guest name, room, check-in, check-out, amount, status, paid?
- **New Booking** form: select guest (or create new), select room, pick dates → auto-calculate total
- Mark as paid (choose method: Cash / Zaad / eDahab / Bank)
- Check-out action
- Printable receipt (shows hotel name + logo)
- Filter by: date range, status, paid/unpaid

-----

### 4. Staff Management `/staff`

- Table: name, role, phone, salary, status
- Add / edit / deactivate staff
- Attendance tracker: mark present / absent / late per day
- Monthly attendance summary per staff member
- Salary overview: total monthly payroll

-----

### 5. Expenses `/expenses`

- Add expense: category, description, amount, currency, date
- Expenses table with filters: category, date range
- Monthly total by category (simple breakdown)
- Categories: Utilities, Maintenance, Supplies, Staff Salaries, Other

-----

### 6. Profit Management `/profit`

- Revenue vs Expenses chart (monthly, last 6 months)
- Breakdown:
  - Total Payments Received
  - Total Expenses
  - Staff Payroll
  - **Net Profit = Revenue − Expenses − Payroll**
- Currency toggle (SOS / USD)
- Export to PDF or print (hotel name + logo on report)

-----

### 7. Rooms `/rooms`

- Grid view of rooms with color status: Green = Available, Red = Occupied, Yellow = Maintenance
- Add / edit room: number, type (single/double/suite), floor, price/night
- Change room status manually

-----

### 8. Guests `/guests`

- Guest list with search by name or ID
- Guest profile: bookings history, total spent
- Add guest: name, phone, ID number, nationality

-----

## Auth & Multi-Tenancy

- Supabase Auth (email + password)
- Each hotel is a tenant — hotel_id scoped to the logged-in user
- Row-Level Security (RLS) on all tables: users only see their own hotel’s data
- Single admin role per hotel (v1) — staff roles in v2

-----

## UI / UX Guidelines

- Clean, minimal design — inspired by Apple / Linear aesthetics
- Sidebar navigation (collapsible on mobile)
- Top header: Hotel logo (small, 32px height) + Hotel name
- Responsive — works on tablet and desktop
- shadcn/ui components: Card, Table, Dialog, Form, Badge, Button
- Status badges: color-coded (green/red/yellow)
- All currency values formatted: `$1,200` or `12,000 SOS`

-----

## MVP Scope (Build First)

1. Settings → hotel name + logo
1. Dashboard → summary cards
1. Rooms → status grid
1. Billing → new booking, mark paid, check-out
1. Expenses → add + list
1. Profit → revenue − expenses display
1. Staff → add staff, mark attendance

**Defer to v2:** SMS notifications, Zaad/eDahab API integration, multi-user roles, advanced reports

-----

## File Structure

```
/app
  /dashboard        → page.tsx
  /billing          → page.tsx
  /rooms            → page.tsx
  /staff            → page.tsx
  /expenses         → page.tsx
  /profit           → page.tsx
  /guests           → page.tsx
  /settings         → page.tsx
/components
  /ui               → shadcn components
  /layout           → Sidebar, Header, HotelBrand
  /billing          → BookingForm, ReceiptModal
  /staff            → StaffTable, AttendanceTracker
  /profit           → ProfitChart, SummaryCards
/lib
  /supabase.ts      → client + server clients
  /hooks            → useHotel, useSettings
  /utils            → currency formatting, date helpers
/types
  index.ts          → Hotel, Booking, Staff, Expense types
```

-----

## Key Implementation Notes

- Use **Supabase SSR** (`@supabase/ssr`) for server components
- Hotel settings fetched once and stored in React Context (`HotelContext`) — logo + name available app-wide
- Logo upload: `supabase.storage.from('logos').upload(...)` → store public URL in `hotels.logo_url`
- Currency formatting helper: accepts amount + currency code, returns formatted string
- Profit calculation is always real-time: `SELECT SUM(payments) - SUM(expenses) - SUM(salaries)`
- Printable views: use `window.print()` with a print-specific CSS class that shows hotel header

-----

*Built for Somaliland’s hospitality sector. Lightweight, offline-friendly design principles. Dual-currency ready from day one.*