#!/usr/bin/env python3
"""
Smart Hasura Data Fetcher
Uses introspection to discover field names and then fetches sample data properly.
"""

import requests
import json
import os
import time
from typing import Dict, Any, Optional, List

# GraphQL endpoint
GRAPHQL_URL = "https://inspector-gql.tatweertransit.com/v1/graphql"

class SmartDataFetcher:
    def __init__(self, url: str):
        self.url = url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Smart-DataFetcher/1.0',
            'x-hasura-admin-secret': 'uWkEPKJUF9hqC6Bj'
        })
        self.schema_types = {}
    
    def execute_query(self, query: str, variables: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
        """Execute a GraphQL query with optional variables."""
        payload = {'query': query}
        if variables:
            payload['variables'] = variables
            
        try:
            response = self.session.post(
                self.url,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error executing query: {e}")
            return None
    
    def get_type_fields(self, type_name: str) -> List[str]:
        """Get field names for a specific GraphQL type."""
        if not self.schema_types:
            self.load_schema_types()
        
        type_info = self.schema_types.get(type_name, {})
        fields = type_info.get('fields', [])
        
        # Return scalar fields only (avoid complex nested objects for now)
        scalar_fields = []
        for field in fields:
            field_type = self.get_base_type(field['type'])
            if field_type in ['String', 'Int', 'Float', 'Boolean', 'ID', 'bigint', 'uuid', 'timestamptz', 'jsonb', 'numeric']:
                scalar_fields.append(field['name'])
        
        return scalar_fields[:15]  # Limit to first 15 fields to avoid huge queries
    
    def get_base_type(self, type_def: Dict) -> str:
        """Extract the base type name from a GraphQL type definition."""
        if type_def.get('kind') == 'NON_NULL':
            return self.get_base_type(type_def['ofType'])
        elif type_def.get('kind') == 'LIST':
            return self.get_base_type(type_def['ofType'])
        else:
            return type_def.get('name', 'Unknown')
    
    def load_schema_types(self):
        """Load schema types from the previously saved schema file."""
        try:
            with open('sample_data/schema.json', 'r') as f:
                schema_data = json.load(f)
            
            types = schema_data['data']['__schema']['types']
            for type_def in types:
                if type_def['kind'] == 'OBJECT' and type_def['fields']:
                    self.schema_types[type_def['name']] = type_def
            
            print(f"📋 Loaded {len(self.schema_types)} object types from schema")
        except FileNotFoundError:
            print("❌ Schema file not found. Please run explore_graphql.py first.")
    
    def save_json(self, data: Any, filename: str, folder: str = "sample_data"):
        """Save data as JSON file in specified folder."""
        os.makedirs(folder, exist_ok=True)
        filepath = os.path.join(folder, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        print(f"Saved: {filepath}")

def main():
    fetcher = SmartDataFetcher(GRAPHQL_URL)
    
    print("🧠 Smart fetching sample data from Hasura tables...")
    print(f"📡 API: {GRAPHQL_URL}")
    
    # Tables that we know exist from the Hasura interface
    tables_to_fetch = [
        "answers_as_rows",
        "api_mobile_bus", 
        "api_mobile_inspections",
        "api_mobile_templates",
        "api_mobile_workorders",
        "bus",
        "dashboard_mobile_view",
        "domain_reason",
        "drivers",
        "employee_push",
        "examination_templates",
        "mobile_dashboard",
        "mobile_reason",
        "templates_per_school",
        "workorder_details",
        "workorders"
    ]
    
    successful_queries = 0
    failed_queries = 0
    
    print(f"\n📥 Fetching data from {len(tables_to_fetch)} tables...")
    
    for table_name in tables_to_fetch:
        print(f"\n🔄 Fetching: {table_name}")
        
        # Get field names for this table type
        fields = fetcher.get_type_fields(table_name)
        
        if not fields:
            print(f"❌ {table_name} - No scalar fields found")
            failed_queries += 1
            continue
        
        # Create query with actual field names
        fields_str = '\n    '.join(fields)
        query = f"""
        query get{table_name.replace('_', '').title()} {{
          {table_name}(limit: 10) {{
            {fields_str}
          }}
        }}
        """
        
        result = fetcher.execute_query(query)
        
        if result and 'errors' not in result:
            filename = f"{table_name}_sample.json"
            fetcher.save_json(result, filename)
            record_count = len(result.get('data', {}).get(table_name, []))
            print(f"✅ {table_name} - Success ({record_count} records)")
            successful_queries += 1
        else:
            print(f"❌ {table_name} - Failed")
            if result and 'errors' in result:
                error_msg = result['errors'][0].get('message', 'Unknown error')
                print(f"   Error: {error_msg}")
                # Save error for debugging
                filename = f"{table_name}_error.json"
                fetcher.save_json(result, filename)
            failed_queries += 1
        
        # Small delay to be respectful to the API
        time.sleep(0.3)
    
    # Try to get some aggregate counts
    print(f"\n📊 Fetching aggregate data...")
    
    for table_name in tables_to_fetch[:6]:  # Try first 6 tables
        print(f"\n🔄 Getting count for: {table_name}")
        
        count_query = f"""
        query get{table_name.replace('_', '').title()}Count {{
          {table_name}_aggregate {{
            aggregate {{
              count
            }}
          }}
        }}
        """
        
        result = fetcher.execute_query(count_query)
        
        if result and 'errors' not in result:
            filename = f"{table_name}_count.json"
            fetcher.save_json(result, filename)
            count = result.get('data', {}).get(f'{table_name}_aggregate', {}).get('aggregate', {}).get('count', 0)
            print(f"✅ {table_name} - Count: {count}")
            successful_queries += 1
        else:
            print(f"❌ {table_name} - Count failed")
            failed_queries += 1
        
        time.sleep(0.2)
    
    print(f"\n🎉 Smart data fetching completed!")
    print(f"✅ Successful queries: {successful_queries}")
    print(f"❌ Failed queries: {failed_queries}")
    print(f"📁 All data saved in the 'sample_data' folder")
    
    # Create a summary file
    summary = {
        "api_endpoint": GRAPHQL_URL,
        "authentication": "x-hasura-admin-secret",
        "total_tables": len(tables_to_fetch),
        "successful_queries": successful_queries,
        "failed_queries": failed_queries,
        "tables_fetched": tables_to_fetch,
        "fetch_timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    fetcher.save_json(summary, "smart_fetch_summary.json")
    print(f"📋 Summary saved to: sample_data/smart_fetch_summary.json")

if __name__ == "__main__":
    main()
