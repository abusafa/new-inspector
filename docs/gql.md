graphql url: https://inspector-gql.tatweertransit.com/v1/graphql
x-hasura-admin-secret
uWkEPKJUF9hqC6Bj 
This document is formatted to be a clear and actionable guide for the development team.

---

## GraphQL API Specification: The Smart Inspector App

This document details all the GraphQL Queries, Mutations, and Subscriptions required to build the application. It serves as the primary API contract for the frontend development team.

### 1. Queries (Fetching Data)

Queries are used to read or fetch data from the server.

---

**Operation Name:** `isUserRegistered`
**Type:** Query
**Description:** Checks if a user's mobile number is registered in the system. As part of the same operation, it triggers the backend to send an OTP to that number if the user exists. This is the first step in the login flow.
**Variables:**
*   `$type` (String): The type of user, likely `"courier"` for inspectors.
*   `$username` (String): The user's mobile number.
**GraphQL Code:**
```graphql
query isUserRegistered($type: String = "", $username: String = "") {
  sendOtp(params: {mobile: $username}) {
    message
  }
  users: etl_users_aggregate(where: {type: {_eq: $type}, username: {_eq: $username}}) {
    aggregate {
      count
    }
  }
}
```

---

**Operation Name:** `getUserByUserNameQuery`
**Type:** Query
**Description:** Authenticates the user by validating the provided mobile number and OTP. On success, it returns the user's complete profile and a session token. This is the second and final step of the login flow.
**Variables:**
*   `$username` (String): The user's mobile number.
*   `$otp` (String): The One-Time Password received via SMS.
**GraphQL Code:**
```graphql
query getUserQuery($username: String = "", $otp: String = "") {
  users:etl_users_with_otp(where: { username: {_eq: $username}, otp: {_eq: $otp}}) {
    business_uuid
    mobile_number
    name
    name_ar
    name_en
    org_uuid
    otp
    status
    uuid
    username_type
    username
    type
    token
  }
}
```

---

**Operation Name:** `loadConfig`
**Type:** Query
**Description:** Fetches all necessary configuration data for the application upon startup after login. This includes UI elements, translations, map icons, and permissions text.
**Variables:** None.
**GraphQL Code:**
```graphql
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
```

---

**Operation Name:** `getCourierRoutes`
**Type:** Query
**Description:** Fetches all routes assigned to the logged-in inspector, including details about the vehicles and other couriers associated with those routes. Used to populate the main trips/routes list.
**Variables:** None.
**GraphQL Code:**
```graphql
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
```

---

**Operation Name:** `courierActiveTripsCount`
**Type:** Query
**Description:** Fetches the total number of currently active (`started`) trips for the inspector. Used for a KPI on the dashboard.
**Variables:** None.
**GraphQL Code:**
```graphql
query courierActiveTripsCount {
  total:operation_trips_aggregate(where: {trip_status: {_eq: started}}) {
    aggregate {
      count(columns: uuid)
    }
  }
}
```

---

**Operation Name:** `getTripStepsByTripUuid`
**Type:** Query
**Description:** Fetches all student stops (trip steps) for a given trip UUID. This is used to load the initial state of the student checklist on the active trip screen.
**Variables:**
*   `$trip_uuid` (uuid): The unique identifier of the trip.
**GraphQL Code:**
```graphql
query getTripStepsByTripUuid($trip_uuid: uuid = "") {
  trip_steps: operation_trip_steps(where: {trip_uuid: {_eq: $trip_uuid}}) {
    id
    uuid
    trip_type
    origin_location
    destination_location
    riding_status
    riding_sequence
    pickup_time
    delivery_time
    rider_data
    vehicle_data
    courier_data
    created_at
  }
}
```

---

**Operation Name:** `getNotifications`
**Type:** Query
**Description:** Fetches a list of notifications relevant to the user, identified by their associated topics. Used to display the notification history.
**Variables:**
*   `$_contains` ([String!]): An array of topics to filter notifications by (e.g., `["courier_uuid_...", "org_uuid_..."]`).
**GraphQL Code:**
```graphql
query getNotifications($_contains: [String!] = "") {
  notifications: operation_push_notification_view(where: {topics: {_has_keys_any: $_contains}}, order_by: {created_at: desc}, limit: 100) {
    text
    title
    uuid
    sent_at
    created_at
  }
}
```

---

### 2. Mutations (Modifying Data)

Mutations are used to create, update, or delete data on the server.

---

**Operation Name:** `setTripStartMutation`
**Type:** Mutation
**Description:** Updates a trip's status to "started", records the start time, and sets the initial GPS position of the vehicle.
**Variables:**
*   `$id` (bigint): The numerical ID of the trip record.
*   `$start_location` (jsonb): A GeoJSON object representing the starting coordinates.
**GraphQL Code:**
```graphql
mutation setTripStatus($id: bigint = "", $start_location: jsonb = "") {
  update_operation_trips_by_pk(pk_columns: {id: $id}, _set: {start_time: "now()", trip_status: started,  start_location: $start_location, position: $start_location}) {
    id
  }
}
```

---

**Operation Name:** `setTripEndMutation`
**Type:** Mutation
**Description:** Updates a trip's status to "ended", records the end time, final GPS position, and saves the complete route path (shape).
**Variables:**
*   `$id` (bigint): The numerical ID of the trip record.
*   `$end_location` (jsonb): A GeoJSON object for the final coordinates.
*   `$shape` (jsonb): A GeoJSON LineString object representing the recorded path of the trip.
**GraphQL Code:**
```graphql
mutation setTripStatus($id: bigint = "", $end_location: jsonb = "", $shape: jsonb = "") {
  update_operation_trips_by_pk(pk_columns: {id: $id}, _set: {end_time: "now()", trip_status: ended,  end_location: $end_location, position: $end_location,  shape: $shape}) {
    id
  }
}
```

---

**Operation Name:** `updateTripLocationMutation`
**Type:** Mutation
**Description:** Periodically called by the background GPS service to update the vehicle's current position during an active trip.
**Variables:**
*   `$id` (bigint): The numerical ID of the active trip.
*   `$position` (jsonb): A GeoJSON object of the current coordinates.
**GraphQL Code:**
```graphql
mutation updateTripLocationMutation($id: bigint = "", $position: jsonb = "") {
  update_operation_trips_by_pk(pk_columns: {id: $id}, _set: {fix_time: "now()", position: $position}) {
    id
  }
}
```

---

**Operation Name:** `setPickedUpMutation`
**Type:** Mutation
**Description:** Updates a student's (rider's) status to "picked_up" for a specific trip step, recording the time and location.
**Variables:**
*   `$id` (bigint): The numerical ID of the `operation_trip_steps` record.
*   `$pickup_location` (jsonb): A GeoJSON object of the pickup coordinates.
**GraphQL Code:**
```graphql
mutation setPickedUpMutation($id: bigint = "", $pickup_location: jsonb = "") {
  update_operation_trip_steps_by_pk(pk_columns: {id: $id}, _set: {pickup_time: "now()", pickup_location: $pickup_location, riding_status: "picked_up"}) {
    id
  }
}
```

---

**Operation Name:** `setDeliveryMutation`
**Type:** Mutation
**Description:** Updates a student's (rider's) status to "delivered" for a specific trip step, recording the time and location.
**Variables:**
*   `$id` (bigint): The numerical ID of the `operation_trip_steps` record.
*   `$delivery_location` (jsonb): A GeoJSON object of the drop-off coordinates.
**GraphQL Code:**
```graphql
mutation setDeliveryMutation($id: bigint = "", $delivery_location: jsonb = "") {
  update_operation_trip_steps_by_pk(pk_columns: {id: $id}, _set: {delivery_time: "now()", delivery_location: $delivery_location, riding_status: "delivered"}) {
    id
  }
}
```

---

**Operation Name:** `setMissedMutation`
**Type:** Mutation
**Description:** Updates a student's (rider's) status to "missed" if they were absent for pickup, recording the time and location.
**Variables:**
*   `$id` (bigint): The numerical ID of the `operation_trip_steps` record.
*   `$missed_location` (jsonb): A GeoJSON object of the coordinates where the student was marked absent.
**GraphQL Code:**
```graphql
mutation setMissedMutation($id: bigint = "", $missed_location: jsonb = "") {
  update_operation_trip_steps_by_pk(pk_columns: {id: $id}, _set: {missed_time: "now()", missed_location: $missed_location, riding_status: "missed"}) {
    id
  }
}
```

---

**Operation Name:** `bleHistoryInsert`
**Type:** Mutation
**Description:** Creates a historical log entry every time a BLE beacon is scanned, providing an audit trail.
**Variables:**
*   `$courier_uuid` (uuid): The UUID of the inspector.
*   `$ble_mac` (String): The MAC address of the scanned beacon.
*   `$ble_serial` (numeric): The serial number of the beacon.
*   `$event_type` (String): The type of event (e.g., "enter", "exit").
*   `$route_uuid` (uuid): The UUID of the current route.
*   `$trip_uuid` (uuid): The UUID of the current trip.
*   `$location` (jsonb): The GPS coordinates where the scan occurred.
*   `$device_id` (String): A unique identifier for the inspector's device.
**GraphQL Code:**
```graphql
mutation bleHistoryInsert($courier_uuid: uuid = "", $ble_mac: String = "", $ble_serial: numeric = "", $event_type: String = "", $route_type: String = "", $route_uuid: uuid = "", $trip_uuid: uuid = "", $location: jsonb = "", $device_id: String = "") {
  insert_operation_beacons_events_history_one(object: {courier_uuid: $courier_uuid, ble_mac: $ble_mac, ble_serial: $ble_serial, event_type: $event_type, route_type: $route_type, route_uuid: $route_uuid, trip_uuid: $trip_uuid, location: $location, device_id: $device_id}) {
    id
  }
}
```

---

**Operation Name:** `createTripByCourier`
**Type:** Mutation
**Description:** Creates a new, ad-hoc (unscheduled) trip and immediately sets its status to "started".
**Variables:**
*   `$org_uuid`, `$courier_uuid`, `$business_uuid`, `$vehicle_uuid`, `$route_uuid` (uuid): Various identifiers for the trip context.
*   `$vehicle_data`, `$route_data`, `$courier_data`, `$start_location`, `$position` (jsonb): JSON objects containing snapshot data.
*   `$name` (String): A name for the ad-hoc trip.
*   `$type` (enum_trip_types_enum): The type of trip (e.g., `destination_origin`).
**GraphQL Code:**
```graphql
mutation createTripByCourier($org_uuid: uuid = "", $courier_uuid: uuid = "", $business_uuid: uuid = "", $vehicle_uuid: uuid = "", $vehicle_data: jsonb = "", $route_uuid: uuid = "", $route_data: jsonb = "", $courier_data: jsonb = "", $name: String = "", $type: enum_trip_types_enum = destination_origin, $start_location: jsonb = "", $position: jsonb = "") {
  insert_operation_trips_one(object: {org_uuid: $org_uuid, courier_uuid: $courier_uuid, business_uuid: $business_uuid, vehicle_uuid: $vehicle_uuid, vehicle_data: $vehicle_data, route_uuid: $route_uuid, route_data: $route_data, courier_data: $courier_data, trip_status: started, start_time: "now()", name: $name, type: $type, start_location: $start_location, position: $position, fix_time: "now()"}) {
    id
  }
}
```

---

### 3. Subscriptions (Real-time Data)

Subscriptions maintain a persistent connection to the server, pushing data to the client in real-time as it changes.

---

**Operation Name:** `courierTripsSubscription`
**Type:** Subscription
**Description:** Subscribes to the inspector's master trips, providing the single most recent or active trip for each route. This keeps the main trip list screen live and updated.
**Variables:**
*   `$trip_statuses` ([trip_statuses_enum!]): An array of statuses to listen for (e.g., `["scheduled", "started"]`).
**GraphQL Code:**
```graphql
subscription courierTripsSubscription($trip_statuses: [trip_statuses_enum!] = cancelled) {
  master_trips: operation_master_trips(order_by: {type: desc}) {
    trips(where: {trip_status: {_in: $trip_statuses}}, order_by: {scheduled_time: asc}, limit: 1) {
      # ... all trip fields
      id
      uuid
      trip_status
      scheduled_time
      vehicle_data
      route_data
      # ... etc
    }
    # ... all master_trip fields
  }
}
```

---

**Operation Name:** `tripStepsByTripIdSubscription`
**Type:** Subscription
**Description:** A critical subscription that streams real-time updates for all student stops on a specific, active trip. This powers the live student checklist.
**Variables:**
*   `$trip_uuid` (uuid): The unique identifier of the currently active trip.
**GraphQL Code:**
```graphql
subscription tripStepsByTripIdSubscription($trip_uuid: uuid = "") {
  trip_steps: operation_trip_steps(where: {trip_uuid: {_eq: $trip_uuid}}, order_by: {riding_sequence: asc}) {
    id
    uuid
    rider_data
    riding_status
    pickup_time
    delivery_time
    missed_time
    # ... all other trip_step fields
  }
}
```

---

**Operation Name:** `tripByIdSubscription`
**Type:** Subscription
**Description:** Subscribes to a single trip record by its ID, providing real-time updates on its core properties like `position` and `trip_status`. Also fetches data for a specific student (`step_id`) within that trip.
**Variables:**
*   `$trip_id` (bigint): The numerical ID of the trip.
*   `$step_id` (bigint): The numerical ID of the trip step (student).
**GraphQL Code:**
```graphql
subscription TripByIdSubscription($trip_id: bigint = "", $step_id: bigint = "") {
  trip:operation_trips_by_pk(id: $trip_id) {
    # ... all trip fields
    trip_status
    position
    steps(where: {id: {_eq: $step_id}}) {
      # ... all trip_step fields
      riding_status
    }
  }
}
```