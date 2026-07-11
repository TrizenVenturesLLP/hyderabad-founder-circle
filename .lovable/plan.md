# Pending work to reach industry-standard quality

Grouped by priority. Current site is a static multi-page build with placeholder links and no backend/analytics.

## 1. Content & links (blockers before launch)
- Replace placeholder URLs in `src/lib/links.ts`: RSVP (Luma/Google Form), WhatsApp/Telegram invite, sponsor URL, real contact email.
- Real partner logos (T-Hub, WE Hub, eChai, Trizen) instead of text placeholders.
- Real founder stories, member profiles, event photos (swap generated images gradually).
- Proofread copy; add a proper `/privacy` and `/terms` page (required for forms + analytics + ads).

## 2. SEO & discoverability
- Per-route `head()` audit: unique title (<60 chars), description (<160), canonical, og:title/description/type, twitter:card.
- Add og:image on leaf routes (hero image per page); dynamic og:image on `/events/$slug` from event data.
- `public/robots.txt` and `public/sitemap.xml` with all public routes.
- Event JSON-LD verification in Google Rich Results test; add Organization + BreadcrumbList JSON-LD.
- Semantic HTML pass: single H1 per page, proper heading order, `<nav>`, `<main>`, `<article>`, alt text on every image.

## 3. Analytics & measurement
- Plausible or GA4 via a `<script>` in `__root.tsx` head.
- Event tracking: RSVP click, Join Community click, contact submit, outbound partner clicks.
- Basic conversion funnel dashboard.

## 4. Forms & backend (currently mailto only)
- Real contact form submission (either Formspree/Getform, or enable Lovable Cloud with a `contacts` table + rate limiting).
- Newsletter signup (Buttondown/Mailchimp) if desired.
- Spam protection (honeypot + Cloudflare Turnstile).

## 5. Accessibility (WCAG 2.1 AA)
- Color contrast audit on terracotta/paper palette.
- Keyboard navigation + visible focus rings on all interactive elements.
- `aria-label` on icon-only buttons, mobile nav trigger, external links.
- `prefers-reduced-motion` respected for any animations.
- Skip-to-content link; correct landmark roles.

## 6. Performance
- Convert JPG hero/event images to responsive `<img srcset>` + AVIF/WebP; explicit width/height to prevent CLS.
- `loading="lazy"` and `decoding="async"` on below-fold images.
- Preload hero image and primary font; `font-display: swap`.
- Lighthouse target: 95+ on all four categories mobile.

## 7. Error handling & resilience
- `errorComponent` + `notFoundComponent` on every route with a loader (currently minimal).
- Custom 404 page with helpful links.
- Loading states / skeletons where relevant.

## 8. Legal & trust
- Cookie consent banner (only if analytics uses cookies — Plausible avoids this).
- Privacy Policy, Terms, Community Guidelines as standalone pages linked from footer.
- Contact email + physical/venue info in footer for legitimacy.

## 9. Social & sharing
- Open Graph preview images per page (1200×630).
- "Share this event" buttons on event detail (WhatsApp, LinkedIn, X, copy link).
- Add-to-calendar (.ics download) on event pages.

## 10. Progressive enhancements (nice-to-have)
- Past events archive with recap + photos.
- Email capture for "notify me about next meetup".
- Member directory search/filter by role, stage, "open to".
- Testimonials carousel with attribution.
- Dark mode toggle.
- PWA manifest + favicon set (multiple sizes, apple-touch-icon, theme-color).

## 11. Ops
- Custom domain + HTTPS.
- Uptime monitoring (UptimeRobot).
- Backup of content files in git (already the case).
- Publish workflow doc for organizers (how to add a new meetup, story, member).

## Suggested build order
1. Content/links + logos + privacy/terms → real launch
2. SEO + analytics + sitemap → discoverability
3. A11y + performance pass → quality bar
4. Contact form backend + share/calendar → engagement
5. Past events + directory + PWA → depth over time

Tell me which sections to tackle first and I'll turn them into concrete implementation steps.
