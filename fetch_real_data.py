#!/usr/bin/env python3
"""
Fetch Real Data Script
Uses the actual schema to fetch sample data from the GraphQL API.
"""

import requests
import json
import os
from typing import Dict, Any, Optional

# GraphQL endpoint
GRAPHQL_URL = "https://inspector-gql.tatweertransit.com/v1/graphql"

class RealDataFetcher:
    def __init__(self, url: str):
        self.url = url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'GraphQL-DataFetcher/1.0'
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
        print(f"Saved data to: {filepath}")

def main():
    fetcher = RealDataFetcher(GRAPHQL_URL)
    
    print("🚌 Fetching real data from Inspector GraphQL API...")
    
    # Based on the schema analysis, let's fetch actual data
    real_queries = [
        {
            "name": "buses_sample",
            "query": """
            query getBuses {
              bus(limit: 10) {
                id
                bus_number
                plate_number
                model
                year
                capacity
                status
                created_at
                updated_at
              }
            }
            """
        },
        {
            "name": "mobile_inspections_sample",
            "query": """
            query getMobileInspections {
              api_mobile_inspections(limit: 10, order_by: {created_at: desc}) {
                id
                bus_id
                driver_id
                inspection_date
                status
                created_at
                updated_at
              }
            }
            """
        },
        {
            "name": "mobile_workorders_sample",
            "query": """
            query getMobileWorkorders {
              api_mobile_workorders(limit: 10, order_by: {created_at: desc}) {
                id
                bus_id
                driver_id
                workorder_date
                status
                priority
                description
                created_at
                updated_at
              }
            }
            """
        },
        {
            "name": "mobile_templates_sample",
            "query": """
            query getMobileTemplates {
              api_mobile_templates(limit: 10) {
                id
                name
                description
                template_type
                is_active
                created_at
                updated_at
              }
            }
            """
        },
        {
            "name": "dashboard_mobile_view_sample",
            "query": """
            query getDashboardMobileView {
              dashboard_mobile_view(limit: 10) {
                id
                bus_id
                driver_id
                inspection_count
                workorder_count
                last_inspection_date
                last_workorder_date
              }
            }
            """
        },
        {
            "name": "drivers_sample",
            "query": """
            query getDrivers {
              drivers(limit: 10) {
                id
                name
                license_number
                phone
                email
                status
                created_at
                updated_at
              }
            }
            """
        },
        {
            "name": "workorders_sample",
            "query": """
            query getWorkorders {
              workorders(limit: 10, order_by: {created_at: desc}) {
                id
                bus_id
                driver_id
                title
                description
                status
                priority
                created_at
                updated_at
              }
            }
            """
        },
        {
            "name": "workorder_details_sample",
            "query": """
            query getWorkorderDetails {
              workorder_details(limit: 10) {
                id
                workorder_id
                item_name
                quantity
                unit_price
                total_price
                status
                created_at
                updated_at
              }
            }
            """
        },
        {
            "name": "domain_reason_sample",
            "query": """
            query getDomainReasons {
              domain_reason(limit: 10) {
                id
                reason_code
                reason_description
                category
                is_active
                created_at
                updated_at
              }
            }
            """
        },
        {
            "name": "answers_as_rows_sample",
            "query": """
            query getAnswersAsRows {
              answers_as_rows(limit: 10) {
                id
                question_id
                answer_text
                answer_value
                inspection_id
                created_at
              }
            }
            """
        }
    ]
    
    print(f"\n📥 Executing {len(real_queries)} queries to fetch sample data...")
    
    successful_queries = 0
    failed_queries = 0
    
    for query_info in real_queries:
        print(f"\n🔄 Fetching: {query_info['name']}")
        result = fetcher.execute_query(query_info['query'])
        
        if result and 'errors' not in result:
            filename = f"{query_info['name']}.json"
            fetcher.save_json(result, filename)
            print(f"✅ {query_info['name']} - Success")
            successful_queries += 1
        else:
            print(f"❌ {query_info['name']} - Failed")
            if result and 'errors' in result:
                print(f"   Error: {result['errors'][0].get('message', 'Unknown error')}")
            failed_queries += 1
            
            # Save error response for debugging
            if result:
                filename = f"{query_info['name']}_error.json"
                fetcher.save_json(result, filename)
    
    # Try to get some aggregate data
    print(f"\n📊 Fetching aggregate data...")
    
    aggregate_queries = [
        {
            "name": "buses_aggregate",
            "query": """
            query getBusesAggregate {
              bus_aggregate {
                aggregate {
                  count
                }
                nodes {
                  status
                }
              }
            }
            """
        },
        {
            "name": "inspections_aggregate",
            "query": """
            query getInspectionsAggregate {
              api_mobile_inspections_aggregate {
                aggregate {
                  count
                }
                nodes {
                  status
                }
              }
            }
            """
        }
    ]
    
    for query_info in aggregate_queries:
        print(f"\n🔄 Fetching: {query_info['name']}")
        result = fetcher.execute_query(query_info['query'])
        
        if result and 'errors' not in result:
            filename = f"{query_info['name']}.json"
            fetcher.save_json(result, filename)
            print(f"✅ {query_info['name']} - Success")
            successful_queries += 1
        else:
            print(f"❌ {query_info['name']} - Failed")
            failed_queries += 1
    
    print(f"\n🎉 Data fetching completed!")
    print(f"✅ Successful queries: {successful_queries}")
    print(f"❌ Failed queries: {failed_queries}")
    print(f"📁 All data saved in the 'sample_data' folder")

if __name__ == "__main__":
    main()
