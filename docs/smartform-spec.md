## SmartForm Specification (iAuditor/SafetyCulture–inspired)

Reference: This spec aligns with the Inspections product capabilities of SafetyCulture (formerly iAuditor) and adapts them to our stack and data. See: [SafetyCulture Platform – Inspections](https://safetyculture.com/platform/#inspections).

### 1) Goals and Scope

* **Goal**: A mobile-first, web-ready dynamic form engine (“SmartForm”) for inspections, audits, and checklists that mirrors SafetyCulture’s strengths: fast digitization of processes, guided data capture (notes, media), conditional logic, task follow-ups, reporting, and analytics.
* **Primary outcomes**:
  * Digitize any audit in minutes (template import/build, quick publishing)
  * Make completion effortless for frontline (simple UI, offline-first, autosave)
  * Turn findings into action (raise tasks from answers; triage failures)
  * Share results instantly (HTML/PDF reports, links)
  * Provide visibility (scoring, KPIs, export)
* **In scope (v1)**: Rendering, validation, logic, media capture, scoring, actions integration, draft autosave, offline queue, report generation, i18n/RTL.
* **Out of scope (v1)**: Advanced asset registry, enterprise SSO, complex workflow approvals.

### 2) Personas and Permissions

* **Inspector**: Completes forms; can attach media; can raise actions; can submit.
* **Supervisor**: Reviews submissions; manages actions; exports reports; monitors KPIs.
* **Permissions**:
  * Inspectors: R/W for own drafts and submissions; create actions on own submissions.
  * Supervisors: R/W across team; approve/publish reports; manage assignments.

### 3) Core Capabilities (mapped to SafetyCulture Inspections)

* **Template authoring/import**: Model supports sections, item types, response sets, conditional logic, scoring and media rules. Import/export aims to be iAuditor-compatible for round-trip where feasible.
* **Mobile-first completion**: Large tap targets, minimal friction, quick pass/fail/tags, inline evidence capture. Autosave after any change; indicator for offline state.
* **Conditional logic**: Show/hide, require-on-fail, dependent fields, and guidance text. Logic is evaluated in real time on answer changes.
* **Evidence capture**: Photos/files, notes, and tags per item. Photo-on-fail and notes-on-fail rules supported.
* **Actions/Tasks**: From any item or the summary, raise an action with assignee, due date, priority, and status; maintain traceability.
* **Scoring and thresholds**: Item weights and pass/fail definitions; section and overall scores; thresholds flag sections/items.
* **Review & submit**: A submit gate validates required answers and conditional evidence rules; shows a checklist of unresolved items.
* **Reports**: Auto-generate shareable HTML/PDF with branding, metadata, Q/A, evidence, and action summaries.
* **Analytics signals**: Emit summary metrics (pass/fail counts, scores, failed items, actions created) for dashboards.

### 4) Data Model

#### 4.1 TemplateJSON (internal canonical)

```json
{
  "id": "string",
  "name": "string",
  "version": 1,
  "locale": "en",
  "response_sets": {
    "rs-1": {
      "type": "single",
      "options": [
        { "id": "pass", "label": "Pass" },
        { "id": "fail", "label": "Fail" },
        { "id": "na", "label": "N/A" }
      ],
      "fail_ids": ["fail"]
    }
  },
  "sections": [
    {
      "id": "sec-1",
      "label": "Safety",
      "items": [
        {
          "id": "q-1",
          "label": "Fire extinguisher available",
          "type": "choice",
          "response_set_id": "rs-1",
          "required": true,
          "notes_enabled": true,
          "media_required_on_fail": true,
          "score": { "pass": 1, "fail": 0, "na": 0 },
          "logic": [
            {
              "when": { "equals": { "response_id": "fail" } },
              "require": ["photo", "notes"],
              "show": []
            }
          ],
          "help": "Attach photo if not available"
        }
      ]
    }
  ]
}
```

#### 4.2 Item types

* **choice**: single-select from `response_set_id`.
* **multi**: multi-select (tags/checkboxes) from `response_set_id`.
* **text**: free text with optional regex/length rules.
* **number**: numeric with min/max and units.
* **date/time**: date/time pickers.
* **photo/file**: one or more attachments.
* **signature**: canvas signature for sign-off.

#### 4.3 Logic rules

* Schema per item: `logic[]` with conditions on sibling/ancestor items.
* Supported operators: `equals`, `notEquals`, `in`, `notIn`, `exists`, `gt`, `lt`.
* Effects per rule: `show[]` (ids to make visible), `require[]` (fields to enforce: `answer`, `photo`, `notes`, `tags`).

#### 4.4 Scoring model

* Item-level `score` maps answer ids to numeric weights.
* Section score is sum of visible items unless specified otherwise.
* Overall score is sum or weighted average of section scores.
* Thresholds: optional per-section and overall thresholds to flag failures.

### 5) Runtime Validation and Submission Rules

* Block submit if any required answer is missing, or a rule-required `photo/notes/tags` is unmet.
* Hidden fields are excluded from validation and scoring by default; keep answers but do not score unless `score_hidden: true` at item level.
* When a failed response is selected and `media_required_on_fail = true`, enforce at least one photo and a note.
* Validate numeric/text constraints (min/max/regex).

### 6) UX and Interaction Requirements

* **Mobile-first layout**: one-column, large tap targets, sticky section headers, progress indicator.
* **Fast selection**: choice buttons (toggle/radio) with clear pass/fail/na styles.
* **Evidence capture**: inline camera/upload with thumbnail list and remove/reorder; note field toggle.
* **Quick actions**: on fail, show affordances to raise an action directly.
* **Review screen**: show unresolved items, failed items, and pending evidence; jump-to-item.
* **Accessibility**: keyboard navigable, ARIA roles/labels, contrast AA; RTL layout supported.

### 7) Logic Engine

* Event-driven evaluation on any answer change.
* Deterministic pass: evaluate in topological order of dependencies; if unknown, evaluate breadth-first and re-run until fixed point or max iterations.
* Preserve hidden answers but exclude from validation/scoring (default).
* Provide debug mode to visualize active rules and visibility state for QA.

### 8) Offline and Sync

* Autosave draft on every change to local storage (IndexedDB/Dexie on web).
* Queue submissions and media uploads when offline; retry with exponential backoff.
* Replace local file blobs with signed URLs after upload; maintain an attachments manifest in payload.
* Visual indicators: `In progress`, `Pending sync`, `Synced`.

### 9) API Contracts (example)

* Load templates and lists via GraphQL; persist submission payloads as JSON.
* Example submission mutation:

```graphql
mutation submitInspection($input: jsonb!) {
  insert_web_inspections_one(object: { payload: $input, status: "submitted" }) { id }
}
```

* Submission payload (shape):

```json
{
  "template_id": "tmpl-123",
  "workorder_id": 42,
  "answers": {
    "q-1": {
      "response_id": "fail",
      "notes": "Missing",
      "photos": [
        "https://storage.example.com/inspections/abc.jpg"
      ],
      "tags": ["urgent"]
    }
  },
  "score": { "sections": { "sec-1": 0 }, "total": 0 },
  "actions": [
    { "title": "Install extinguisher", "priority": "high", "assignee_uuid": "...", "due_date": "2025-05-30" }
  ],
  "meta": { "vehicle": "ABC-123", "user_uuid": "...", "locale": "en" },
  "timestamps": { "started_at": "...", "submitted_at": "..." }
}
```

### 10) Reports

* HTML report client-side; optional server PDF rendering.
* Contents: header (branding, template, inspector, org/asset), summary (score, pass/fail/na), sections with answers and evidence, actions appendix.
* Share via signed URL; support print-friendly styling.

### 11) Internationalization and RTL

* i18n catalogs for UI strings; template content carries its own locale.
* Full RTL layout with direction switching; date/number localization.

### 12) Security and Compliance

* JWT auth; transport over HTTPS/WSS.
* Signed URLs for media; short expiry and least-privilege scopes.
* Input sanitization and payload size limits; client-side redaction options for PII in reports.

### 13) Performance and Quality

* Initial form render < 1.5s on broadband; interaction latency < 100ms.
* Virtualize long forms; lazy-load media thumbnails.
* Image compression before upload; cap max attachments per item (configurable).
* Error tracking via Sentry; trace key events: autosave, submit, sync, upload.

### 14) Import/Export Compatibility (SafetyCulture alignment)

* Mapping goals:
  * Sections ↔ sections
  * Item types: choice/multi/text/number/date/photo/signature ↔ iAuditor equivalents
  * Logic: conditional show/hide, required-on-fail
  * Scoring: weights and thresholds
  * Media rules: photo-on-fail, notes-on-fail
* Round-trip fidelity targets: ≥95% of common templates without manual edits.

### 15) Acceptance Criteria (key)

* Selecting a failed response on an item with `media_required_on_fail` blocks submit until at least one photo and a note are provided.
* Hidden items never block submission by default and do not affect scores.
* Draft persists across refresh and browser crashes; restore on reopen.
* Offline submission enqueues and syncs automatically on reconnect; report is generated post-sync.
* Actions raised from failed items appear in the submission summary payload.
* Generated report contains correct scores and all attached evidence thumbnails.

### 16) MVP Deliverables

* v1.0
  * Render choice/text/number/date/photo/signature
  * Logic engine (show/hide, require-on-fail)
  * Scoring with per-item weights; section/total
  * Draft autosave and offline queue
  * Submit mutation and HTML report
  * Raise actions from failed items
  * i18n (en/ar) and RTL

—

This SmartForm spec is intentionally aligned with capabilities highlighted in SafetyCulture’s Inspections to ensure parity for digitized audits, rapid completion, instant reporting, and actionability. See: [SafetyCulture Platform – Inspections](https://safetyculture.com/platform/#inspections).


