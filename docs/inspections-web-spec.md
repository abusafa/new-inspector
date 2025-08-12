### Full Product and Technical Specs: Inspections Web App (React + shadcn/ui + GraphQL), iAuditor-Compatible

- Inspired by SafetyCulture (iAuditor) for inspections, actions, reports, and analytics. We will support importing/exporting compatible templates and a similar UX for users conducting inspections, capturing issues, assigning actions, and generating shareable reports. Reference: [SafetyCulture (iAuditor)](https://safetyculture.com/iauditor/).

## 1) Goals and Scope
- **Goal**: Web-first inspections app to manage work orders, perform inspections via dynamic forms, attach media, assign actions, and publish reports. Templates will be iAuditor-compatible for import/export.
- **Stack**: React + TypeScript, shadcn/ui (Radix), Apollo Client (GraphQL), React Hook Form + Zod, i18next, IndexedDB (Dexie) for drafts/offline queue, Vite, Tailwind.
- **GraphQL endpoint**: `https://inspector-gql.tatweertransit.com/v1/graphql` (JWT auth).
- **In-scope (v1)**:
  - OTP login and session
  - Dashboard KPIs and recent work
  - Templates (browse/import/export iAuditor-compatible)
  - Work orders list + details
  - Dynamic inspection form (sections, logic, response sets, scoring)
  - Photos/files (camera/upload), notes, tags
  - Draft autosave and offline queue; background sync
  - Actions/Tasks assignment (follow-ups)
  - Reports (PDF/HTML) and share links
  - Notifications list
  - Arabic/English + RTL
- **Out-of-scope (v1)**:
  - BLE; advanced GPS tracking
  - Admin template builder (authoring) beyond basic field edit
  - Enterprise SSO; deep asset mgmt
- **References mirrored from iAuditor features**: Inspections, Actions, Issues, Reports, Analytics, Team management [SafetyCulture (iAuditor)](https://safetyculture.com/iauditor/).

## 2) Users and Permissions
- **Inspector**: Perform inspections; create issues/actions; submit reports.
- **Supervisor**: Review KPIs, inspections, reports; manage actions.
- **Permissions**:
  - Inspectors: R/W on self inspections/actions; R on assigned work orders/templates.
  - Supervisors: R/W on team; manage assignments; publish reports.

## 3) UX and Screens (shadcn/ui components noted)
- **Auth**
  - Login (mobile + OTP). Components: `Card`, `Input`, `Button`, `Form`, `Alert`, `Toast`.
- **Dashboard**
  - KPIs: active inspections, pending actions, completed today; recent items stream.
  - Components: `Card`, `Tabs`, `Tooltip`, `Skeleton`.
- **Templates**
  - Browse templates; import/export iAuditor format; preview sections/questions.
  - Components: `DataTable`, `Dialog`, `Sheet`, `DropdownMenu`, `Command`.
- **Work Orders**
  - List with filters; details pane (bus/vehicle, due date, status).
  - Components: `DataTable`, `Badge`, `Separator`, `ScrollArea`.
- **Start Inspection**
  - Choose work order + template; prefill metadata (vehicle, route, etc.).
  - Components: `Dialog`, `Form`, `Select`, `Calendar` (date).
- **Inspection Form (Core)**
  - Sections; questions; conditional visibility; required checks; scoring; notes; photos; tags.
  - Media capture via webcam/upload; thumbnails; remove/reorder.
  - Autosave draft; offline indicator.
  - Components: `Form`, `Accordion`, `Tabs`, `Textarea`, `Popover`, `ToggleGroup`, `RadioGroup`, `Checkbox`, `Select`, `Tag input` (custom), `Dropzone` (custom), `Progress`, `Toast`.
- **Issues and Actions**
  - From any question, raise issue and/or assign action (assignee, due date, priority).
  - Components: `Dialog`, `Form`, `Select`, `Badge`, `Tooltip`.
- **Review & Submit**
  - Summary: failed/NA items, attachments, notes; resolve blockers; sign-off; submit.
  - If offline, enqueue; show sync status.
  - Components: `Card`, `Alert`, `Button`, `Signature` (canvas), `Toast`.
- **Reports**
  - Auto-generated HTML/PDF; branding, metadata, answers, photos; share link.
  - Components: `Tabs`, `Button`, `DropdownMenu`, `Toast`.
- **Notifications**
  - List of recent push/ops notifications.
  - Components: `DataTable`, `Badge`.
- **Settings/Profile**
  - Language, theme, camera/mic permissions, logout.
  - Components: `Select`, `Switch`, `Button`.

## 4) Template Compatibility (iAuditor-aligned)
- Support import/export of templates compatible with iAuditor, including:
  - Sections, questions, types, response sets, conditional logic, required rules, media fields, scoring weights, guidance text.
- Internally we normalize to our `TemplateJSON` closely mirroring SafetyCulture constructs so round-trip is lossless. Inspired by: setup forms with logic and media; fast completion and conditional fields [SafetyCulture (iAuditor)](https://safetyculture.com/iauditor/).

### TemplateJSON (internal)
```json
{
  "id": "string",
  "name": "string",
  "version": 1,
  "locale": "ar",
  "response_sets": {
    "1": { "type": "single", "options": [{ "id": "7", "label": "نعم" }, { "id": "9", "label": "تجاوز" }, { "id": "0", "label": "لا ينطبق" }] }
  },
  "sections": [
    {
      "id": "sec-1",
      "label": "الأمن و السلامة",
      "items": [
        {
          "id": "65",
          "label": "طفاية الحريق متوفرة",
          "type": "choice",
          "response_set_id": "1",
          "required": true,
          "media_required_on_fail": true,
          "notes_enabled": true,
          "score": { "pass": 1, "fail": 0 },
          "logic": [{ "when": { "response_id": "9" }, "require": ["photo", "notes"], "show": [] }]
        }
      ]
    }
  ]
}
```

### iAuditor Template Mapping (import/export)
- Section ↔ Section
- Item types:
  - choice ↔ multiple_choice/single_select
  - text ↔ text
  - number ↔ number (with min/max)
  - date/time ↔ date/time
  - photo ↔ media/photo
  - checkbox ↔ boolean/multi
  - tag ↔ choices with multi-select tags
- Logic: conditional show/hide based on response; required-on-fail flows.
- Scoring: per-item weights, category totals, overall score.
- Media rules: photo required on fail.
- Metadata: template id/version/name/locale.

## 5) Data and GraphQL API
- Use Apollo Client; auth header `Authorization: Bearer <token>`.
- Endpoint: `https://inspector-gql.tatweertransit.com/v1/graphql`.

### Auth
```graphql
query isUserRegistered($type: String!, $username: String!) {
  sendOtp(params: { mobile: $username }) { message }
  users: etl_users_aggregate(where: { type: { _eq: $type }, username: { _eq: $username } }) {
    aggregate { count }
  }
}

query getUserQuery($username: String!, $otp: String!) {
  users: etl_users_with_otp(where: { username: { _eq: $username }, otp: { _eq: $otp } }) {
    uuid name name_ar name_en mobile_number type token org_uuid business_uuid
  }
}
```

### Config and Translations
```graphql
query loadConfig {
  gql: etl_config_gql { name query type }
  translations: etl_config_translations { name en ar }
}
```

### Templates
- List/count (samples exist in `api_mobile_templates_*`):
```graphql
query templatesList($limit: Int = 50, $offset: Int = 0) {
  api_mobile_templates(limit: $limit, offset: $offset) {
    id title icon description: info
  }
  api_mobile_templates_aggregate { aggregate { count } }
}
```
- Single template details:
  - If stored as JSON in a field, fetch and normalize to `TemplateJSON`.
  - Support import/export via mutations to a `templates` table or storage bucket as needed.

### Work Orders
```graphql
query workorders($status_ids: [Int!], $limit: Int = 50, $offset: Int = 0) {
  api_mobile_workorders(where: { status_id: { _in: $status_ids } }, limit: $limit, offset: $offset) {
    id status status_id title sub_title time workorders_status workorders_status_id
  }
  api_mobile_workorders_aggregate { aggregate { count } }
}

query workorderDetails($id: Int!) {
  workorder_details(where: { workorder_id: { _eq: $id } }, limit: 200) {
    id description qty unit price
  }
}
```

### Inspections
```graphql
query inspectionsList($limit: Int = 50, $offset: Int = 0) {
  api_mobile_inspections(limit: $limit, offset: $offset, order_by: { id: desc }) {
    id title sub_title status status_id time workorder_id workorders_status
  }
  api_mobile_inspections_aggregate { aggregate { count } }
}
```

### Notifications
```graphql
query getNotifications($_contains: [String!]!) {
  notifications: operation_push_notification_view(
    where: { topics: { _has_keys_any: $_contains } }
    order_by: { created_at: desc }
    limit: 100
  ) {
    uuid title text sent_at created_at
  }
}
```

### Mutations (saving inspections, actions)
- Persist inspection submission to a GraphQL mutation that your backend exposes; if not present, create a new `insert_inspection` mutation accepting our normalized payload:
```graphql
mutation submitInspection($input: jsonb!) {
  insert_web_inspections_one(object: { payload: $input, status: "submitted" }) { id }
}
```
- Actions/Tasks:
```graphql
mutation createAction($inspection_id: Int!, $title: String!, $assignee_uuid: uuid, $priority: String, $due_date: timestamptz) {
  insert_actions_one(object: { inspection_id: $inspection_id, title: $title, assignee_uuid: $assignee_uuid, priority: $priority, due_date: $due_date, status: "open" }) { id }
}
```
- Media uploads: use signed URL flow (S3/GCS) or GraphQL file upload endpoint; store URLs in the inspection payload. Sample `attachments` in data indicate S3 URLs exist.

## 6) Frontend State and Offline
- **Apollo Client** for server cache; **Dexie (IndexedDB)** for:
  - `drafts`: inspection form in-progress state per work order
  - `media`: local blobs/URLs, upload status
  - `action_queue`: mutations with exponential backoff
- **Autosave** every change; recover from crashes.
- **Sync service**: on connectivity regain, process queue FIFO; update UI with `synced/pending` badges.

## 7) Dynamic Form Engine
- Render from `TemplateJSON`:
  - Sort by section → item order.
  - For `choice` items, use `RadioGroup`/`ToggleGroup`.
  - For `multi` items, use `Checkbox` groups.
  - Validate required, numeric ranges, regex for text.
  - Conditional logic evaluated on change; hidden answers are preserved but excluded from scoring unless configured otherwise.
  - Scoring: accumulate per item; compute section and total; display as progress ring/bar.
  - Photo-on-fail: enforce photo+notes when selected response ∈ failed set.
- Accessibility: labels/ids, keyboard nav, ARIA; RTL flip via `dir="rtl"`.

## 8) Reports
- Generate HTML report client-side; server-side function for PDF (Node headless Chromium or serverless function).
- Contents:
  - Header: branding, template, inspector, org, vehicle
  - Summary: score, counts (pass/fail/na), actions raised
  - Sections with Q/A, notes, thumbnails
  - Appendix: full-size images (optional)
- Share: signed URL to stored PDF/HTML; copy link.

## 9) Notifications
- Poll or subscribe (if supported) and list recent items with timestamps.
- Link to related inspection/work order.

## 10) Security and Compliance
- JWT stored in `sessionStorage` by default; optionally in memory + refresh token pattern.
- HTTPS/WSS only; role-based access at Hasura.
- Validate and sanitize all user input.
- Media privacy: signed URLs, short expiry.
- Audit trail: local timestamps; include device/browser info in payload metadata.

## 11) Internationalization and RTL
- i18next with `en` and `ar`; string catalogs from `loadConfig`.
- RTL switching; evaluate date/time/number localizations.
- Font stack supporting Arabic.

## 12) UI Components (shadcn/ui selection)
- Layout: `AppShell` with `Sidebar` + `Topbar`
- Data: `DataTable`, `Tabs`, `Badge`, `Tooltip`, `Skeleton`, `Pagination`
- Forms: `Form`, `Input`, `Select`, `RadioGroup`, `Checkbox`, `ToggleGroup`, `Textarea`, `Slider`, `DatePicker`
- Overlays: `Dialog`, `Drawer/Sheet`, `Popover`, `AlertDialog`, `Toast`
- Media: custom `Dropzone`, `CameraCapture` (MediaDevices), `Carousel` for images

## 13) Non-Functional Requirements
- Performance: initial load < 2s on broadband; form interactions < 100ms; image compression before upload.
- Reliability: no data loss on refresh; draft recoverable; sync retries with backoff.
- Accessibility: WCAG 2.1 AA.
- Browser support: last 2 versions Chrome/Edge/Safari/Firefox; Safari iOS latest.
- Observability: Sentry for errors; simple analytics (page/form events).

## 14) Data Models (frontend types)
```ts
type Template = { id: string; name: string; version: number; locale: 'en'|'ar'; response_sets: Record<string, ResponseSet>; sections: Section[] };
type Section = { id: string; label: string; items: Item[] };
type Item = { id: string; label: string; type: 'choice'|'multi'|'text'|'number'|'date'|'photo'|'tag'; response_set_id?: string; required?: boolean; score?: { pass?: number; fail?: number }; logic?: LogicRule[]; };
type Answer = { item_id: string; response_id?: string; values?: string[]; text?: string; number?: number; notes?: string; photos?: string[]; tags?: string[] };
type DraftInspection = { id: string; workorder_id: number; template_id: string; status: 'in_progress'|'pending_sync'|'synced'; answers: Record<string, Answer>; meta: Record<string, unknown>; created_at: string; updated_at: string };
type Action = { id: string; inspection_id: string; title: string; assignee_uuid?: string; priority?: 'low'|'medium'|'high'; due_date?: string; status: 'open'|'in_progress'|'done' };
```

## 15) Import/Export Contracts (iAuditor compatibility)
- Import accepts iAuditor JSON; mapping to `TemplateJSON`.
- Export produces iAuditor JSON with:
  - `metadata` (name, version, locale)
  - `items` array with hierarchical sections/questions
  - `logic` rules in iAuditor syntax (show_if, required_if)
  - `responses` and `scores`
- Round-trip tests on sample templates.

## 16) Validation and Scoring Rules
- Block submit if any required unanswered or photo-on-fail unmet.
- Highlight first invalid; jump-to-section.
- Compute totals; if section threshold fails, mark section red and suggest actions.

## 17) Actions Workflow
- Create from question or global
- Fields: title, description, assignee, due date, priority, attachments
- Status transitions: open → in_progress → done; comments thread
- Supervisor dashboard: list, filters, bulk actions.

## 18) Build, Test, Deployment
- Tooling: Vite + TS + ESLint + Prettier + Vitest/RTL
- CI: lint, type-check, unit/integration tests; preview deploy
- Hosting: static frontend (Netlify/Vercel); backend GraphQL already hosted
- Secrets: runtime env via `.env` injection; no secrets in repo

## 19) MVP Deliverables and Milestones
- M1: Auth + Dashboard + Templates list/import
- M2: Work orders + Start inspection + Draft autosave
- M3: Dynamic form (choice/text/number/date/photo/tags) + validation + scoring
- M4: Actions + Reports (HTML/PDF)
- M5: Offline queue + Sync + Notifications
- M6: i18n/RTL + A11y + Polishing

## 20) Acceptance Criteria (samples)
- Login requests OTP; successful OTP returns token; token persisted; guarded routes enforced.
- Import iAuditor template and render form with correct sections/questions and logic.
- On selecting a “fail” response where photo-on-fail is set, user cannot submit without at least one photo and a note.
- Draft persists across refresh; can resume; offline submit enqueues; sync on reconnect.
- Report includes summary metrics, per-question answers, photos; downloadable PDF.
- Create action from failed item; action visible in Actions list with correct metadata.

## 21) Example Client Queries (frontend)
```ts
// Apollo setup
const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

// Fetch templates
gql`
  query Templates($limit: Int = 50, $offset: Int = 0) {
    api_mobile_templates(limit: $limit, offset: $offset) {
      id title icon info
    }
    api_mobile_templates_aggregate { aggregate { count } }
  }
`;
```

## 22) Risks and Mitigations
- Template mismatch with iAuditor: implement robust import/export mappers; add unit tests on real samples.
- Media uploads on poor networks: compress client-side, chunk uploads, retry queue.
- GraphQL schema gaps: define fallback `insert_web_inspections_one` and actions mutations or adapt to existing tables.

Reference for feature parity and UX alignment: inspections builder and conditional logic; actions follow-ups; reports; issues capture; analytics dashboards [SafetyCulture (iAuditor)](https://safetyculture.com/iauditor/).


