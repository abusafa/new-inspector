# Template Management API

## Overview

The enhanced template management system provides a comprehensive set of APIs for creating, managing, and building inspection templates inspired by SafetyCulture (iAuditor). This system includes advanced features like template versioning, categorization, validation, and a visual builder interface.

## Core Features

### ✅ Template CRUD Operations
- Advanced filtering and search
- Pagination support
- Category and tag management
- Status management (draft/published/archived)

### ✅ Template Builder
- Drag-and-drop component system
- Real-time template validation
- Preview functionality
- Pre-built template patterns

### ✅ Version Control
- Template versioning with history
- Parent-child relationships
- Latest version tracking

### ✅ Template Library
- Categories and tags
- Public/private templates
- Usage analytics
- Template duplication

## API Endpoints

### Template Management

#### `GET /templates`
List templates with advanced filtering and pagination.

**Query Parameters:**
- `category`: Filter by category
- `status`: Filter by status (draft/published/archived)
- `search`: Search in name and description
- `tags`: Filter by tags (array)
- `industry`: Filter by industry
- `equipmentType`: Filter by equipment type
- `createdBy`: Filter by creator
- `isPublic`: Filter by public/private status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field (createdAt/updatedAt/name/category)
- `sortOrder`: Sort order (asc/desc)

**Example:**
```bash
GET /templates?category=Safety&status=published&page=1&limit=10&sortBy=updatedAt&sortOrder=desc
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "templateId": "TPL-123456789",
      "name": "Daily Forklift Safety Check",
      "description": "Pre-use safety checklist",
      "category": "Safety",
      "tags": ["forklift", "safety", "daily"],
      "version": "1.0.0",
      "status": "published",
      "isPublic": true,
      "createdBy": "user-id",
      "estimatedDuration": 15,
      "difficulty": "easy",
      "industry": "Manufacturing",
      "equipmentType": "Forklift",
      "usageCount": 25,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### `GET /templates/categories`
Get all available template categories with counts.

**Response:**
```json
[
  { "name": "Safety", "count": 15 },
  { "name": "Quality", "count": 8 },
  { "name": "Maintenance", "count": 12 }
]
```

#### `GET /templates/tags`
Get all available tags with usage counts.

**Response:**
```json
[
  { "name": "safety", "count": 20 },
  { "name": "forklift", "count": 5 },
  { "name": "daily", "count": 15 }
]
```

#### `GET /templates/:id`
Get a specific template with full details and usage statistics.

#### `GET /templates/:id/preview`
Preview and validate a template structure.

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "template": { /* template schema */ },
  "metadata": {
    "totalQuestions": 8,
    "totalSections": 3,
    "estimatedDuration": 15,
    "difficulty": "easy"
  }
}
```

#### `GET /templates/:id/versions`
Get all versions of a template.

#### `POST /templates`
Create a new template.

**Body:**
```json
{
  "name": "New Safety Template",
  "description": "Template description",
  "category": "Safety",
  "tags": ["safety", "inspection"],
  "schemaJson": { /* template schema */ },
  "estimatedDuration": 20,
  "difficulty": "medium",
  "industry": "Construction",
  "equipmentType": "Crane"
}
```

#### `POST /templates/:id/duplicate`
Duplicate an existing template.

**Body:**
```json
{
  "name": "Copy of Original Template",
  "description": "Duplicated template",
  "category": "Safety",
  "createdBy": "user-id"
}
```

#### `POST /templates/:id/new-version`
Create a new version of an existing template.

**Body:**
```json
{
  "version": "2.0.0",
  "createdBy": "user-id"
}
```

#### `PUT /templates/:id`
Update a template.

#### `PUT /templates/:id/publish`
Publish a draft template (validates schema first).

#### `PUT /templates/:id/archive`
Archive a template.

#### `DELETE /templates/:id`
Delete a template (only if not used in inspections).

### Template Builder

#### `GET /template-builder/components`
Get available template components for the builder.

**Response:**
```json
[
  {
    "id": "multiple_choice",
    "type": "question",
    "name": "Multiple Choice",
    "description": "Yes/No or multiple option questions",
    "icon": "check-circle",
    "category": "Questions",
    "defaultConfig": {
      "type": "question",
      "label": "New Question",
      "options": { "required": true },
      "response_set": {
        "type": "multiple-choice",
        "responses": [
          { "id": "resp_yes", "label": "Yes", "score": 1, "color": "green" },
          { "id": "resp_no", "label": "No", "score": 0, "color": "red" }
        ]
      }
    }
  }
]
```

#### `GET /template-builder/patterns`
Get pre-built template patterns.

**Response:**
```json
[
  {
    "id": "safety_inspection",
    "name": "Safety Inspection",
    "description": "Comprehensive workplace safety checklist",
    "category": "Safety",
    "icon": "shield",
    "estimatedDuration": 15
  }
]
```

#### `POST /template-builder/generate/:patternType`
Generate a template from a pre-built pattern.

**Body:**
```json
{
  "name": "Custom Safety Template",
  "description": "Customized safety inspection",
  "templateId": "TPL-custom-123"
}
```

#### `POST /template-builder/:templateId/operations`
Apply multiple builder operations to a template.

**Body:**
```json
{
  "operations": [
    {
      "type": "add",
      "parentId": "section_001",
      "position": 0,
      "data": {
        "type": "question",
        "label": "New safety question"
      }
    },
    {
      "type": "update",
      "targetId": "question_001",
      "data": {
        "label": "Updated question text"
      }
    }
  ]
}
```

#### `POST /template-builder/:templateId/add-component`
Add a component to a template.

**Body:**
```json
{
  "componentType": "multiple_choice",
  "parentId": "section_001",
  "position": 1,
  "customConfig": {
    "label": "Custom question text"
  }
}
```

#### `PUT /template-builder/:templateId/update-item/:itemId`
Update a specific template item.

#### `POST /template-builder/:templateId/duplicate-item/:itemId`
Duplicate a template item.

#### `POST /template-builder/:templateId/move-item/:itemId`
Move a template item to a new position.

#### `POST /template-builder/:templateId/delete-item/:itemId`
Delete a template item.

## Template Schema Structure

### Header Items
```json
{
  "item_id": "unique_id",
  "type": "datetime|text|number",
  "label": "Display label",
  "options": {
    "required": true,
    "default_to_current_time": true,
    "placeholder": "Enter value...",
    "min": 0,
    "max": 100
  }
}
```

### Question Types

#### Multiple Choice
```json
{
  "item_id": "question_001",
  "type": "question",
  "label": "Question text",
  "options": { "required": true },
  "response_set": {
    "type": "multiple-choice",
    "responses": [
      { "id": "yes", "label": "Yes", "score": 1, "color": "green" },
      { "id": "no", "label": "No", "score": 0, "color": "red" }
    ]
  }
}
```

#### Rating Scale
```json
{
  "item_id": "rating_001",
  "type": "question",
  "label": "Rate this item",
  "options": { 
    "required": true,
    "min_rating": 1,
    "max_rating": 5
  },
  "response_set": {
    "type": "rating",
    "responses": [
      { "id": "rating_1", "label": "1", "score": 1, "color": "red" },
      { "id": "rating_5", "label": "5", "score": 5, "color": "green" }
    ]
  }
}
```

#### Text Input
```json
{
  "item_id": "text_001",
  "type": "text",
  "label": "Enter details",
  "options": {
    "required": false,
    "allow_photos": true,
    "placeholder": "Enter your response..."
  }
}
```

#### Conditional Logic
```json
{
  "item_id": "conditional_item",
  "type": "text",
  "label": "Describe the issue",
  "parent_id": "parent_question",
  "conditions": [
    {
      "field": "response",
      "operator": "is",
      "value": "resp_no"
    }
  ],
  "options": {
    "required": true,
    "allow_photos": true
  }
}
```

## Enhanced Features

### Template Validation
- Real-time schema validation
- Required field checking
- Logical consistency validation
- Preview mode with error reporting

### Version Control
- Automatic version tracking
- Parent-child relationships
- History preservation
- Latest version identification

### Usage Analytics
- Template usage counts
- Performance metrics
- Popular components tracking
- User engagement statistics

### Advanced Search
- Full-text search in names and descriptions
- Multi-tag filtering
- Category-based organization
- Industry and equipment type filtering

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

```json
{
  "statusCode": 400,
  "message": "Invalid template schema",
  "error": "Bad Request",
  "details": [
    {
      "property": "items[0].label",
      "constraints": {
        "isString": "label must be a string"
      }
    }
  ]
}
```

## Integration with Frontend

The template management system is designed to work seamlessly with the existing inspection app:

1. **Template Selection**: Enhanced template library with filtering
2. **Form Rendering**: Backward compatible with existing form components
3. **Builder Interface**: New visual builder for template creation
4. **Preview Mode**: Real-time template preview and validation

This comprehensive template management system provides all the tools needed for creating, managing, and deploying sophisticated inspection templates similar to SafetyCulture's iAuditor platform.


