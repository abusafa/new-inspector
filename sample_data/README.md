# GraphQL API Sample Data

This folder contains sample data extracted from the Inspector GraphQL API at `https://inspector-gql.tatweertransit.com/v1/graphql`.

## 📁 Folder Structure

```
sample_data/
├── successful_data/     # Successfully fetched data files
├── error_logs/         # Error responses for debugging
└── README.md          # This file
```

## 🔑 Authentication

The API uses Hasura admin secret authentication:
- Header: `x-hasura-admin-secret`
- Value: `uWkEPKJUF9hqC6Bj`

## 📊 Successfully Fetched Data

### Core Tables (with counts)

| Table Name | Records Fetched | Total Count | Description |
|------------|----------------|-------------|-------------|
| `answers_as_rows` | 10 | 80,292 | Inspection form answers |
| `api_mobile_bus` | 10 | 43,103 | Mobile app bus data |
| `api_mobile_inspections` | 10 | 3,368 | Mobile inspection records |
| `api_mobile_templates` | 10 | 33 | Mobile inspection templates |
| `api_mobile_workorders` | 10 | 76 | Mobile work orders |
| `bus` | 10 | 43,103 | Bus fleet information |

### Additional Tables

| Table Name | Records | Description |
|------------|---------|-------------|
| `dashboard_mobile_view` | 10 | Mobile dashboard data |
| `domain_reason` | 10 | Reason codes/categories |
| `drivers` | 10 | Driver information |
| `employee_push` | 10 | Push notification data |
| `examination_templates` | 10 | Inspection templates |
| `mobile_dashboard` | 3 | Mobile dashboard metrics |
| `mobile_reason` | 10 | Mobile-specific reasons |
| `templates_per_school` | 10 | School-specific templates |
| `workorder_details` | 10 | Work order line items |
| `workorders` | 10 | Work order records |

## 🔧 Data Structure Examples

### Bus Data
```json
{
  "bus_number": "2 5 4 6 ر ص ا",
  "bus_type_id": 1,
  "current_contract_id": 154,
  "current_contractor_id": 18,
  "domain_examination_type_id": 2
}
```

### Mobile Inspections
```json
{
  "id": 3356,
  "title": "فحص حافلات نقل عام 7743 ا ح م",
  "status": "لم يبدأ الفحص",
  "status_color": "0xff673ab7",
  "examination_template_id": 38,
  "actual_inspector": 417
}
```

### Drivers
```json
{
  "id": 5947585,
  "age": 34,
  "iqama_number": "107802169",
  "contract_id": 126,
  "contractor_id": 4
}
```

## 🛠 Tools Used

1. **explore_graphql.py** - Initial API exploration and schema download
2. **analyze_schema.py** - Schema analysis to understand available fields
3. **smart_fetch_data.py** - Intelligent data fetching using schema introspection

## 📈 API Statistics

- **Total Tables Explored**: 27
- **Successfully Fetched**: 16 tables
- **Failed Queries**: 11 (mostly missing tables or permission issues)
- **Total Records**: 160+ sample records
- **Schema Types**: 30+ GraphQL object types

## 🗂 File Types

- `*_sample.json` - Sample data (limit 10 records per table)
- `*_count.json` - Aggregate count queries
- `schema.json` - Complete GraphQL schema
- `schema_analysis.json` - Parsed schema with field details
- `smart_fetch_summary.json` - Execution summary

## 🚀 Usage for App Development

This data can be used to:

1. **Understand Data Models** - See actual field names and data types
2. **Build Mock APIs** - Use sample data for frontend development
3. **Design UI Components** - Understand data structure for forms and displays
4. **Plan Database Schema** - If building a local copy or cache
5. **Create Test Data** - Use as seed data for testing

## 🔍 Key Insights

- The system manages **43,103 buses** across multiple contracts
- **3,368 mobile inspections** have been recorded
- The system uses Arabic text for status messages and descriptions
- Each inspection is linked to templates and specific inspectors
- Work orders track maintenance and repair activities
- The system supports multiple contractors and contracts

## 📝 Notes

- Data is in production format with Arabic text
- Some fields contain null values (expected for optional fields)
- IDs are numeric and follow sequential patterns
- Timestamps are in standard formats
- JSON fields contain structured data for complex objects

---

*Data extracted on: 2025-01-27*
*API Endpoint: https://inspector-gql.tatweertransit.com/v1/graphql*
