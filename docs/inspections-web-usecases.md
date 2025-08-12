## Use Case Document: Inspections Web App (React + shadcn/ui + GraphQL)

Version: 1.0  
Date: 2025-08-12  
Reference inspiration: SafetyCulture (iAuditor) inspections, actions, reports, and analytics [SafetyCulture (iAuditor)](https://safetyculture.com/iauditor/)

### 1. Actors
- **Inspector**: Conducts inspections, raises issues, creates actions, submits reports.
- **Supervisor**: Reviews KPIs, inspections, and reports; manages actions.
- **System (Frontend)**: React app rendering UI, executing logic, caching offline.
- **GraphQL Backend**: Hasura GraphQL API for data operations.
- **Storage/CDN**: For media storage (S3 or equivalent via signed URLs).
- **Notification Service**: Push/operational notifications surfaced in-app.
- **Auth Service**: OTP issuance and token verification.

### 2. Global Preconditions
- User has a modern browser with camera permissions (for media capture).
- GraphQL endpoint reachable or, if offline, the app uses local cache/queue.
- User account provisioned in backend with role/permissions.

### 3. Use Case Index
- Authentication: UC-A1–A4
- Templates: UC-T1–T5
- Work Orders: UC-W1–W4
- Inspections: UC-I1–I10
- Issues & Actions: UC-AC1–AC6
- Reports: UC-R1–R4
- Notifications: UC-N1–N2
- Offline & Sync: UC-O1–O4
- Settings & Localization: UC-S1–S4
- Analytics & Dashboard: UC-AN1–AN2

---

### 4. Authentication

#### UC-A1: Request OTP
- **Actors**: Inspector, Auth Service
- **Description**: Request an OTP for a mobile number to start login.
- **Preconditions**: Number is registered.
- **Trigger**: User enters mobile and clicks “Request OTP”.
- **Main Flow**:
  1. System calls `isUserRegistered` with `username` and `type`.
  2. Backend sends OTP via SMS and returns acknowledgment.
  3. UI shows OTP input and timer.
- **Alternate**:
  - A1. Unregistered number → show error.
  - A2. Network error → show retry.
- **Postconditions**: OTP sent; UI awaits OTP input.
- **Data/GraphQL**: `isUserRegistered`.

#### UC-A2: Login with OTP
- **Actors**: Inspector, Auth Service
- **Description**: Verify OTP and create session.
- **Preconditions**: Valid OTP sent to user.
- **Trigger**: User submits OTP.
- **Main Flow**:
  1. System calls `getUserQuery(username, otp)`.
  2. On success, receives `token` and profile.
  3. Store token; navigate to Dashboard.
- **Alternate**:
  - A1. Invalid/expired OTP → show error.
  - A2. Network error → allow retry.
- **Postconditions**: Authenticated session active.
- **Data/GraphQL**: `getUserQuery`.

#### UC-A3: Logout
- **Actors**: Inspector
- **Description**: End session and clear sensitive data.
- **Main Flow**:
  1. User clicks Logout.
  2. System clears token, local caches (except drafts if configured).
  3. Redirect to Login.
- **Postconditions**: Session terminated.

#### UC-A4: Session Renewal (Optional)
- **Actors**: System, Backend
- **Description**: Refresh short-lived token.
- **Main Flow**: System silently refreshes token or re-prompts login if invalid.

---

### 5. Templates

#### UC-T1: Browse Templates
- **Actors**: Inspector, Supervisor
- **Description**: List templates for selection.
- **Main Flow**:
  1. System queries `api_mobile_templates` with pagination.
  2. User filters/sorts; selects to preview or start inspection.
- **Postconditions**: Template chosen or previewed.
- **Data/GraphQL**: `api_mobile_templates`, aggregate count.

#### UC-T2: Import iAuditor Template
- **Actors**: Supervisor (or Inspector if allowed)
- **Description**: Import iAuditor-compatible JSON.
- **Preconditions**: Valid iAuditor JSON file.
- **Main Flow**:
  1. User uploads JSON.
  2. System parses and maps to internal `TemplateJSON`.
  3. Persist to backend (if supported) or local cache for current session.
- **Alternate**: Invalid schema → show mapping errors.
- **Postconditions**: Template available for use.

#### UC-T3: Export Template to iAuditor JSON
- **Actors**: Supervisor
- **Description**: Export selected template to iAuditor-compatible JSON.
- **Main Flow**: Map internal model to iAuditor schema; download JSON.
- **Postconditions**: File exported for external use.

#### UC-T4: Preview Template
- **Actors**: Inspector
- **Description**: View template sections, items, logic, scoring.
- **Main Flow**: Load template JSON; render read-only.

#### UC-T5: Assign Template to Work Order (If enabled)
- **Actors**: Supervisor
- **Description**: Associate a template with a work order.
- **Main Flow**: Update work order metadata with `template_id`.

---

### 6. Work Orders

#### UC-W1: View Work Orders
- **Actors**: Inspector
- **Description**: See assigned work orders with status.
- **Main Flow**:
  1. Query `api_mobile_workorders` with filters (status/date).
  2. Display list with pagination.
- **Postconditions**: User can select one to view details.

#### UC-W2: Filter/Sort Work Orders
- **Actors**: Inspector
- **Description**: Narrow list by status, date, contractor, vehicle.
- **Main Flow**: Client-side or server-side filtering; update list.

#### UC-W3: View Work Order Details
- **Actors**: Inspector
- **Description**: See detailed info: vehicle, contractor, due date, related items.
- **Main Flow**: Fetch work order details (e.g., `workorder_details`).

#### UC-W4: Start Inspection from Work Order
- **Actors**: Inspector
- **Description**: Create inspection draft using selected template.
- **Main Flow**: Choose template; initialize draft with work order metadata.

---

### 7. Inspections

#### UC-I1: Create Inspection Draft
- **Actors**: Inspector, System
- **Description**: Initialize draft with template and context.
- **Main Flow**:
  1. Create draft entry in IndexedDB with `status = in_progress`.
  2. Pre-fill metadata (inspector, vehicle, timestamps).
- **Postconditions**: Draft exists and is editable.

#### UC-I2: Autosave Draft
- **Actors**: System
- **Description**: Persist changes on every answer change.
- **Main Flow**: Debounced save to IndexedDB; update `updated_at`.
- **Alternate**: Storage quota exceeded → inform user to remove media.

#### UC-I3: Capture Photo/Upload
- **Actors**: Inspector
- **Description**: Add photos to questions/items.
- **Main Flow**:
  1. User captures via webcam or uploads.
  2. Store local blob URL in draft; show thumbnail.
  3. If online, begin background upload to storage; replace with remote URL.
- **Alternate**: Offline → mark as `pending_upload`.

#### UC-I4: Answer Questions (All Types)
- **Actors**: Inspector
- **Description**: Provide responses for choice, multi, text, number, date, tag.
- **Main Flow**: UI validates and records per item; update progress.

#### UC-I5: Conditional Logic Execution
- **Actors**: System
- **Description**: Show/hide fields based on responses, enforce required-on-fail.
- **Main Flow**: Evaluate rules on change; update UI and validation state.

#### UC-I6: Validate & Review
- **Actors**: Inspector
- **Description**: Check required fields, photo-on-fail, numeric ranges.
- **Main Flow**: On Review/Submit, run validation; navigate to first invalid.

#### UC-I7: Submit Inspection (Online)
- **Actors**: Inspector, Backend
- **Description**: Send final payload to backend.
- **Preconditions**: All validations pass.
- **Main Flow**:
  1. Upload remaining media; replace local refs with URLs.
  2. Execute `submitInspection` mutation with JSON payload.
  3. On success, mark draft `synced` and generate report.
- **Alternate**: API error → show error; allow retry.

#### UC-I8: Submit Inspection (Offline)
- **Actors**: Inspector, System
- **Description**: Queue submission while offline.
- **Main Flow**:
  1. Mark draft `pending_sync` and enqueue action in `action_queue`.
  2. On reconnect, sync service attempts submission.
- **Postconditions**: Data preserved; will sync later.

#### UC-I9: Resume Draft
- **Actors**: Inspector
- **Description**: Continue in-progress draft after refresh or later session.
- **Main Flow**: Load latest draft state from IndexedDB; resume.

#### UC-I10: Discard Draft
- **Actors**: Inspector
- **Description**: Delete an in-progress draft after confirmation.
- **Main Flow**: Remove draft and associated local media (optional prompt).

---

### 8. Issues & Actions

#### UC-AC1: Raise Issue from Question
- **Actors**: Inspector
- **Description**: Create issue for a failed/flagged item.
- **Main Flow**: Open dialog; enter description, severity; optionally attach media; save.

#### UC-AC2: Create Action
- **Actors**: Inspector, Supervisor
- **Description**: Assign follow-up action with assignee, due date, priority.
- **Main Flow**: Submit `createAction` mutation; link to inspection and item.

#### UC-AC3: Update Action Status
- **Actors**: Assignee, Supervisor
- **Description**: Change status (open → in_progress → done); add notes.
- **Main Flow**: Update mutation; audit timestamp.

#### UC-AC4: View Actions List
- **Actors**: Inspector, Supervisor
- **Description**: Filter by status, assignee, due date.
- **Main Flow**: Query actions with filters; paginate.

#### UC-AC5: Comment on Action (Optional)
- **Actors**: Assignee
- **Description**: Add comment thread updates.

#### UC-AC6: Attach Media to Action (Optional)
- **Actors**: Assignee
- **Description**: Upload additional evidence; link to action record.

---

### 9. Reports

#### UC-R1: Generate HTML Report
- **Actors**: System
- **Description**: Build report from inspection payload post-submit.
- **Main Flow**: Client generates HTML; render preview.

#### UC-R2: Export PDF
- **Actors**: System
- **Description**: Produce PDF via server function or client print-to-PDF.
- **Main Flow**: Send HTML to service; receive PDF URL.

#### UC-R3: Share Report Link
- **Actors**: Inspector, Supervisor
- **Description**: Copy public link (signed/expiring) to share with stakeholders.
- **Main Flow**: Generate signed URL; copy to clipboard; show toast.

#### UC-R4: View Report History
- **Actors**: Supervisor
- **Description**: List previously generated reports with metadata.

---

### 10. Notifications

#### UC-N1: View Notifications
- **Actors**: Inspector
- **Description**: List notifications relevant to user/org/team.
- **Main Flow**: Query `operation_push_notification_view` (or equivalent) with topics filter.

#### UC-N2: Navigate from Notification
- **Actors**: Inspector
- **Description**: Open the linked inspection/work order/action from a notification.

---

### 11. Offline & Sync

#### UC-O1: Queue Mutation Offline
- **Actors**: System
- **Description**: When offline, stash mutations (submitInspection, createAction) with variables.
- **Main Flow**: Write to `action_queue` with timestamp and retry_count.

#### UC-O2: Background Sync on Reconnect
- **Actors**: System, Backend
- **Description**: Replay queue on network regain with backoff.
- **Main Flow**: FIFO processing; remove on success; increment retry on failure.

#### UC-O3: Conflict Handling (Basic)
- **Actors**: System
- **Description**: If server rejects (e.g., duplicate), mark item as failed and surface to user for manual resolution.

#### UC-O4: Media Upload with Retry
- **Actors**: System
- **Description**: Retry uploads with exponential backoff; resume on connectivity.

---

### 12. Settings & Localization

#### UC-S1: Switch Language (EN/AR)
- **Actors**: Inspector
- **Description**: Toggle UI language; enforce RTL for Arabic.

#### UC-S2: Toggle Theme
- **Actors**: Inspector
- **Description**: Switch between light/dark mode.

#### UC-S3: Manage Permissions
- **Actors**: Inspector
- **Description**: Grant camera/microphone/file permissions as needed.

#### UC-S4: Logout
- See UC-A3.

---

### 13. Analytics & Dashboard

#### UC-AN1: View Dashboard KPIs
- **Actors**: Supervisor, Inspector
- **Description**: Show counts of active inspections, pending actions, completed today.
- **Main Flow**: Aggregate queries and/or precomputed views; display KPI cards.

#### UC-AN2: Track Form Completion Stats
- **Actors**: Supervisor
- **Description**: Monitor inspection throughput, average scores, failure hot-spots.
- **Main Flow**: Client-side aggregates from recent inspections or server analytics endpoint.

---

### 14. Cross-Cutting Acceptance Criteria
- All required fields must be completed; photo/notes enforced for failed responses when configured.
- Drafts persist across page refresh and browser restarts.
- Offline submissions are queued and automatically synced within 60 seconds of reconnect.
- Reports include summary metrics, per-section results, photos, timestamps, and sign-off.
- Actions reflect correct state transitions and audit timestamps.
- RTL layout for Arabic is consistent across forms, dialogs, and tables.

### 15. Mappings to GraphQL (Examples)
- Auth: `isUserRegistered`, `getUserQuery`
- Config: `loadConfig`
- Templates: `api_mobile_templates`, aggregate
- Work Orders: `api_mobile_workorders`, `workorder_details`
- Inspections: `api_mobile_inspections` (list/history); custom `submitInspection` mutation for submissions
- Actions: custom `insert_actions_one`/`update_actions_by_pk`
- Notifications: `operation_push_notification_view` (topics filter)

Note: Actual mutations/fields may vary; adapt to the concrete schema available in `sample_data/successful_data/schema.json` and existing tables. Where write APIs are missing, add dedicated mutations (e.g., `insert_web_inspections_one`).


