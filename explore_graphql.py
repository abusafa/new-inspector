#!/usr/bin/env python3
"""
GraphQL API Explorer for Smart Inspector App
This script connects to the GraphQL API, downloads the schema, and fetches sample data.
"""

import requests
import json
import os
from typing import Dict, Any, Optional
import time

# GraphQL endpoint from the documentation
GRAPHQL_URL = "https://inspector-gql.tatweertransit.com/v1/graphql"

class GraphQLExplorer:
    def __init__(self, url: str):
        self.url = url
        self.session = requests.Session()
        # Set up headers - might need authentication later
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'GraphQL-Explorer/1.0'
        })
    
    def introspect_schema(self) -> Optional[Dict[str, Any]]:
        """Download the full GraphQL schema using introspection."""
        introspection_query = """
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              ...FullType
            }
            directives {
              name
              description
              locations
              args {
                ...InputValue
              }
            }
          }
        }
        
        fragment FullType on __Type {
          kind
          name
          description
          fields(includeDeprecated: true) {
            name
            description
            args {
              ...InputValue
            }
            type {
              ...TypeRef
            }
            isDeprecated
            deprecationReason
          }
          inputFields {
            ...InputValue
          }
          interfaces {
            ...TypeRef
          }
          enumValues(includeDeprecated: true) {
            name
            description
            isDeprecated
            deprecationReason
          }
          possibleTypes {
            ...TypeRef
          }
        }
        
        fragment InputValue on __InputValue {
          name
          description
          type { ...TypeRef }
          defaultValue
        }
        
        fragment TypeRef on __Type {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
        """
        
        try:
            response = self.session.post(
                self.url,
                json={'query': introspection_query},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error during schema introspection: {e}")
            return None
    
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
    explorer = GraphQLExplorer(GRAPHQL_URL)
    
    print("🔍 Starting GraphQL API exploration...")
    print(f"📡 Connecting to: {GRAPHQL_URL}")
    
    # Test basic connectivity
    print("\n📋 Testing basic connectivity...")
    test_query = """
    query TestConnection {
      __typename
    }
    """
    
    test_result = explorer.execute_query(test_query)
    if not test_result:
        print("❌ Failed to connect to GraphQL API")
        return
    
    print("✅ Successfully connected to GraphQL API")
    
    # Download schema
    print("\n📊 Downloading GraphQL schema...")
    schema = explorer.introspect_schema()
    if schema:
        explorer.save_json(schema, "schema.json")
        print("✅ Schema downloaded successfully")
    else:
        print("❌ Failed to download schema")
    
    # Execute sample queries from the documentation
    queries_to_test = [
        {
            "name": "loadConfig",
            "query": """
            query loadConfig {
              gql:etl_config_gql {
                name
                query
                type
              }
              map_icons:etl_config_map_icons {
                icon
                name
              }
              onboarding:etl_config_onboarding {
                description
                image
                title
              }
              permissions:etl_config_permissions {
                accept_text
                decline_text
                image
                description
                title
              }
              translations:etl_config_translations {
                ar
                en
                name
              }
            }
            """,
            "variables": None
        },
        {
            "name": "getCourierRoutes",
            "query": """
            query getCourierRoutes {
              routes: etl_routes(order_by: {type: desc}) {
                type
                name
                business_uuid
                org_uuid
                uuid
                destination_origin: destination_origin_matrix(distinct_on: vehicle_uuid) {
                  vehicle_uuid
                  courier_uuid
                  vehicle {
                    name
                    plate_number
                  }
                  courier {
                    name
                  }
                }
                origin_destination: origin_destination_matrix(distinct_on: vehicle_uuid) {
                  vehicle_uuid
                  courier_uuid
                  vehicle {
                    name
                    plate_number
                  }
                   courier {
                    name
                  }
                }
              }
            }
            """,
            "variables": None
        },
        {
            "name": "courierActiveTripsCount",
            "query": """
            query courierActiveTripsCount {
              total:operation_trips_aggregate(where: {trip_status: {_eq: started}}) {
                aggregate {
                  count(columns: uuid)
                }
              }
            }
            """,
            "variables": None
        }
    ]
    
    print("\n📥 Executing sample queries...")
    for query_info in queries_to_test:
        print(f"\n🔄 Executing: {query_info['name']}")
        result = explorer.execute_query(query_info['query'], query_info['variables'])
        
        if result:
            filename = f"{query_info['name']}_sample.json"
            explorer.save_json(result, filename)
            print(f"✅ {query_info['name']} - Success")
        else:
            print(f"❌ {query_info['name']} - Failed")
        
        # Small delay between requests to be respectful
        time.sleep(0.5)
    
    # Try to get some sample data from common tables
    print("\n📊 Exploring available data...")
    
    # Try to get a small sample from various tables
    exploration_queries = [
        {
            "name": "sample_users",
            "query": """
            query sampleUsers {
              users: etl_users(limit: 5) {
                business_uuid
                mobile_number
                name
                name_ar
                name_en
                org_uuid
                status
                uuid
                username_type
                username
                type
              }
            }
            """
        },
        {
            "name": "sample_trips",
            "query": """
            query sampleTrips {
              trips: operation_trips(limit: 5, order_by: {created_at: desc}) {
                id
                uuid
                trip_status
                scheduled_time
                start_time
                end_time
                name
                type
                vehicle_data
                route_data
                courier_data
              }
            }
            """
        },
        {
            "name": "sample_notifications",
            "query": """
            query sampleNotifications {
              notifications: operation_push_notification_view(limit: 10, order_by: {created_at: desc}) {
                text
                title
                uuid
                sent_at
                created_at
              }
            }
            """
        }
    ]
    
    for query_info in exploration_queries:
        print(f"\n🔄 Exploring: {query_info['name']}")
        result = explorer.execute_query(query_info['query'])
        
        if result:
            filename = f"{query_info['name']}.json"
            explorer.save_json(result, filename)
            print(f"✅ {query_info['name']} - Data retrieved")
        else:
            print(f"❌ {query_info['name']} - No data or access denied")
        
        time.sleep(0.5)
    
    print("\n🎉 GraphQL exploration completed!")
    print("📁 All data saved in the 'sample_data' folder")

if __name__ == "__main__":
    main()
