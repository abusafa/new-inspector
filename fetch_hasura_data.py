#!/usr/bin/env python3
"""
Hasura Data Fetcher
Fetches sample data from all available tables and views in the Hasura GraphQL API.
"""

import requests
import json
import os
import time
from typing import Dict, Any, Optional

# GraphQL endpoint
GRAPHQL_URL = "https://inspector-gql.tatweertransit.com/v1/graphql"

class HasuraDataFetcher:
    def __init__(self, url: str):
        self.url = url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Hasura-DataFetcher/1.0',
            'x-hasura-admin-secret': 'uWkEPKJUF9hqC6Bj'
        })
    
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
    
    def save_json(self, data: Any, filename: str, folder: str = "sample_data"):
        """Save data as JSON file in specified folder."""
        os.makedirs(folder, exist_ok=True)
        filepath = os.path.join(folder, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        print(f"Saved: {filepath}")

def main():
    fetcher = HasuraDataFetcher(GRAPHQL_URL)
    
    print("🔍 Fetching sample data from all Hasura tables and views...")
    print(f"📡 API: {GRAPHQL_URL}")
    
    # List of all tables and views from the Hasura interface
    tables_and_views = [
        "answers_as_rows",
        "api_mobile_bus", 
        "api_mobile_inspections",
        "api_mobile_templates",
        "api_mobile_workorders",
        "bus",
        "contracts_meeting_approvals",
        "dashboard_mobile_view",
        "domain_examination_form_templates",
        "domain_examination_types",
        "domain_reason",
        "domain_reason_row",
        "domain_workorder_details_status",
        "domain_workorder_status",
        "drivers",
        "employee_push",
        "examination_template_mobile_items",
        "examination_template_questions",
        "examination_templates",
        "mobile_dashboard",
        "mobile_reason",
        "notifications",
        "notifications_center",
        "school_search",
        "templates_per_school",
        "workorder_details",
        "workorders"
    ]
    
    successful_queries = 0
    failed_queries = 0
    
    print(f"\n📥 Fetching data from {len(tables_and_views)} tables/views...")
    
    for table_name in tables_and_views:
        print(f"\n🔄 Fetching: {table_name}")
        
        # Create a simple query to fetch first 10 records
        query = f"""
        query get{table_name.replace('_', '').title()} {{
          {table_name}(limit: 10) {{
            __typename
          }}
        }}
        """
        
        result = fetcher.execute_query(query)
        
        if result and 'errors' not in result:
            # If successful, get the actual data with all fields
            if result.get('data', {}).get(table_name):
                # Now fetch with introspection to get all fields
                detailed_query = f"""
                query get{table_name.replace('_', '').title()}Detailed {{
                  {table_name}(limit: 10) {{
                    ... on {table_name} {{
                      __typename
                    }}
                  }}
                }}
                """
                
                # For now, let's just use a generic approach
                simple_query = f"""
                query get{table_name.replace('_', '').title()}Simple {{
                  {table_name}(limit: 10)
                }}
                """
                
                detailed_result = fetcher.execute_query(simple_query)
                if detailed_result and 'errors' not in detailed_result:
                    filename = f"{table_name}_sample.json"
                    fetcher.save_json(detailed_result, filename)
                    print(f"✅ {table_name} - Success ({len(detailed_result.get('data', {}).get(table_name, []))} records)")
                    successful_queries += 1
                else:
                    print(f"❌ {table_name} - Failed to get detailed data")
                    if detailed_result and 'errors' in detailed_result:
                        error_msg = detailed_result['errors'][0].get('message', 'Unknown error')
                        print(f"   Error: {error_msg}")
                    failed_queries += 1
            else:
                print(f"✅ {table_name} - Empty table")
                filename = f"{table_name}_empty.json"
                fetcher.save_json(result, filename)
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
        time.sleep(0.2)
    
    # Try to get some aggregate counts
    print(f"\n📊 Fetching aggregate data...")
    
    aggregate_tables = [
        "bus", "drivers", "workorders", "api_mobile_inspections", 
        "api_mobile_workorders", "notifications"
    ]
    
    for table_name in aggregate_tables:
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
    
    print(f"\n🎉 Data fetching completed!")
    print(f"✅ Successful queries: {successful_queries}")
    print(f"❌ Failed queries: {failed_queries}")
    print(f"📁 All data saved in the 'sample_data' folder")
    
    # Create a summary file
    summary = {
        "api_endpoint": GRAPHQL_URL,
        "total_tables_views": len(tables_and_views),
        "successful_queries": successful_queries,
        "failed_queries": failed_queries,
        "tables_and_views": tables_and_views,
        "fetch_timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    fetcher.save_json(summary, "fetch_summary.json")
    print(f"📋 Summary saved to: sample_data/fetch_summary.json")

if __name__ == "__main__":
    main()
