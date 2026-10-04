# Customer home redesign

The existing CustomerDashboard component now provides the customer home experience at /customer/dashboard. No new Angular components or libraries were introduced. No backend files were changed.

Implemented: customer header/navigation, hero with real route CTAs, current-customer support counts, four feature cards, up to five recent ticket links, six numbered support steps, bottom CTA, and footer. CSS illustration cards are decorative process descriptions, not fabricated ticket records. AI copy describes support-team assistance, and messaging copy retains the history/reply limitation.

The app shell omits the customer sidebar only on the home route. The other customer pages retain their existing layout. Admin and Employee layouts/components remain unchanged. The development-session notice and link remain accessible. Existing customer ticket creation, details, messages, API filtering, identity service, and all routes are preserved.

## API reuse

CurrentUserService.currentCustomerId() selects the identity. Api.getTicketsByCustomer(id) calls GET /tickets/customer/{customerId}. Existing relationship filtering, request cancellation, error handling and recent-ticket sorting remain in use. Cards count returned tickets; no ticket/customer IDs, names, counts or records were fabricated. Missing identity, loading, error, empty and populated states remain distinct.

## Files modified in this redesign

- [src/app/pages/customer-portal/dashboard/dashboard.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/dashboard/dashboard.ts>)
- [src/app/pages/customer-portal/dashboard/dashboard.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/dashboard/dashboard.html>)
- [src/app/app.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/app.ts>)
- [src/app/app.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/app.html>)
- [src/app/app.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/app.css>)
- [src/app/pages/portals.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/portals.spec.ts>)

## Files created

- [src/app/pages/customer-portal/dashboard/dashboard.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/dashboard/dashboard.css>)
- [src/app/pages/customer-portal/dashboard/hero.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/dashboard/hero.css>)
- [src/app/pages/customer-portal/dashboard/sections.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/dashboard/sections.css>)
- [src/app/pages/customer-portal/dashboard/journey.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/dashboard/journey.css>)
- [src/app/pages/customer-portal/dashboard/responsive.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/dashboard/responsive.css>)

This report: CUSTOMER_HOME_REDESIGN.md. Styles are separated by section to stay within existing component CSS budgets without changing build configuration.

## Validation

- Production Angular build passed with no Angular/CSS budget warnings after formatting: node node_modules/@angular/cli/bin/ng.js build. npm is unavailable on this shell's PATH; this invokes the installed CLI used by npm run build.
- All 36 tests passed, including the updated home-navigation route assertion and existing customer filtering/count checks.
- git diff --check passed.
- Browser visual review covered the desktop hero/navigation and mobile hero, actions, feature cards and section wrapping. Mobile document width matched viewport width (no horizontal page overflow).
- No live records were created to populate the redesign. Populated counts/recent tickets retain the existing data path; full live populated visual review requires a customer development session with tickets.
