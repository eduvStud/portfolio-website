# Personal Portfolio V4

React/Vite portfolio with an Express API, MySQL content database, authenticated admin editor, and inquiry inbox.

## Requirements

- Node.js 20 or later
- MySQL 8.0 or later

## Setup

1. Install JavaScript dependencies:

	```powershell
	npm install
	```

2. Create an environment file from [.env.example](.env.example):

	```powershell
	Copy-Item .env.example .env
	```

	Set a strong `MYSQL_PASSWORD`, `JWT_SECRET`, and `ADMIN_PASSWORD`. Do not commit `.env`.

3. Create the database tables:

	```powershell
	mysql -u root -p < database/schema.sql
	```

4. Start the API and frontend in separate terminals:

	```powershell
	npm run server
	npm run dev
	```

The API listens on `http://localhost:3001`; Vite serves the public site at the URL shown by `npm run dev`.

## Admin Console

Open `/admin` on the Vite site and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`. The first server startup creates that account when it does not yet exist.

The editor manages the site content JSON, including profile information, media URLs, social links, projects, partners, and blog posts. Save writes the content to MySQL. Valid contact submissions are stored in the MySQL inquiry inbox, accessible from the same admin page.

## Database

[database/schema.sql](database/schema.sql) creates these tables:

- `admin_users`: bcrypt-hashed administrator credentials.
- `site_content`: one JSON content document used by the portfolio pages.
- `inquiries`: validated messages from the contact form.

The API validates requests and requires a signed JWT for content changes and inbox access. For deployment, configure a restrictive `CLIENT_ORIGIN`, use HTTPS, and store `.env` secrets in the hosting provider's secret manager.

## Commands

```powershell
npm run dev
npm run server
npm run build
npm run lint
```
