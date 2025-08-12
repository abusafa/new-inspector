#!/usr/bin/env python3
"""
Schema Analysis Script
Parses the GraphQL schema to find available queries, mutations, and subscriptions.
"""

import json
from typing import List, Dict, Any

def analyze_schema():
    """Analyze the downloaded GraphQL schema."""
    
    try:
        with open('sample_data/schema.json', 'r') as f:
            schema_data = json.load(f)
    except FileNotFoundError:
        print("❌ Schema file not found. Run explore_graphql.py first.")
        return
    
    schema = schema_data['data']['__schema']
    types = schema['types']
    
    # Find query_root, mutation_root, and subscription_root types
    query_type = None
    mutation_type = None
    subscription_type = None
    
    for type_def in types:
        if type_def['name'] == 'query_root':
            query_type = type_def
        elif type_def['name'] == 'mutation_root':
            mutation_type = type_def
        elif type_def['name'] == 'subscription_root':
            subscription_type = type_def
    
    print("📊 GraphQL Schema Analysis")
    print("=" * 50)
    
    # Analyze queries
    if query_type and query_type['fields']:
        print(f"\n🔍 Available Queries ({len(query_type['fields'])} total):")
        print("-" * 30)
        
        # Group fields by category
        categories = {}
        for field in query_type['fields']:
            name = field['name']
            # Try to categorize by prefix
            if name.startswith('etl_'):
                category = 'ETL Tables'
            elif name.startswith('operation_'):
                category = 'Operations'
            elif name.startswith('sendOtp') or 'otp' in name.lower():
                category = 'Authentication'
            else:
                category = 'Other'
            
            if category not in categories:
                categories[category] = []
            categories[category].append(field)
        
        for category, fields in categories.items():
            print(f"\n📋 {category}:")
            for field in fields[:10]:  # Show first 10 fields per category
                field_type = get_type_name(field['type'])
                print(f"  • {field['name']}: {field_type}")
            if len(fields) > 10:
                print(f"  ... and {len(fields) - 10} more")
    
    # Analyze mutations
    if mutation_type and mutation_type['fields']:
        print(f"\n✏️  Available Mutations ({len(mutation_type['fields'])} total):")
        print("-" * 30)
        for field in mutation_type['fields'][:15]:  # Show first 15 mutations
            field_type = get_type_name(field['type'])
            print(f"  • {field['name']}: {field_type}")
        if len(mutation_type['fields']) > 15:
            print(f"  ... and {len(mutation_type['fields']) - 15} more")
    
    # Analyze subscriptions
    if subscription_type and subscription_type['fields']:
        print(f"\n📡 Available Subscriptions ({len(subscription_type['fields'])} total):")
        print("-" * 30)
        for field in subscription_type['fields'][:15]:  # Show first 15 subscriptions
            field_type = get_type_name(field['type'])
            print(f"  • {field['name']}: {field_type}")
        if len(subscription_type['fields']) > 15:
            print(f"  ... and {len(subscription_type['fields']) - 15} more")
    
    # Save detailed field lists
    save_field_analysis(query_type, mutation_type, subscription_type)

def get_type_name(type_def: Dict[str, Any]) -> str:
    """Extract readable type name from GraphQL type definition."""
    if type_def['kind'] == 'NON_NULL':
        return get_type_name(type_def['ofType']) + '!'
    elif type_def['kind'] == 'LIST':
        return '[' + get_type_name(type_def['ofType']) + ']'
    else:
        return type_def.get('name', 'Unknown')

def save_field_analysis(query_type, mutation_type, subscription_type):
    """Save detailed field analysis to JSON files."""
    
    analysis = {
        'queries': [],
        'mutations': [],
        'subscriptions': []
    }
    
    if query_type and query_type['fields']:
        for field in query_type['fields']:
            analysis['queries'].append({
                'name': field['name'],
                'description': field.get('description'),
                'type': get_type_name(field['type']),
                'args': [
                    {
                        'name': arg['name'],
                        'type': get_type_name(arg['type']),
                        'description': arg.get('description')
                    }
                    for arg in field.get('args', [])
                ]
            })
    
    if mutation_type and mutation_type['fields']:
        for field in mutation_type['fields']:
            analysis['mutations'].append({
                'name': field['name'],
                'description': field.get('description'),
                'type': get_type_name(field['type']),
                'args': [
                    {
                        'name': arg['name'],
                        'type': get_type_name(arg['type']),
                        'description': arg.get('description')
                    }
                    for arg in field.get('args', [])
                ]
            })
    
    if subscription_type and subscription_type['fields']:
        for field in subscription_type['fields']:
            analysis['subscriptions'].append({
                'name': field['name'],
                'description': field.get('description'),
                'type': get_type_name(field['type']),
                'args': [
                    {
                        'name': arg['name'],
                        'type': get_type_name(arg['type']),
                        'description': arg.get('description')
                    }
                    for arg in field.get('args', [])
                ]
            })
    
    with open('sample_data/schema_analysis.json', 'w') as f:
        json.dump(analysis, f, indent=2)
    
    print(f"\n💾 Detailed analysis saved to: sample_data/schema_analysis.json")

if __name__ == "__main__":
    analyze_schema()
