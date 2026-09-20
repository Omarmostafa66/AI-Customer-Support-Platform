# Customer and Employee Portal Implementation

Completed September 11, 2026. Only the Angular frontend changed. The existing Admin components, API service, models, and sidebar files were preserved. No backend files, database records, dependencies, or configuration were changed.

## Opening the portals

Open [Development Session](http://localhost:4200/dev-session), choose Customer or Employee, select an existing backend record, and choose Open portal. The same development tool is linked above every page. It is deliberately separate from the customer-facing navigation. It loads identity choices from the backend without hard-coded IDs. No identity is chosen automatically.

The backend currently returned no customers or employees during validation, so create development records through the existing Admin pages before testing a populated portal. The development selection is memory-only and resets on a browser reload. Following links within the app preserves it. Selecting another role clears the opposite identity.

## Customer Portal

- Separate sidebar: Dashboard, My Tickets, Create Ticket, Messages. No Admin management navigation is included in the customer sidebar.
- Dashboard: counts for total, open, in-progress, and resolved customer tickets, plus the five most recent tickets.
- My Tickets: ID/title, status, priority, created/updated dates, and detail links.
- Both pages request GET /tickets/customer/{customerId}; they never request the global ticket list. Responses are additionally checked for the selected customer relationship.
- Ticket Details: title, description, status, priority, category, created/updated dates. A detail URL is matched against the customer's scoped collection rather than fetched through the unrestricted ticket-ID endpoint. Unrelated IDs display an unavailable state. Customer details omit internal fingerprint and AI suggestions.
- Create Ticket: title, description, optional category. Submits POST /tickets/customer/{customerId}, or POST /tickets/customer/{customerId}/category/{categoryId} when selected. The backend requires status and priority without defaults, so the frontend supplies OPEN and MEDIUM. Customers do not choose IDs, status, priority, or employees. Successful creation opens the returned ticket ID.
- Messages: sends txt through POST /messages/customer/{customerId}. Displays only confirmed API responses from submissions during the current visit. The page never fetches all messages and filters them as if this were secure retrieval. Leaving/reloading the page clears the visible submission list, not saved backend messages.
- No customer edit/delete actions were added because an authorized customer mutation workflow is not defined.

## Employee Portal

- Separate sidebar: Dashboard, Assigned Incidents, Tickets, Messages.
- Dashboard uses GET /incidents/employee/{employeeId}; shows assigned/open/in-progress/resolved counts and recent assignments.
- Assigned Incidents uses the same scoped endpoint, with status and category filters applied only to assigned records. Category options come from those records; no unrelated incident list is fetched.
- Incident Details also resolves IDs against the scoped collection. Status updates re-fetch assigned incidents immediately before writing, preserve the latest sameMessage, and call PUT /incidents/{id}. RESOLVED uses PUT /incidents/{id}/resolve. An incident reassigned to someone else is not mutated by this UI. There are no assignment, create, or delete controls.
- Support Tickets: read-only shared support queue from GET /tickets, individual detail view using GET /tickets/{id}, customer/category inspection, and the existing GET /tickets/{id}/analyze integration. No duplicate Admin CRUD controls. Ticket status changes remain in Admin.
- Support Messages: read-only shared inbox from GET /messages with customer name/email and creation date. It is explicitly not presented as an employee-assigned inbox or conversation.

## Routes

Existing Admin URLs remain unchanged: /dashboard, /tickets, /customers, /incidents, /messages, /categories, /employees.

New routes:

- /dev-session
- /customer/dashboard
- /customer/tickets
- /customer/tickets/new
- /customer/tickets/:id
- /customer/messages
- /employee/dashboard
- /employee/incidents
- /employee/incidents/:id
- /employee/tickets
- /employee/tickets/:id
- /employee/messages

/customer and /employee redirect to their respective dashboards. Unknown child paths redirect within the corresponding portal. New pages are lazy-loaded. All existing API methods were reused; no new endpoint methods were necessary.

## Authentication and backend limitations

“Role-based UI is implemented for frontend workflow separation. Backend authentication/authorization is still required for real security.”

CurrentUserService is a temporary development context, not a login, token, authenticated session, or authorization policy. The visible development banner and session page state that clearly. Admin routes remain directly accessible; hidden navigation is not access control. The scoped-ID checks and pre-update assignment check improve frontend behavior but cannot prevent direct API calls or a race between checking assignment and writing. Real authentication and atomic backend ownership/role checks are still required.

Unsupported backend capabilities were not invented:

1. No customer-filtered message GET endpoint: historical customer inbox retrieval is omitted.
2. No employee sender, recipient, reply, or conversation model: employee replies and conversations are omitted. The customer association does not identify a sender/recipient pair.
3. No employee-to-ticket assignment relationship or employee-filtered ticket endpoint: support tickets form a shared queue, not “my tickets.”
4. No customer-specific authorized edit/delete endpoints: customer tickets use create/view/track only.
5. Ticket status and priority have no server defaults: the customer create page supplies explicit workflow defaults.
6. Incident resolvedAt is not cleared when reopened by the inspected backend. The page displays recorded timestamps without fabricating changes.
7. Some controllers return 404 for multiple service failures. Frontend errors cannot reliably distinguish every backend failure.
8. Employee responses currently include a password field in backend serialization. New portal templates never render it or salary; the backend should eventually return appropriately scoped DTOs.

## CORS

On September 11, GET checks with Origin http://localhost:4200 returned HTTP 200 and Access-Control-Allow-Origin: http://localhost:4200 for tickets, customers, categories, employees, incidents, and messages. The inspected resource controllers now all have CrossOrigin annotations. Browser checks found no CORS errors in the exercised reads. This supersedes the previous report's missing resource CORS findings. No CORS workaround or backend modification was made in this task. Mutating requests were tested through isolated Angular HTTP tests, not against live records.

## Validation

- Production build passed using the installed CLI: node node_modules/@angular/cli/bin/ng.js build (equivalent to ng build).
- Test suite passed: node node_modules/@angular/cli/bin/ng.js test --watch=false — 12 files, 36 tests, including the previous 21 tests.
- git diff --check passed.
- New tests cover identity initialization/validation, request cancellation on identity change, missing-identity requests, customer endpoint isolation, unrelated detail IDs, creation payloads, duplicate-submit prevention, lookup failure/draft retention, message submission isolation, assigned-incident filters, assignment changes before mutation, preservation of sameMessage, resolution paths, Analyze, inbox error recovery, identity choice validation, and 19 Admin/development/customer/employee route renders with correct sidebars.
- Live browser checks covered the development session empty-identity state, all customer/employee sidebar destinations, missing-identity states, customer layout appearance, and existing Admin dashboard/ticket data and controls.
- The live backend returned five tickets and zero customers, employees, categories, incidents, and messages. Populated portal workflows and live mutations therefore remain manual acceptance checks; isolated test fixtures were never inserted into the backend or application data.

## Manual acceptance checks

1. Create disposable customers, employees, categories, and employee-assigned incidents using the existing Admin UI.
2. Select a customer at /dev-session. Create a ticket with and without a category. Verify only their tickets appear, counts update, details show correct data, and another customer's detail ID is unavailable.
3. Submit a customer message, verify the returned confirmation, then navigate away/back and confirm the UI explains the lack of history without showing other customers' messages.
4. Select an employee. Check assigned counts, category/status filters, status updates and resolution. Reassign an incident in Admin while its employee detail is open, then confirm the employee update is rejected by the frontend recheck.
5. Open support ticket details and Analyze; inspect the shared message inbox. Confirm there are no Admin delete/create/assignment controls.
6. Switch identities and reload the browser. Confirm old data/drafts disappear and a new development selection is required after reload.
7. Test network failures and retries, long content at laptop/tablet widths, and the unchanged Admin CRUD workflows.

## Files created

- [src/app/layout/customer-sidebar/customer-sidebar.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/layout/customer-sidebar/customer-sidebar.ts>)
- [src/app/layout/employee-sidebar/employee-sidebar.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/layout/employee-sidebar/employee-sidebar.ts>)
- [src/app/pages/customer-portal/create-ticket/create-ticket.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/create-ticket/create-ticket.html>)
- [src/app/pages/customer-portal/create-ticket/create-ticket.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/create-ticket/create-ticket.ts>)
- [src/app/pages/customer-portal/dashboard/dashboard.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/dashboard/dashboard.html>)
- [src/app/pages/customer-portal/dashboard/dashboard.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/dashboard/dashboard.ts>)
- [src/app/pages/customer-portal/messages/messages.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/messages/messages.html>)
- [src/app/pages/customer-portal/messages/messages.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/messages/messages.ts>)
- [src/app/pages/customer-portal/my-tickets/my-tickets.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/my-tickets/my-tickets.html>)
- [src/app/pages/customer-portal/my-tickets/my-tickets.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/my-tickets/my-tickets.ts>)
- [src/app/pages/customer-portal/ticket-details/ticket-details.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/ticket-details/ticket-details.html>)
- [src/app/pages/customer-portal/ticket-details/ticket-details.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/customer-portal/ticket-details/ticket-details.ts>)
- [src/app/pages/dev-session/dev-session.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/dev-session/dev-session.html>)
- [src/app/pages/dev-session/dev-session.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/dev-session/dev-session.ts>)
- [src/app/pages/employee-portal/assigned-incidents/assigned-incidents.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/assigned-incidents/assigned-incidents.html>)
- [src/app/pages/employee-portal/assigned-incidents/assigned-incidents.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/assigned-incidents/assigned-incidents.ts>)
- [src/app/pages/employee-portal/dashboard/dashboard.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/dashboard/dashboard.html>)
- [src/app/pages/employee-portal/dashboard/dashboard.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/dashboard/dashboard.ts>)
- [src/app/pages/employee-portal/incident-details/incident-details.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/incident-details/incident-details.html>)
- [src/app/pages/employee-portal/incident-details/incident-details.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/incident-details/incident-details.ts>)
- [src/app/pages/employee-portal/messages/messages.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/messages/messages.html>)
- [src/app/pages/employee-portal/messages/messages.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/messages/messages.ts>)
- [src/app/pages/employee-portal/ticket-details/ticket-details.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/ticket-details/ticket-details.html>)
- [src/app/pages/employee-portal/ticket-details/ticket-details.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/ticket-details/ticket-details.ts>)
- [src/app/pages/employee-portal/tickets/tickets.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/tickets/tickets.html>)
- [src/app/pages/employee-portal/tickets/tickets.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/employee-portal/tickets/tickets.ts>)
- [src/app/pages/portals.spec.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/pages/portals.spec.ts>)
- [src/app/services/current-user.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/services/current-user.ts>)
- [src/app/shared/portal-incident-table.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/shared/portal-incident-table.ts>)
- [src/app/shared/portal-page.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/shared/portal-page.ts>)
- [src/app/shared/portal-state.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/shared/portal-state.ts>)
- [src/app/shared/portal-ticket-table.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/shared/portal-ticket-table.ts>)
- [src/app/shared/portal.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/shared/portal.css>)
- [PORTALS_COMPLETION.md](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/PORTALS_COMPLETION.md>)

## Files modified

- [src/app/app.css](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/app.css>)
- [src/app/app.html](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/app.html>)
- [src/app/app.routes.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/app.routes.ts>)
- [src/app/app.ts](<D:/Internships/NTG Clarity/Task 3/ntg-angular-ui/src/app/app.ts>)
