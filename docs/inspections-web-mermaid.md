## Mermaid Diagrams: Inspections Web App

### 1) System Architecture (High-Level)
```mermaid
graph TD
  A["Inspector & Supervisor (Browser)"] --> B["React + shadcn/ui App"]
  B --> C["Apollo Client"]
  C --> D["Hasura GraphQL API"]
  D --> E[(Primary Database)]
  B --> F["IndexedDB (Dexie)<br/>Drafts / Media / Queue"]
  B --> G["i18next / RTL"]
  B --> H["Media Capture<br/>(Camera/Upload)"]
  H --> I[("Object Storage<br/>S3 or similar")]
  D --> I
  D --> J["Notification View / Topics"]
  B --> K["PDF Service<br/>(Serverless/Node Chromium)"]
  K --> L[("Report Storage / CDN")]
  A -->|Download/View| L
  A -->|OTP| M["Auth / OTP Service"]
  M --> D
```

### 2) Frontend Module Architecture
```mermaid
graph LR
  subgraph UI
    P["Pages: Login / Dashboard / Templates / Work Orders / Inspection / Actions / Reports / Notifications / Settings"]
    Cmp["Components: DataTable / Dialogs / Forms / Media / Tags"]
  end
  subgraph Core
    FE["Form Engine"]
    VAL["Validation (Zod)"]
    I18N["i18next"]
    THEME["Theme (Light/Dark)"]
    SHAD["shadcn/ui"]
  end
  subgraph Data
    AC["Apollo Client"]
    DX["Dexie (IndexedDB)"]
    UP[Uploader]
  end
  P --> Cmp
  Cmp --> FE
  FE --> VAL
  FE --> AC
  FE --> DX
  UP --> AC
  UP -->|Signed URL| ST[(Object Storage)]
  AC --> GQL["Hasura GraphQL"]
  I18N --> P
  THEME --> P
  SHAD --> Cmp
```

### 3) App Navigation Flow
```mermaid
flowchart LR
  Login["Login (OTP)"] --> Dashboard
  Dashboard --> Templates
  Dashboard --> WorkOrders
  Dashboard --> Inspections
  Dashboard --> Actions
  Dashboard --> Reports
  Dashboard --> Notifications
  Dashboard --> Settings
  WorkOrders -->|Start| InspectionForm
  Templates -->|Start| InspectionForm
  InspectionForm --> ReviewSubmit
  ReviewSubmit --> Reports
```

### 4) Inspection Lifecycle (Sequence)
```mermaid
sequenceDiagram
  participant U as "User"
  participant FB as "FormBuilder (UI)"
  participant DX as "Dexie (IndexedDB)"
  participant UP as "Uploader"
  participant S as "Storage (S3)"
  participant G as "GraphQL API"
  participant DB as "DB"
  participant PDF as "PDF Service"

  U->>FB: Start inspection (select template/work order)
  FB->>DX: Create draft (status: in_progress)
  U->>FB: Answer questions / add photos
  FB->>DX: Autosave answers and media refs
  par Online upload
    FB->>UP: Enqueue media upload
    UP->>S: PUT object (signed URL)
    S-->>UP: URL
    UP->>DX: Replace local refs with remote URLs
  end
  U->>FB: Submit
  FB->>DX: Ensure all uploads complete
  FB->>G: mutation submitInspection(payload)
  G->>DB: Persist inspection
  G-->>FB: OK (id)
  FB->>PDF: Generate report (HTML->PDF)
  PDF-->>FB: Report URL
  FB->>DX: Mark draft synced & store report link
```

### 5) Offline Sync State Machine
```mermaid
stateDiagram-v2
  [*] --> DraftInProgress
  DraftInProgress --> PendingSync: Submit while offline
  DraftInProgress --> Submitting: Submit online
  Submitting --> Synced: 200 OK
  Submitting --> PendingSync: Network/API error
  PendingSync --> Syncing: Network restored
  Syncing --> Synced: Success
  Syncing --> PendingSync: Retry with backoff
  Synced --> [*]
```

### 6) Template Model (Internal) and Mapping
```mermaid
classDiagram
  class TemplateJSON {
    id: string
    name: string
    version: number
    locale: string
    response_sets: map
    sections: Section[]
  }
  class ResponseSet {
    type: single|multi|text|number
    options: ResponseOption[]
  }
  class ResponseOption {
    id: string
    label: string
    value?: string
  }
  class Section {
    id: string
    label: string
    items: Item[]
  }
  class Item {
    id: string
    label: string
    type: choice|multi|text|number|date|photo|tag
    response_set_id?: string
    required?: boolean
    score?: ScoreRule
    logic?: LogicRule[]
  }
  class ScoreRule {
    pass?: number
    fail?: number
  }
  class LogicRule {
    when: Cond
    require: string[]
    show: string[]
  }

  TemplateJSON o-- Section
  TemplateJSON o-- ResponseSet
  ResponseSet o-- ResponseOption
  Section o-- Item
```

### 7) Actions Workflow
```mermaid
flowchart LR
  Open[[open]] --> InProgress[[in_progress]]
  InProgress --> Done[[done]]
  Open --> Done
  Open -.-> Cancelled[[cancelled]]
  InProgress -.-> Blocked[[blocked]]
  classDef green fill:#c6f6d5,stroke:#2f855a
  classDef red fill:#fed7d7,stroke:#c53030
  classDef yellow fill:#fefcbf,stroke:#b7791f
  class Done green
  class Blocked red
  class Open,InProgress yellow
```

### 8) Report Generation Flow
```mermaid
flowchart TB
  A[Inspection submitted] --> B[Assemble HTML report]
  B --> C{Generate PDF?}
  C -- Yes --> D[Render via headless Chromium]
  D --> E[Upload PDF to storage]
  E --> F[Store URL on inspection]
  C -- No --> G[Share HTML link]
  F --> H[Share link to stakeholders]
  G --> H
```

### 9) GraphQL Operations Map
```mermaid
graph TD
  subgraph Queries
    Q1[isUserRegistered]
    Q2[getUserQuery]
    Q3[loadConfig]
    Q4[api_mobile_templates]
    Q5[api_mobile_workorders]
    Q6[api_mobile_inspections]
    Q7[operation_push_notification_view]
  end
  subgraph Mutations
    M1[submitInspection]
    M2[createAction]
    M3[updateAction]
  end
  App[Frontend] --> Q1
  App --> Q2
  App --> Q3
  App --> Q4
  App --> Q5
  App --> Q6
  App --> Q7
  App --> M1
  App --> M2
  App --> M3
```

### 10) Local Data Model (IndexedDB)
```mermaid
erDiagram
  DRAFTS ||--o{ ANSWERS : contains
  DRAFTS {
    string id PK
    number workorder_id
    string template_id
    string status
    datetime created_at
    datetime updated_at
    json meta
  }
  ANSWERS {
    string id PK
    string draft_id FK
    string item_id
    json value
    json photos
    string notes
  }
  ACTION_QUEUE {
    string id PK
    string mutation_name
    json variables
    number retry_count
    datetime timestamp
  }
  MEDIA {
    string id PK
    string draft_id FK
    string local_url
    string remote_url
    string status
  }
```


