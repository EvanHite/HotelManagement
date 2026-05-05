# Hostinger SQL Setup

Use this checklist to run the MySQL-backed version on Hostinger.

## 1. Create Tables

Open phpMyAdmin for the database:

```text
u271223580_hotelDB
```

Import these files in order:

```text
database/schema.sql
database/seed.sql
```

If you already created older test tables, drop the old tables first or start with an empty database. The current schema includes auth, payment, and rate-limit fields, including:

```text
staff_users
app_settings
amenities
guest_profiles.password
reservations.payment_method
reservations.amount_paid
reservations.balance_due
reservations.authorized_amount
reservations.payment_history
login_attempts
```

If you need to keep existing test data, manually add the missing fields/tables from `database/schema.sql`. For class/demo work, the cleanest path is to empty the database and re-import both files.

## 2. Confirm API Config

The real database credentials go in:

```text
public/api/config.local.php
```

For Hostinger, the PHP API is configured to use:

```text
host: localhost
database: u271223580_hotelDB
username: u271223580_DBmf
```

Keep `config.local.php` private. Do not commit it or share it publicly.

## 3. Build The App

Run locally:

```bash
npm run build
```

The app is configured for:

```text
https://internetprogramming.io/HotelManagement/
```

## 4. Upload To Hostinger

Upload only the contents of:

```text
dist/
```

to:

```text
public_html/HotelManagement/
```

The uploaded folder should include:

```text
index.html
assets/
api/
.htaccess
```

Do not skip `.htaccess`. It keeps React routes working and preserves the `Authorization` header that the PHP API uses for signed tokens.

Do not upload:

```text
node_modules/
src/
package.json
package-lock.json
vite.config.js
README.md
```

## 5. Test The API

Visit:

```text
https://internetprogramming.io/HotelManagement/api/data.php
```

Expected result: JSON with hotels, settings, amenities, guests, rooms, reservations, housekeeping, maintenance, and inventory.

If you see a database error:

- Confirm the database tables were imported.
- Confirm `config.local.php` was uploaded inside `api/`.
- If `localhost` fails, check Hostinger's exact MySQL Host value and replace the `host` value in `config.local.php`.

Also test staff auth:

```text
https://internetprogramming.io/HotelManagement/api/auth.php
```

This endpoint expects a POST request from the app, so opening it directly in the browser may show a method error. That is okay. The real test is signing in through the staff or management sign-in pages.

## 6. Test The App

Visit:

```text
https://internetprogramming.io/HotelManagement/
```

Try:

- Sign in with a wrong password and confirm login fails.
- Sign in with a correct staff, management, and guest account.
- Create a guest account with invalid passwords and confirm validation blocks it.
- Create a public booking after signing in or creating an account.
- Open Front Desk and update a reservation.
- Update housekeeping, maintenance, and inventory.
- Delete a maintenance request as maintenance or management.
- Delete an inventory item as management.
- Refresh the page and confirm changes persist.

Seeded demo logins:

```text
Reception: REC100 / staff123
Housekeeping: HK100 / staff123
Maintenance: MX100 / staff123
Management: elena.foster@harborhouse.example / manager123
Guests: seeded guest email / guest123
```

## Notes

- Node is not required on Hostinger.
- Vite/Node only builds the static files locally.
- PHP talks to MySQL on Hostinger.
- The React app is SQL-only for hotel data. If PHP or MySQL is unavailable, it shows an API/database setup error instead of fake browser data.
- Seeded demo passwords keep the same visible values, but successful login upgrades older seeded plain passwords with PHP `password_hash()`.
