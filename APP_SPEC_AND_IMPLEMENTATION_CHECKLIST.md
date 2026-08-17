# Personal Portfolio V4: App Specs, Flows, and Production Checklist

## 1) Product Scope
This app is a portfolio web application with route-based pages for home, about, projects, partners, blog, and contact.

### Core user outcomes
- Explore developer profile and brand story.
- View highlighted projects and partners.
- Read blog content.
- Submit a contact inquiry.

## 2) Current Frontend Architecture
- Framework: React + Vite
- Routing: react-router-dom
- Animation: framer-motion
- Styling: page-level CSS files in src/styles

### Main app modules
- Routing entry: src/main.jsx
- Shared components: src/components/navbar.jsx, src/components/footer.jsx
- Route transition overlay: src/transition.jsx
- Transition content config: src/transition.content.js
- Pages: src/pages/*.jsx

## 3) Route and UI Flows

### 3.1 Navigation flow
1. User clicks internal route link (must use Link for /path routes).
2. Router location updates.
3. Transition overlay starts panel sequence.
4. During covered phase, displayed route is swapped.
5. Panels exit and new route is revealed.

### 3.2 Contact inquiry flow
1. User opens contact page.
2. User fills form fields: name, email, project type, message.
3. Client validation runs.
4. On valid payload, request is posted to backend endpoint.
5. Backend validates and stores inquiry in DB.
6. Optional: notification is sent to site owner email/Slack.
7. UI displays success/error state.

### 3.3 Content flow
1. Static profile/project/blog content is rendered from source files now.
2. Recommended next step: move content to CMS or PocketBase collections.
3. Frontend fetches typed content via API and renders cards/sections.

## 4) Data Model Proposal

### inquiries collection/table
- id (string/uuid)
- name (string, required, 2-120)
- email (string, required, validated)
- project_type (string enum)
- message (string, required, min 10)
- source_page (string, optional)
- created_at (datetime)
- status (enum: new, reviewed, responded, archived)

### projects collection/table (recommended)
- id
- slug
- title
- summary
- tags (array)
- hero_image_url
- content_blocks (json)
- featured (boolean)
- created_at, updated_at

### blog_posts collection/table (recommended)
- id
- slug
- title
- excerpt
- body_markdown or body_richtext
- cover_image_url
- published_at
- author
- status (draft/published)

## 5) Backend and Integration Plan

### 5.1 API endpoints
- POST /api/inquiries
- GET /api/projects
- GET /api/projects/:slug
- GET /api/blog
- GET /api/blog/:slug

### 5.2 Validation and security
- Server-side schema validation (zod/joi/valibot)
- Rate limiting on inquiry endpoint
- Bot protection (hCaptcha/Turnstile)
- Input sanitization and output encoding
- CORS policy (restrict to production origins)

### 5.3 Notification pipeline
- On new inquiry, trigger:
  - Email notification
  - Optional Slack/Discord webhook
- Store delivery status and retry on transient failures

## 6) Full Functionality Checklist

## 6.1 Frontend checklist
- [ ] All internal route links use Link (no full-page reload for in-app paths)
- [ ] Transition overlay is visible and route swap occurs during covered phase
- [ ] Contact form has loading, success, and error states
- [ ] Accessible labels, keyboard navigation, and visible focus styles
- [ ] Responsive behavior validated at 360, 768, 1024, 1440 widths
- [ ] Image assets optimized and lazy loaded where appropriate

## 6.2 Backend checklist
- [ ] Create API service (Node/Express, Fastify, or serverless functions)
- [ ] Implement POST /api/inquiries with strict schema validation
- [ ] Implement structured error responses
- [ ] Add request logging and correlation IDs
- [ ] Add rate limiting and abuse detection

## 6.3 Database checklist
- [ ] Choose DB (PocketBase/Postgres/MongoDB)
- [ ] Create inquiries table/collection and indexes
- [ ] Apply migrations or collection schema definitions
- [ ] Add backup policy and restore test
- [ ] Add retention policy for old inquiries

## 6.4 Auth and admin checklist
- [ ] Create admin login for inquiry review dashboard
- [ ] Enforce role-based permissions (admin/editor)
- [ ] Protect admin APIs with token/session auth
- [ ] Store secrets securely in environment variables

## 6.5 DevOps and deployment checklist
- [ ] Define environments: local, staging, production
- [ ] Configure CI checks: lint, build, tests
- [ ] Deploy frontend via Vercel/Netlify/Cloudflare Pages
- [ ] Deploy backend/API with health checks
- [ ] Configure domain, TLS, and DNS
- [ ] Set up rollbacks and release notes

## 6.6 Observability checklist
- [ ] Frontend error tracking (Sentry)
- [ ] API metrics and latency dashboards
- [ ] Uptime monitoring and alerts
- [ ] Audit logs for admin actions

## 6.7 QA checklist
- [ ] Unit tests for validation helpers
- [ ] Integration tests for inquiry endpoint
- [ ] E2E tests for route transitions and contact submit flow
- [ ] Cross-browser test pass (Chromium, Firefox, Safari)

## 7) Suggested Process by Milestone

### Milestone A: Stabilize UI
- Convert all internal path anchors to Link.
- Finalize page transition behavior and timing.
- Freeze responsive styles for all pages.

### Milestone B: Add backend + DB
- Stand up API and database schema.
- Wire contact form to POST /api/inquiries.
- Implement spam protection and notifications.

### Milestone C: Content operations
- Move projects/blog content into DB or CMS.
- Add admin content workflows.
- Add drafts, publish states, and preview mode.

### Milestone D: Production hardening
- Add monitoring, alerts, backups, and security headers.
- Complete E2E suite and staging sign-off.
- Execute production launch checklist.

## 8) Immediate Next Technical Tasks
- Replace contact form simulation with real API call in src/pages/contact.jsx.
- Add environment-based API URL configuration.
- Introduce request utility with retry/error handling.
- Build minimal admin inbox for inquiries.
