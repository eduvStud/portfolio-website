# Functionality Audit

Audit date: 2026-08-02

## Scope and Result

Reviewed all route pages, shared components, route transition modules, and configured assets under `src/`.

The application routing and route-transition overlay are implemented. The mobile navigation menu and contact-page FAQ state are also functional. Several visitor-facing controls are currently visual-only, use placeholder destinations, or simulate a completed workflow without persisting any data.

This document is intentionally limited to behavior visible in the source. Command-line build and lint verification were not run during this audit.

## Priority 1: Broken or Misleading Visitor Flows

- [ ] **Connect the contact-page inquiry form to a real endpoint.**
  - Location: `src/pages/contact.jsx`
  - The form validates data, waits 1.5 seconds, then always shows “Message Sent!”. It does not send, store, or report failures for an inquiry.
  - Implement `POST /api/inquiries` (or the PocketBase equivalent), handle network/server errors, and only show success after a confirmed response.

- [ ] **Implement or remove the home-page contact form.**
  - Location: `src/pages/homepage.jsx`
  - Its submit handler calls `event.preventDefault()` and has no validation, submission, success state, or error state.
  - Prefer replacing it with a `Link` to `/contact` until it can share the real inquiry-submission flow.

- [ ] **Give both Resume buttons a real action.**
  - Location: `src/components/navbar.jsx`
  - Desktop and mobile Resume buttons have no `onClick`, link target, or download behavior.
  - Link to a published resume page/PDF, or remove the controls until the resume is available.

- [ ] **Replace placeholder social links.**
  - Location: `src/components/footer.jsx`
  - GitHub, LinkedIn, ReadCV, and RSS all use `href="#"`; activating them only resets the current page position.
  - Add real external URLs, include `target="_blank" rel="noreferrer"` where appropriate, and omit unsupported profiles.

- [ ] **Fix the footer navigation for routed pages.**
  - Location: `src/components/footer.jsx`
  - Footer links target hash fragments such as `#projects`. They work only when the corresponding section exists on the current page; from `/projects`, `/blog`, `/partners`, and `/contact`, these targets do not exist.
  - Use React Router `Link` components to route to `/#home`, `/#projects`, `/#blog`, and `/#contact`, then add hash scrolling, or link to the dedicated routes instead.

- [ ] **Implement the Projects page calls to action.**
  - Location: `src/pages/projects.jsx`
  - “View Case Study” uses `href="#"`; “Start a Project” is a button without a click handler.
  - Link to actual case-study routes and to `/contact`, or remove controls for unavailable content.

- [ ] **Implement the Partners page outbound actions.**
  - Location: `src/pages/partners.jsx`
  - “View Case Study”, “Visit Site”, and “External Portal” use `href="#"`; “Join the Network” and “Technical Specs” have no handlers.
  - Add valid destinations/workflows or present these as non-interactive content until partner resources are available.

- [ ] **Implement blog filtering and article navigation.**
  - Location: `src/pages/blog.jsx`
  - Filter buttons do not update state or filter the list. Article rows are static `<article>` elements with no links to post content.
  - Add active filter state and filtered post data, then add post routes or external article URLs.

## Priority 2: Incomplete Content and Media

- [ ] **Replace all empty asset configuration values.**
  - Locations: `src/pages/homepage.jsx`, `src/pages/projects.jsx`, `src/pages/partners.jsx`
  - Every configured image/video URL is an empty string. The site therefore renders developer-facing placeholder text such as “Set shopflowImage in homepage.jsx” instead of portfolio media.
  - Supply optimized asset URLs/imports and retain useful `alt` text. Add a real hero video or remove the video placeholder.

- [ ] **Provide actual project and partner destinations.**
  - Locations: `src/pages/projects.jsx`, `src/pages/partners.jsx`
  - Project cards and partner entries contain descriptive copy but no usable detail pages or verified external resources.
  - Decide whether they should open internal case studies, GitHub repositories, live products, or partner sites, then model that data explicitly.

- [ ] **Decide how blog content will be delivered.**
  - Location: `src/pages/blog.jsx`
  - Published entries and works-in-progress are static display content. There is no post body, CMS/API integration, draft workflow, or RSS feed despite the footer claiming an RSS link.
  - Start with a local post-data module and post pages, or connect the planned CMS/PocketBase collection before publishing the blog navigation.

## Priority 3: Production Readiness

- [ ] **Add automated checks.**
  - The project exposes `npm run build` and `npm run lint`, but contains no test suite for contact submission, mobile navigation, routes, or filtering.
  - Add unit tests for form validation/filtering and end-to-end coverage for the contact and route-transition flows.

- [ ] **Replace template-level project documentation.**
  - Location: `README.md`
  - The README is the default Vite template and does not explain local setup, content configuration, deployment, environment variables, or how the inquiry backend works.

- [ ] **Reconcile dated content.**
  - Several visible labels say 2023/2024 or “Q3 2024” while the footer copyright is 2026.
  - Update availability, project timelines, and content dates before launch so the portfolio does not appear abandoned.

## Suggested Delivery Order

1. Decide the public destinations for the resume, social profiles, projects, partners, and posts; remove any action that still has no destination.
2. Build the inquiry API/PocketBase collection and wire both contact entry points to one validated submission flow.
3. Add portfolio media and case-study/blog data, then implement filters and detail navigation.
4. Add tests, a real README, and a CI job that runs lint and build on every change.

## Verified Working Surfaces

- BrowserRouter defines routes for home, projects, partners, blog, and contact, with unknown URLs redirected home.
- The route transition overlay is connected through `RouteTransitionOverlay.play()` and swaps the displayed route while the overlay covers the page.
- Navbar internal route links use React Router `Link`; the mobile menu opens, closes, and closes after a navigation click.
- Contact-page form validation, submit disabled state, FAQ expansion, mailto link, and visual pointer effects are implemented locally.