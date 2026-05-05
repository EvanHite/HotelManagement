# Hotel Management MVP

A React hotel management MVP for public room booking, guest self-service, and staff operations. The app is SQL-first: React loads hotel data through the PHP API, and PHP reads/writes the Hostinger MySQL database.

## Stack

- React
- Vite
- React Router
- Tailwind CSS
- PHP/MySQL on Hostinger

## Current Features

- Public room search and booking at `/`
- Guest account sign-in with email/password
- Guest booking confirmation, amenities, my stays, and check-in/check-out
- Staff overview, front desk, operations, reports, and settings
- Front desk reservation payment demo with masked card data only
- MySQL-backed rooms, guests, reservations, operations, amenities, and settings
- Token-protected PHP API writes for signed-in users
- Guest registration with email/password validation
- Login rate limiting through the `login_attempts` table
- Maintenance request and inventory item delete actions for DB delete requirements

## Sample Logins

Staff and management auth checks seeded users. Seeded passwords keep the same presentation-friendly values, but the PHP API upgrades older seeded plain passwords to `password_hash()` after the first successful login.

- Reception: choose `Reception`, employee ID `REC100`, password `staff123`
- Housekeeping: choose `Housekeeping`, employee ID `HK100`, password `staff123`
- Maintenance: choose `Maintenance`, employee ID `MX100`, password `staff123`
- Management: email `elena.foster@harborhouse.example`, password `manager123`

Guest demo accounts use password `guest123`.

- `ava.bennett@example.com`
- `marcus.reed@example.com`
- `priya.sharma@example.com`
- `lauren.cole@example.com`
- `devon.ellis@example.com`
- `sofia.martinez@example.com`

## Important Routes

- Public booking: `/`
- Guest sign-in: `/guest/sign-in`
- Staff sign-in: `/staff/sign-in`
- Management sign-in: `/management/sign-in`
- Guest app: `/app/book`, `/app/my-stays`, `/app/check-in`, `/app/amenities`
- Staff app: `/app/overview`, `/app/front-desk`, `/operations`, `/app/reports`, `/app/settings`

## Local Development

Install dependencies once:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Local dev still runs the React app, but hotel data comes from the PHP/MySQL API. If the API is not available, the app shows a database setup error instead of loading fake browser data.

## Hostinger Deployment

This project does not need Node running on Hostinger. Node/Vite is only used locally to build the static files.

The app is configured for this deployed path:

```text
https://internetprogramming.io/HotelManagement/
```

That is why `vite.config.js` uses:

```js
base: "/HotelManagement/"
```

React Router also uses the same base path through `import.meta.env.BASE_URL`, so `/HotelManagement/` stays inside the app instead of redirecting to the domain root.

Build locally:

```bash
npm run build
```

Upload only the contents of:

```text
dist/
```

to Hostinger:

```text
public_html/HotelManagement/
```

Do not upload the source project folders/files for production:

```text
node_modules/
src/
package.json
package-lock.json
vite.config.js
README.md
```

The production upload should look small, usually:

```text
index.html
assets/
api/
.htaccess
```

That is normal. Vite bundles the React source into the files inside `assets/`.

## PHP/MySQL Setup

The app now tries to load data from:

```text
/HotelManagement/api/data.php
```

If the API works, changes are saved through PHP into MySQL. If the API is unavailable, the app shows a database setup error. Seed data belongs in `database/seed.sql`, not duplicated in React.

In phpMyAdmin, import these files in order:

```text
database/schema.sql
database/seed.sql
```

The current schema includes `staff_users`, guest passwords, reservation payment fields, amenities, app settings, unique login identifiers, and `login_attempts`. If your Hostinger database was created from an older schema, start with an empty database and re-import both SQL files unless you need to preserve test data.

The real Hostinger credentials live in:

```text
public/api/config.local.php
```

That file is ignored by git. Keep it private.

Auth behavior:

- Login returns a signed token.
- React sends that token on protected API writes.
- PHP rejects missing, expired, or wrong-role tokens.
- New guest account passwords are hashed immediately.
- Seeded demo passwords are upgraded to hashed passwords on successful login.
- Failed login attempts are rate-limited.

Validation behavior:

- Guest registration requires a valid email address.
- Passwords must be at least 6 characters and cannot be all letters or all numbers.
- Booking dates, capacity, payment amounts, inventory counts, and demo card fields are validated in React and PHP.
- Hostinger production shows an API/database setup error if the PHP API is unavailable.

See `HOSTINGER_SETUP.md` for the step-by-step checklist.

## Build Check

After `npm run build`, confirm `dist/index.html` references assets like:

```html
/HotelManagement/assets/...
```

If the deployed page is blank, check browser DevTools > Network for missing asset files or 404s.
