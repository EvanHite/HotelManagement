# Hotel Management Frontend MVP

A React + Tailwind hotel management platform for guest self-service and hotel staff operations. The app currently runs from browser localStorage for easy demo work, with PHP + MySQL files kept for the later database step.

## Stack

- React
- Vite
- React Router
- Tailwind CSS
- PHP
- MySQL

## Core Deliverables

- Premium light-mode SaaS app shell with sidebar, top bar, and responsive layout
- Guest portal for booking, amenities, stay history, and check-in/check-out
- Staff tools for dashboard, reservations, guests, rooms, housekeeping, maintenance, inventory, reports, and settings
- LocalStorage-backed demo data while the SQL database is being prepared
- Reusable UI components for panels, tables, badges, KPI blocks, forms, and empty states

## Demo Roles

Use the landing page to sign in as:

- Guest
- Reception
- Housekeeping
- Maintenance
- Management

## Route Map

### Guest
- `/app/book`
- `/app/amenities`
- `/app/my-stays`
- `/app/check-in`

### Staff
- `/app/overview`
- `/app/front-desk`
- `/app/operations`
- `/app/reports`
- `/app/settings`

## Feature Map

### Guest Experience
- Browse available room inventory
- Create a mock booking
- Review amenities and service information
- View stay history and loyalty standing
- Complete mock check-in and check-out actions

### Staff Experience
- View hotel-wide dashboard KPIs
- Manage reservations and booking status changes
- Inspect guest profiles and stay history
- Track room readiness and current room status
- Update housekeeping task progress
- Update maintenance request progress
- Monitor inventory alerts and restock items
- Review lightweight management reports
- Edit placeholder hotel settings

## Component Inventory

### Layout
- `AppShell`
- `Sidebar`
- `TopBar`

### Shared UI
- `Panel`
- `SectionHeading`
- `StatusBadge`
- `KpiCard`
- `DataTable`
- `EmptyState`
- `BookingForm`

## Design Contract

This app intentionally follows a fixed design brief:

- Light mode only
- White and off-white surfaces
- Thin borders over heavy shadows
- Restrained blue accents
- Compact professional spacing
- Moderate border radius
- Clean enterprise tables and status badges
- No bubbly cards, gimmicky gradients, or marketing-dashboard styling

## Project Structure

```text
src/
  components/
  config/
  context/
  data/
  pages/
  types/
  utils/
```

## Local Setup

```bash
npm install
npm run dev
```

The local app runs at the Vite URL shown in your terminal, usually:

```text
http://localhost:5173
```

Bookings, status updates, notes, and inventory changes are saved in your browser localStorage. To reset the demo data, clear site data for localhost in your browser.

## Hostinger + MySQL Setup

The repo includes files for a later Hostinger deployment path:

- React builds to static files.
- Grouped PHP files in `public/api/` act as the backend.
- MySQL stores hotel data.

See `HOSTINGER_SETUP.md` when you are ready to connect MySQL.

## How The App Works

1. React shows the hotel screens in the browser.
2. For now, React saves demo changes in browser localStorage.
3. Later, React can call PHP files in `public/api/`.
4. PHP will read from and write to MySQL.

## Production Build

```bash
npm run build
```

## Demo Walkthrough

1. Open the landing page and select a role.
2. Review the dashboard or guest portal entry view.
3. Create a booking from the booking form.
4. Update a reservation status to check in or check out.
5. Watch housekeeping, maintenance, room status, and inventory views update from the shared mock state.
6. Use the management role to review reports and settings.

## Notes

- This is still an MVP, not a production hotel system.
- There is no payment gateway, production authentication, or external integration.
- Local development uses localStorage until the SQL step is connected.
