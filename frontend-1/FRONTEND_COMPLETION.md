# Frontend implementation report

Only the Angular frontend was modified. Backend code, configuration, database settings, and dependencies were not changed. Existing routes and sidebar links are preserved. No dependencies were added or installed.

## Completed pages

| Page | Implemented behavior |
| --- | --- |
| Customers | List, create, edit, delete confirmation; name, email, password input, phone number, address, gender, age; validation and password clearing after save/cancel. |
| Categories | List, create, edit, delete confirmation; name, optional description, creation date. |
| Employees | List, create, edit, delete confirmation; name, email, password input, role, age, gender, salary. Passwords are never displayed in tables or prefilled. |
| Incidents | List, create, edit status/sameMessage, details, delete confirmation, dedicated resolve action, employee/category assignment using dropdowns, filters for status/employee/sameMessage. Multiple filters use an existing server endpoint plus local intersection. |
| Messages | List, create with an optional customer dropdown, edit text, delete confirmation; customer name/email and creation date. |
| Dashboard | Eight real-data summary cards; latest five dated ticket updates; unavailable resources are distinct from zero counts; refresh waits for all requests. |
| Tickets | Existing workflow and template preserved; resource types added. Existing Analyze action verified in the browser. |

All new management pages include loading, empty, failure, retry, save feedback, and disabled controls during mutations. Shared request lifecycle cancels subscriptions when pages are destroyed. API requests have bounded timeouts. Layout retains the navy sidebar, purple navigation/buttons, gray background, white cards, and responsive forms/tables.

## Backend and CORS limitations

- Live GET requests with Origin http://localhost:4200 returned HTTP 200 for all resources. Tickets, Customers, and Incidents returned Access-Control-Allow-Origin. Categories, Employees, Messages, and Health did not. Browser checks confirmed Categories, Employees, and Messages fail cross-origin; incident lookup dropdowns and two dashboard counts are consequently unavailable. Those backend endpoints need CORS permission for http://localhost:4200. No proxy, browser-security bypass, or backend change was introduced.
- Customer passwords are write-only in responses, but PUT requires a nonblank password and replaces it. Customer edits therefore require entering a password to use after saving. Employee PUT also replaces the password, and its form explicitly requests one rather than exposing/prefilling a returned credential.
- Employee responses currently serialize their password field in backend code. The frontend does not render it; backend response serialization should be reviewed by the backend owner.
- Role and gender are plain strings, not backend enums. Forms use text inputs instead of inventing enum choices.
- Incident PUT changes only status and sameMessage. Assignment uses the dedicated employee/category endpoints. There is no unassignment endpoint or category-filter endpoint; these actions are not invented.
- Incident resolvedAt is not cleared by the backend when an incident is reopened. It is displayed as the recorded resolution date. The create hook does not set resolvedAt for an incident initially created as RESOLVED; the dedicated Resolve action records it.
- Message PUT changes only txt; its customer association is read-only during editing.
- Some controllers return 404 for multiple service failures, including some invalid/duplicate updates. The UI avoids assuming every 404 means only a missing record. Duplicate/linked-record failures may require checking backend logs.
- Recent tickets are based on stored timestamps, not a fabricated audit feed. Server LocalDateTime values carry no timezone information.

## Validation

- Production build passed: node node_modules/@angular/cli/bin/ng.js build (the installed Angular CLI, equivalent to ng build). npm was not on this shell's PATH; existing dependencies were present.
- Tests passed: node node_modules/@angular/cli/bin/ng.js test --watch=false — 11 files, 21 tests.
- git diff --check passed.
- Tests cover exact API action paths, customer password validation, draft retention after errors, CORS/network failure recovery, delete cancellation/conflict, incident relationships and combined filters, message text-only update, dashboard partial failures and ordering.
- Browser review covered every sidebar route, real ticket data, ticket analysis output, the customer create form/empty state, incident lookup failures, dashboard unavailable counts, and a 768px tablet customer form.
- Live database mutation workflows were not exercised. Unit tests use isolated HTTP fixtures; no mock data was added to application pages and no test records were inserted into the running database.

## Manual acceptance checks

1. Have the backend owner enable CORS for Categories, Employees, and Messages, then refresh their pages and the Dashboard/Incidents lookups.
2. Create, edit, and delete disposable Customer, Category, and Employee records. Test duplicate emails/category names, required inputs, and linked-record deletion failures. For account updates, enter the intended password and verify it with the backend owner.
3. Create an incident with selected employee/category records; open Details / Assign, change each assignment, edit status and sameMessage, combine filters, resolve, reopen, and check the recorded timestamps. Delete only a disposable record.
4. Create a customer-linked message and an unlinked message; edit their text and confirm customer associations remain unchanged; delete disposable records.
5. Recheck existing ticket create/edit/delete and Analyze. Refresh the Dashboard and compare counts with the resource lists.
6. Test representative long rows and forms at your normal laptop/tablet widths, and interrupt/restart the API to verify retry behavior.

## All changed or added files

- [FRONTEND_COMPLETION.md](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/FRONTEND_COMPLETION.md>)
- [src/app/app.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/app.css>)
- [src/app/app.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/app.spec.ts>)
- [src/app/layout/sidebar/sidebar.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/layout/sidebar/sidebar.css>)
- [src/app/layout/sidebar/sidebar.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/layout/sidebar/sidebar.spec.ts>)
- [src/app/models/resources.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/models/resources.ts>)
- [src/app/pages/categories/categories.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/categories/categories.html>)
- [src/app/pages/categories/categories.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/categories/categories.spec.ts>)
- [src/app/pages/categories/categories.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/categories/categories.ts>)
- [src/app/pages/customers/customers.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customers/customers.html>)
- [src/app/pages/customers/customers.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customers/customers.spec.ts>)
- [src/app/pages/customers/customers.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customers/customers.ts>)
- [src/app/pages/dashboard/dashboard.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/dashboard/dashboard.css>)
- [src/app/pages/dashboard/dashboard.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/dashboard/dashboard.html>)
- [src/app/pages/dashboard/dashboard.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/dashboard/dashboard.spec.ts>)
- [src/app/pages/dashboard/dashboard.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/dashboard/dashboard.ts>)
- [src/app/pages/employees/employees.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employees/employees.html>)
- [src/app/pages/employees/employees.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employees/employees.spec.ts>)
- [src/app/pages/employees/employees.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employees/employees.ts>)
- [src/app/pages/incidents/incidents.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/incidents/incidents.css>)
- [src/app/pages/incidents/incidents.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/incidents/incidents.html>)
- [src/app/pages/incidents/incidents.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/incidents/incidents.spec.ts>)
- [src/app/pages/incidents/incidents.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/incidents/incidents.ts>)
- [src/app/pages/management.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/management.spec.ts>)
- [src/app/pages/messages/messages.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/messages/messages.html>)
- [src/app/pages/messages/messages.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/messages/messages.spec.ts>)
- [src/app/pages/messages/messages.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/messages/messages.ts>)
- [src/app/pages/tickets/tickets.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/tickets/tickets.spec.ts>)
- [src/app/pages/tickets/tickets.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/tickets/tickets.ts>)
- [src/app/services/api.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/services/api.spec.ts>)
- [src/app/services/api.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/services/api.ts>)
- [src/app/shared/api-error.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/shared/api-error.ts>)
- [src/app/shared/crud-page.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/shared/crud-page.ts>)
- [src/app/shared/management.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/shared/management.css>)
- [src/styles.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/styles.css>)
