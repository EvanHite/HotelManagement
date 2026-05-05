# Hostinger PHP + MySQL Setup

This project can run as a React frontend with PHP API files and a Hostinger MySQL database.

## 1. Create the tables

Open phpMyAdmin for `u271223580_hotelDB`.

Import these files in this order:

1. `database/schema.sql`
2. `database/seed.sql`

## 2. Add database credentials

Create this file on Hostinger:

```text
public_html/api/config.local.php
```

Use this shape:

```php
<?php
return [
    "host" => "localhost",
    "database" => "u271223580_hotelDB",
    "username" => "your_database_user",
    "password" => "your_database_password",
];
```

Keep `config.local.php` out of git. The project already ignores it.

## 3. Build the React app

```bash
npm install
npm run build
```

## 4. Upload or deploy

Upload the contents of `dist/` into Hostinger `public_html/`.

The built folder includes:

- `index.html`
- `assets/`
- `api/data.php`
- `api/reservations.php`
- `api/operations.php`
- `api/db.php`
- `.htaccess`

## 5. Test the API

Visit:

```text
https://your-domain.com/api/data.php
```

If it works, you should see JSON data for hotels, rooms, guests, reservations, housekeeping, maintenance, and inventory.

## Notes

- React calls the grouped PHP endpoints with `fetch("/api/...")`.
- PHP connects to MySQL with PDO.
- Local Vite development falls back to mock data when PHP is not available.
