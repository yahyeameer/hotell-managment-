# 🏨 Hargeisa Grand — Premium Hotel Management System

<div align="center">
  <img src="https://raw.githubusercontent.com/yahyeameer/hotell-managment-/main/public/screenshots/dashboard.png" alt="Dashboard Screenshot" width="100%">
</div>

<div align="center">
  <p><b>A state-of-the-art, mobile-first financial platform for modern hospitality.</b></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3EC78D?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animations-0055FF?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

---

## ✨ Features at a Glance

### 📊 Intelligent Analytics Dashboard
*   **Real-time Revenue Tracking:** Monitor your income in both **USD** and **SOS** with dynamic exchange rate conversion.
*   **Occupancy Insights:** Visual representation of room availability and guest flow.
*   **Net Profit Analysis:** Automated calculation of your bottom line after accounting for all operational expenses.

### 💳 Localized Billing & Payments
*   **Somali Payment Integration:** Native support for **Zaad, eDahab, Golis,** and **EVC Plus**.
*   **Multi-Currency Support:** Seamlessly switch between USD and SOS for all transactions.
*   **Professional Invoicing:** Generate clear, detailed billing statements for every guest.

### 🏨 Comprehensive Room Management
*   **Status Indicators:** Instantly see which rooms are **Available**, **Occupied**, or under **Maintenance**.
*   **Bulk Operations:** Manage multiple rooms at once to save time during peak hours.
*   **Pricing Control:** Dynamically adjust room rates based on seasonal demand.

### 👥 Staff & Guest Management
*   **RBAC Security:** Role-Based Access Control ensures that "Staff" can focus on operations while sensitive financial data is restricted to "Admin" users.
*   **Guest Directory:** Maintain a lifetime history of guest stays, contact info, and total value.
*   **Shift Tracking:** Manage staff shifts (Morning, Day, Night) and attendance status.

---

## 🎨 Design Philosophy: "Liquid Glass"
This system isn't just functional; it's **premium**. Built with:
*   **Glassmorphism Layouts:** Modern translucent surfaces with deep blurs.
*   **Neon Aesthetics:** Subtle glows that guide the user's eye to critical data.
*   **Staggered Animations:** Smooth transitions powered by Framer Motion for a high-end feel.
*   **Mobile First:** A fully responsive experience that looks as good on a smartphone as it does on a desktop.

---

## 🛠️ Technology Stack
*   **Frontend:** Next.js 16 (App Router, Turbopack)
*   **Backend:** Supabase (Auth, PostgreSQL, RLS)
*   **Visuals:** Recharts for data viz, Lucide React for iconography.
*   **Theme:** Next-Themes for seamless Dark/Light mode switching.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yahyeameer/hotell-managment-.git
cd hotell-managment-
npm install
```

### 2. Environment Setup
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Migration
Run the contents of `database-setup.sql` in your Supabase SQL Editor to initialize the 8-table schema (Hotels, Rooms, Guests, Bookings, Expenses, Staff, Roles, Permissions).

### 4. Run Development
```bash
npm run dev
```

---

<div align="center">
  <p>Built with ❤️ by <b>Yahye Ameer</b></p>
  <p><i>Transforming hospitality through technology.</i></p>
</div>
