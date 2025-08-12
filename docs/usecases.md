Of course. Here is a comprehensive set of use cases for "The Smart Inspector" application, derived from the Business Requirements Document and the provided source files. This document details the interactions between the users (actors) and the system to achieve specific goals.

---

## Use Case Document: The Smart Inspector App

**Document Version:** 1.0
**Date:** May 24, 2024

### 1. Introduction
This document provides a detailed description of the user and system interactions for "The Smart Inspector" application. These use cases are designed to guide the development process by defining the functional flow of the application from the user's perspective.

### 2. Actors
*   **Inspector:** The primary user of the application. This role is also referred to as "Supervisor" or "Courier" in the backend schema. They are responsible for managing and monitoring trips in the field.
*   **System:** The Smart Inspector mobile application itself, which performs automated tasks, communicates with the backend, and responds to user input.
*   **Backend Server:** The Hasura GraphQL API that serves as the central data repository and business logic engine.
*   **Firebase Cloud Messaging (FCM):** The external service responsible for sending push notifications to the application.

### 3. Use Case Diagram (High-Level Overview)

**Actor: Inspector**
*   **Authentication:**
    *   UC-01: Log In with OTP
    *   UC-02: Log Out
*   **Trip Management:**
    *   UC-03: View Assigned Trips and Routes
    *   UC-04: Start a Scheduled Trip
    *   UC-05: Create an Ad-Hoc (Unscheduled) Trip
    *   UC-06: End an Active Trip
*   **Live Operations:**
    *   UC-07: Track Active Trip on Map
    *   UC-08: View Student Checklist for a Trip
    *   UC-09: Manually Update Student Pickup/Drop-off Status
    *   UC-10: Scan Student Tag (BLE/QR) for Check-in/Check-out
*   **Vehicle Inspections:**
    *   UC-11: View Assigned Inspection Work Orders
    *   UC-12: Complete and Submit a Vehicle Inspection (Online/Offline)
*   **Notifications:**
    *   UC-13: View Notification History

**Actor: System**
*   UC-14: Receive and Display a Push Notification
*   UC-15: Track and Transmit Live GPS Location
*   UC-16: Synchronize Offline Data

---

### 4. Detailed Use Cases

#### 4.1 Authentication

**Use Case ID:** UC-01
**Use Case Name:** Log In with OTP
**Actor(s):** Inspector
**Description:** The Inspector authenticates their identity to gain access to the application using their mobile number and a One-Time Password (OTP).
**Preconditions:**
*   The Inspector has the application installed.
*   The device has a stable internet connection.
*   The Inspector's mobile number is pre-registered in the backend system.
**Main Flow (Happy Path):**
1.  Inspector launches the app and is presented with the login screen.
2.  Inspector enters their registered mobile number and taps "Request OTP".
3.  The System sends the mobile number to the Backend Server (`isUserRegistered` / `sendOtp` query).
4.  The Backend Server validates the number and sends an OTP via SMS to the Inspector's mobile.
5.  The app displays a screen for OTP entry.
6.  Inspector enters the received OTP and taps "Login".
7.  The System sends the mobile number and OTP to the Backend Server for verification (`getUserByUserNameQuery`).
8.  The Backend Server validates the OTP and returns a user profile with an authentication token.
9.  The System securely stores the token, navigates the Inspector to the Main Dashboard, and establishes an authenticated session.
**Alternative Flows / Exceptions:**
*   **4a. Unregistered Number:** If the mobile number is not found in the system, the app displays an error message: "This mobile number is not registered."
*   **4b. Invalid OTP:** If the entered OTP is incorrect, the app displays an error message: "Invalid OTP. Please try again."
*   **4c. OTP Expired:** If the OTP is not entered within the valid time frame, the Inspector must request a new one.
*   **4d. No Network:** If the device is offline, the app displays a "No Internet Connection" error.
**Postconditions:**
*   The Inspector is successfully authenticated and logged into the application.

---

**Use Case ID:** UC-02
**Use Case Name:** Log Out
**Actor(s):** Inspector
**Description:** The Inspector ends their authenticated session.
**Preconditions:**
*   The Inspector is currently logged into the application.
**Main Flow (Happy Path):**
1.  Inspector navigates to the Profile or Settings screen.
2.  Inspector taps the "Log Out" button.
3.  The System prompts for confirmation: "Are you sure you want to log out?"
4.  Inspector confirms the action.
5.  The System securely deletes the stored authentication token and any cached user data.
6.  The System navigates the user back to the Login screen.
**Postconditions:**
*   The Inspector's session is terminated.

---

#### 4.2 Trip Management

**Use Case ID:** UC-03
**Use Case Name:** View Assigned Trips and Routes
**Actor(s):** Inspector
**Description:** The Inspector views their list of scheduled trips for the day, categorized by route and time.
**Preconditions:**
*   The Inspector is logged in.
*   The device has an internet connection.
**Main Flow (Happy Path):**
1.  Inspector navigates to the "Trips" or "Routes" section of the app.
2.  The System fetches the assigned routes and associated trips from the Backend (`getCourierRoutes`, `courierTripsSubscription`).
3.  The UI displays a list of routes (e.g., "Route A - Morning," "Route A - Afternoon").
4.  Each route entry shows key trip details: scheduled time, vehicle plate number, and trip status (e.g., "Scheduled," "In Progress," "Completed").
**Postconditions:**
*   The Inspector is aware of their daily schedule.

---

**Use Case ID:** UC-04
**Use Case Name:** Start a Scheduled Trip
**Actor(s):** Inspector
**Description:** The Inspector initiates a scheduled trip, which begins the real-time tracking process.
**Preconditions:**
*   The Inspector is logged in and at the trip's starting location.
*   The trip's status is "Scheduled".
*   Device GPS is enabled and has a signal.
**Main Flow (Happy Path):**
1.  Inspector selects a scheduled trip from the list (as in UC-03).
2.  Inspector taps the "Start Trip" button.
3.  The System captures the current GPS coordinates and timestamp.
4.  The System sends a request to the Backend Server to update the trip's status to "started" (`setTripStartMutation`).
5.  The app navigates to the Active Trip screen, showing the live map and student checklist.
**Alternative Flows / Exceptions:**
*   **4a. No GPS Signal:** The app displays a warning "Cannot start trip without a GPS signal. Please ensure you are in an open area."
*   **4b. Network Failure:** The app saves the "Start Trip" action locally and attempts to sync it when the network is restored (see UC-16). The UI proceeds to the Active Trip screen for offline operation.
**Postconditions:**
*   The trip's status is updated to "started" on the server.
*   Live GPS tracking for the trip is initiated (see UC-15).

---

**Use Case ID:** UC-05
**Use Case Name:** Create an Ad-Hoc (Unscheduled) Trip
**Actor(s):** Inspector
**Description:** The Inspector creates and starts a new trip that was not previously scheduled, such as for a special request or emergency.
**Preconditions:**
*   The Inspector is logged in.
*   Device GPS is enabled.
**Main Flow (Happy Path):**
1.  Inspector taps a "New Trip" or "+" button on the main trip screen.
2.  The app presents a form to select a Route, Vehicle, and Trip Type (e.g., origin-to-destination).
3.  Inspector fills in the required details and taps "Create and Start Trip".
4.  The System captures the current GPS coordinates and sends a request to create a new trip record with status "started" (`createTripByCourier` mutation).
5.  The app navigates to the Active Trip screen for the newly created trip.
**Postconditions:**
*   A new trip record is created and started on the server.

---

**Use Case ID:** UC-06
**Use Case Name:** End an Active Trip
**Actor(s):** Inspector
**Description:** The Inspector concludes an active trip, finalizing the route and stop data.
**Preconditions:**
*   A trip is currently "started".
*   The Inspector has reached the final destination.
*   Device GPS is enabled.
**Main Flow (Happy Path):**
1.  From the Active Trip screen, the Inspector taps the "End Trip" button.
2.  The System prompts for confirmation.
3.  Upon confirmation, the System captures the final GPS coordinates, timestamp, and the full route polyline (shape).
4.  The System sends a request to the Backend Server to update the trip's status to "ended" (`setTripEndMutation`).
5.  The app navigates back to the main trips list, which now shows the trip as "Completed".
**Alternative Flows / Exceptions:**
*   **4a. Unfinished Stops:** If there are students who have not been marked as "Dropped Off" or "Absent," the system displays a warning: "[X] students have not been marked. Do you want to end the trip anyway?"
*   **4b. Network Failure:** The app saves the "End Trip" action locally for later synchronization (see UC-16).
**Postconditions:**
*   The trip is marked as "ended" on the server, with all final data recorded.

---

#### 4.3 Live Operations & Student Management

**Use Case ID:** UC-07
**Use Case Name:** Track Active Trip on Map
**Actor(s):** Inspector
**Description:** The Inspector visually monitors the trip's progress on a real-time map.
**Preconditions:**
*   A trip is "started".
**Main Flow (Happy Path):**
1.  The Inspector views the Active Trip screen.
2.  The System displays a map centered on the vehicle's current location.
3.  The planned route is displayed as a polyline on the map.
4.  The vehicle's icon moves along the map as its GPS location updates.
5.  Icons representing each student stop are displayed. The icons change color or appearance based on their status (e.g., pending, picked up, missed).
**Postconditions:**
*   The Inspector has full real-time visibility of the trip's progress.

---

**Use Case ID:** UC-08
**Use Case Name:** View Student Checklist for a Trip
**Actor(s):** Inspector
**Description:** The Inspector views a list of all students assigned to the current trip.
**Preconditions:**
*   A trip is active.
**Main Flow (Happy Path):**
1.  On the Active Trip screen, the Inspector accesses the "Students" or "Checklist" tab/panel.
2.  The System displays a list of all students for the trip, ordered by stop sequence.
3.  Each list item shows the student's name, photo, and current status (e.g., "Pending Pickup," "On Board," "Dropped Off," "Absent").
**Postconditions:**
*   The Inspector can see the status of all students at a glance.

---

**Use Case ID:** UC-09
**Use Case Name:** Manually Update Student Pickup/Drop-off Status
**Actor(s):** Inspector
**Description:** The Inspector manually updates a student's status when they board or alight the bus.
**Preconditions:**
*   A trip is active.
*   The vehicle is at or near the student's designated stop.
**Main Flow (Happy Path):**
1.  Inspector identifies the student in the checklist (as in UC-08).
2.  Inspector taps the action button next to the student's name (e.g., "Pick Up").
3.  The System captures the current GPS location and timestamp.
4.  The System sends the status update to the Backend Server (`setPickedUpMutation`, `setDeliveryMutation`, `setMissedMutation`).
5.  The UI immediately updates the student's status in the list.
**Alternative Flows / Exceptions:**
*   **4a. Network Failure:** The app saves the status update action locally for later synchronization (see UC-16). The UI updates optimistically.
**Postconditions:**
*   The student's status is updated with a geo-tagged and timestamped record.

---

**Use Case ID:** UC-10
**Use Case Name:** Scan Student Tag (BLE/QR) for Check-in/Check-out
**Actor(s):** Inspector
**Description:** The Inspector uses the device's hardware to quickly and accurately record a student's boarding or alighting event.
**Preconditions:**
*   A trip is active.
*   The device has Bluetooth and/or Camera permissions granted.
**Main Flow (Happy Path):**
1.  Inspector activates the scanner mode in the app.
2.  The app opens the camera for QR scanning or starts scanning for nearby BLE beacons.
3.  The student presents their ID card (with QR code) or their BLE tag comes into proximity.
4.  The System reads the code/beacon and identifies the associated student (`bleRiderUpdate` mutation might be used to associate the tag).
5.  The System finds the student in the current trip's checklist.
6.  The app displays a confirmation dialog: "Check-in [Student Name]?"
7.  Inspector confirms.
8.  The use case proceeds as in UC-09, automatically updating the student's status to "picked up" or "delivered" based on the trip type.
**Alternative Flows / Exceptions:**
*   **6a. Unrecognized Tag:** The app displays an error: "Student not found."
*   **6b. Student Not on Trip:** The app displays a warning: "[Student Name] is not scheduled for this trip."
**Postconditions:**
*   Student's status is updated with high accuracy.

---

#### 4.4 Vehicle Inspections

**Use Case ID:** UC-11
**Use Case Name:** View Assigned Inspection Work Orders
**Actor(s):** Inspector
**Description:** The Inspector views a list of required vehicle inspections.
**Preconditions:**
*   Inspector is logged in.
**Main Flow (Happy Path):**
1.  Inspector navigates to the "Inspections" section.
2.  The System displays a list of work orders, which can be filtered by status (Pending, In Progress, Completed).
3.  Each item shows the vehicle to be inspected and the due date.
**Postconditions:**
*   The Inspector is aware of their pending inspection tasks.

---

**Use Case ID:** UC-12
**Use Case Name:** Complete and Submit a Vehicle Inspection (Online/Offline)
**Actor(s):** Inspector
**Description:** The Inspector performs a vehicle inspection using a digital form and submits the report.
**Preconditions:**
*   Inspector is logged in.
*   Inspection templates have been synced to the device.
**Main Flow (Happy Path):**
1.  Inspector selects an inspection work order or starts a new one for a specific vehicle.
2.  The System loads the correct inspection template (`ApiMobileTemplates`).
3.  The Inspector goes through the checklist, marking items as pass/fail, adding notes, and selecting options from dropdowns/tags.
4.  For specific items, the Inspector taps an "Add Photo" button, which opens the device camera or gallery (`image_picker` functionality). The Inspector takes/selects a photo, which is attached to the checklist item.
5.  Once the form is complete, the Inspector taps "Submit".
6.  If online, the System immediately sends the completed inspection data (including photos) to the Backend Server.
7.  If offline, the System saves the entire inspection report to local storage (see UC-16).
8.  The inspection is marked as "Completed" or "Pending Sync" in the UI.
**Postconditions:**
*   A detailed, timestamped inspection report is created and stored either on the server or locally for future sync.

---

#### 4.5 System & General Use Cases

**Use Case ID:** UC-13
**Use Case Name:** View Notification History
**Actor(s):** Inspector
**Description:** The Inspector reviews past notifications received by the app.
**Preconditions:**
*   The Inspector is logged in.
**Main Flow (Happy Path):**
1.  Inspector navigates to the "Notifications" screen.
2.  The System fetches and displays a chronological list of past notifications from the server (`getNotifications`).
3.  Each entry shows the notification title, body, and timestamp.
**Postconditions:**
*   The Inspector can review past alerts and communications.

---

**Use Case ID:** UC-14
**Use Case Name:** Receive and Display a Push Notification
**Actor(s):** System, Firebase Cloud Messaging (FCM)
**Description:** The app receives and displays a push notification from the backend.
**Preconditions:**
*   The app is installed and the Inspector has granted notification permissions.
*   The app has successfully registered its FCM token with the backend.
**Main Flow (Happy Path):**
1.  FCM delivers a notification payload to the device.
2.  If the app is in the foreground, the System displays an in-app banner or alert.
3.  If the app is in the background or terminated, the mobile OS displays the notification in the system tray.
4.  Tapping the notification opens the app, potentially deep-linking to a relevant screen (e.g., a specific trip).
**Postconditions:**
*   The Inspector is alerted to an important event.

---

**Use Case ID:** UC-15
**Use Case Name:** Track and Transmit Live GPS Location
**Actor(s):** System
**Description:** The app automatically tracks the device's location during an active trip and sends updates to the server.
**Preconditions:**
*   A trip is in "started" status.
*   The Inspector has granted "Location When In Use" or "Always" permission.
**Main Flow (Happy Path):**
1.  The System activates a background location listener.
2.  At a regular interval (e.g., every 15-30 seconds), the System gets the current GPS coordinates.
3.  The System sends the location update to the Backend Server (`updateTripLocationMutation`).
**Alternative Flows / Exceptions:**
*   **3a. Network Failure:** The System caches the last few location points and sends them in a batch when the network is restored.
**Postconditions:**
*   The backend has a near real-time location history for the active trip.

---

**Use Case ID:** UC-16
**Use Case Name:** Synchronize Offline Data
**Actor(s):** System
**Description:** The app automatically syncs data that was created or modified while the device was offline.
**Preconditions:**
*   There is data in the local offline queue (e.g., inspection reports, student status updates).
*   The device's internet connection is restored.
**Main Flow (Happy Path):**
1.  The System's network listener detects a stable internet connection.
2.  The System begins processing its offline action queue.
3.  For each action, the System sends the corresponding GraphQL mutation to the Backend Server.
4.  Upon receiving a successful response from the server, the System removes the action from the local queue.
5.  This process continues until the queue is empty.
**Alternative Flows / Exceptions:**
*   **4a. Sync Fails for an Item:** If a mutation fails (e.g., due to a server-side conflict), the System should retain the item in the queue and retry after a delay. It should not block the synchronization of other items.
**Postconditions:**
*   All offline data is successfully transmitted to the server.


Of course. Continuing from the Use Cases, the next logical step is to create a detailed **Functional and Technical Specification Document**. This document will break down the application screen by screen, detailing the UI components, data requirements, user interactions, and the underlying technical implementation strategy for the React Native build.

This document serves as a direct blueprint for the development team.

---

## Functional & Technical Specification Document: The Smart Inspector App

**Document Version:** 1.1
**Date:** May 24, 2024
**Project:** Inspector Mobile Application (React Native Rebuild)

### 1. High-Level Technical Architecture

This section outlines the proposed architecture and technology stack for the React Native application.

*   **Core Framework:** React Native
*   **Language:** TypeScript (for type safety and improved developer experience)
*   **State Management:** **Redux Toolkit** with RTK Query for managing global application state, caching API data, and handling loading/error states efficiently.
*   **Navigation:** **React Navigation** for all screen transitions and navigation logic (stack, tab, and drawer navigators).
*   **API Communication (GraphQL):** **Apollo Client for React** to handle GraphQL queries, mutations, and subscriptions. It provides excellent caching and real-time data handling capabilities.
*   **Local Database (Offline Storage):**
    *   **WatermelonDB or Realm:** For complex relational data like offline inspection reports and queued actions. These are powerful, observable databases built for mobile.
    *   **MMKV Storage:** For simple, fast key-value storage (e.g., storing the user's authentication token, settings).
*   **Mapping:** **`react-native-maps`** with Google Maps provider for all map-related features.
*   **UI Components:** A custom component library will be built to match the app's specific design. React Native's built-in components and `StyleSheet` will be used for styling.
*   **Permissions:** **`react-native-permissions`** to handle runtime requests for Location, Camera, Photo Library, and Notifications.
*   **Hardware Access:**
    *   **GPS:** `react-native-geolocation-service` for reliable, high-accuracy location tracking.
    *   **Camera/Photos:** `react-native-image-picker` for accessing the camera and gallery for inspection photos.
    *   **BLE:** `react-native-ble-plx` for scanning Bluetooth Low Energy beacons.
*   **Localization (i18n):** `i18next` with `react-i18next` to manage English and Arabic translations and handle Right-to-Left (RTL) layout switching.

### 2. Screen-by-Screen Functional & Technical Breakdown

#### 2.1 Splash Screen (UC-01 Prerequisite)
*   **Purpose:** Initial loading screen that determines the user's authentication status.
*   **UI Components:**
    *   Full-screen logo (`assets/images/rafed-logo.png`).
    *   Loading indicator.
*   **Logic:**
    1.  On app launch, this screen is displayed.
    2.  The app attempts to retrieve the authentication token from secure local storage (MMKV).
    3.  **If a valid token exists:** Navigate the user directly to the Main Dashboard screen.
    4.  **If no token exists or it's invalid:** Navigate the user to the Login screen.

#### 2.2 Login Screen (UC-01)
*   **Purpose:** Allow the Inspector to authenticate.
*   **UI Components:**
    *   App logo.
    *   Text Input for Mobile Number (with country code pre-filled for Saudi Arabia: +966).
    *   "Request OTP" button.
    *   Text Input for OTP (becomes visible after OTP is requested).
    *   "Login" button (initially disabled).
*   **Data Requirements & Actions:**
    *   **Request OTP:**
        *   **Action:** User enters mobile number and taps "Request OTP".
        *   **GraphQL:** `isUserRegistered` query to check if the user exists. If yes, trigger the `sendOtp` mutation.
        *   **System Response:** Show a success message ("OTP sent to your mobile"), reveal the OTP input field, and enable the "Login" button.
    *   **Login:**
        *   **Action:** User enters the OTP and taps "Login".
        *   **GraphQL:** `getUserByUserNameQuery` with the mobile number and OTP.
        *   **System Response:** On success, save the returned JWT token to MMKV, store user profile data in the Redux store, and navigate to the Dashboard. On failure, show an error message.

#### 2.3 Main Dashboard (FR-2.0)
*   **Purpose:** Provide a high-level overview of operations and serve as the main navigation hub.
*   **UI Components:**
    *   Custom App Bar with the app name "المراقب الذكي" and a notification icon.
    *   Grid or list of KPI cards (e.g., "Active Trips," "Total Riders," "Vehicles").
    *   Horizontal scrolling banner section for announcements.
    *   Bottom Tab Navigator for navigating between Dashboard, Trips, Inspections, and Profile.
*   **Data Requirements & Actions:**
    *   **KPIs:**
        *   **GraphQL:** `riderAppMainDashboardSubscription` and `getStates` to get live counts.
        *   **Logic:** Data is fed into the Redux store and displayed on the cards.
    *   **Banners:**
        *   **GraphQL:** `getBanners` query to fetch image URLs.
        *   **Logic:** Use a component like `FlatList` (horizontal) with `CachedNetworkImage` to display banners.

#### 2.4 Trips & Routes Screen (UC-03)
*   **Purpose:** Display all assigned trips for the Inspector.
*   **UI Components:**
    *   Tabs: "Scheduled," "Active," "History".
    *   A list of trip cards for the selected tab.
    *   Each card displays: Route Name, Vehicle Plate, Scheduled Time, Status, and number of students.
    *   A floating action button (+) to create an Ad-Hoc trip (UC-05).
*   **Data Requirements & Actions:**
    *   **Fetch Trips:**
        *   **GraphQL:** `courierTripsSubscription` to get a live feed of all assigned trips.
        *   **Logic:** The data is stored in Redux and filtered based on the selected tab (`scheduled`, `started`, or `ended`/`cancelled`).
    *   **Navigate to Trip Details:** Tapping a trip card navigates to the Active Trip Details screen, passing the `trip_uuid`.

#### 2.5 Active Trip Details Screen (UC-04, UC-06, UC-07, UC-08, UC-09, UC-10)
*   **Purpose:** The main operational screen for managing a live trip.
*   **UI Components:**
    *   **Tabbed View:**
        1.  **Map View Tab:** A full-screen `react-native-maps` component.
        2.  **Student List Tab:** A scrollable list of students.
    *   **Map View:**
        *   Vehicle Marker: Shows the bus's current location.
        *   Student Markers: Icons (`assets/icons/school.png`, `assets/icons/user.png`) at each stop location. Marker colors should change based on status (e.g., grey for pending, green for completed, red for missed).
        *   Route Polyline: A line showing the planned route.
    *   **Student List View:**
        *   A `FlatList` of student cards.
        *   Each card contains: Student Photo, Name, Status, and action buttons ("Pick Up," "Drop Off," "Absent").
    *   **Footer/Header Bar:**
        *   Trip status information.
        *   "Start Trip" / "End Trip" button.
        *   "Scan" button to activate the QR/BLE scanner.
*   **Data Requirements & Actions:**
    *   **Initial Load:**
        *   **GraphQL:** Fetch initial trip data using `tripByIdSubscription`. The `trip_uuid` is passed from the previous screen.
    *   **Live Updates:**
        *   **GraphQL:** `tripStepsByTripIdSubscription` provides real-time updates for student statuses. The vehicle's position is updated via `updateTripLocationMutation` sent from the device (UC-15).
    *   **User Actions:**
        *   **Start/End Trip:** Triggers `setTripStartMutation` / `setTripEndMutation`.
        *   **Update Student Status:** Tapping buttons triggers `setPickedUpMutation`, `setDeliveryMutation`, `setMissedMutation`. All mutations must include current `latitude` and `longitude`.
        *   **Scan:** Activates the camera/BLE scanner. On a successful scan, the app identifies the student and triggers the appropriate status update mutation.

#### 2.6 Inspection Screens (UC-11, UC-12)
*   **Purpose:** Manage and conduct vehicle inspections.
*   **UI Components:**
    *   **Inspection List Screen:**
        *   Tabs: "Pending," "Completed."
        *   List of inspection work orders.
    *   **Inspection Form Screen:**
        *   Dynamically rendered form based on the template.
        *   Supported fields: Text Input, Checkbox (`Pass/Fail`), Radio Buttons, Dropdowns, `react-native-tags` for tag input, and a date picker.
        *   "Add Photo" button for each relevant inspection item.
        *   "Submit" button.
*   **Data & Logic:**
    *   **Fetch Data:** Fetch inspection work orders and templates from the backend (GraphQL queries to be confirmed, based on `ApiMobile...` models). Cache these templates locally in WatermelonDB/Realm for offline access.
    *   **Offline First:**
        1.  When an inspector starts an inspection, a new record is created in the local database (WatermelonDB).
        2.  All answers and attached photo URIs (local file paths) are saved to this local record.
        3.  When "Submit" is tapped, the record is marked as `status: 'pending_sync'` and added to the offline action queue.
    *   **Sync Logic:** A background service will later read from this queue, upload photos to a designated storage (if required by the backend), and then send the completed inspection data via a GraphQL mutation.

### 3. Cross-Cutting Concerns

*   **Offline Synchronization Logic (UC-16):**
    *   **Action Queue:** Every mutation that modifies data (`setTripStatus`, `setPickedUp`, inspection submissions, etc.) must first be written to an "Action Queue" in the local database.
    *   **Structure:** Each queue item should contain: `action_id`, `mutation_name`, `variables`, `timestamp`, `retry_count`.
    *   **Sync Service:** A service will run periodically (using `react-native-background-fetch` or upon app start/network reconnection). It will:
        1.  Read the oldest action from the queue.
        2.  Attempt to execute the GraphQL mutation.
        3.  On success (HTTP 200), delete the action from the queue.
        4.  On failure, increment the `retry_count` and try again later with an exponential backoff strategy.
*   **Localization (i18n):**
    *   All user-facing strings will be stored in JSON translation files (e.g., `en.json`, `ar.json`).
    *   The `i18next` library will be initialized to detect the device language and load the appropriate file.
    *   Components will be designed to support RTL layout flips automatically when the language is Arabic. `I18nManager` from React Native will be used to force RTL layout.
*   **GPS Tracking Service (UC-15):**
    *   When a trip starts, a headless JS task or background service will be initiated using `react-native-geolocation-service`.
    *   This service will run even if the app is in the background.
    *   It will periodically get the device's location and call the `updateTripLocationMutation`. To save battery, it should use settings that balance accuracy and frequency.

### 4. Local Data Models (Offline Database Schema)

This is a conceptual schema for the local database (e.g., WatermelonDB).

**Table: `inspections`**
*   `id` (string, primary key)
*   `work_order_id` (string)
*   `template_id` (string)
*   `vehicle_uuid` (string)
*   `status` (string: 'in_progress', 'completed', 'pending_sync', 'synced')
*   `created_at` (timestamp)
*   `answers` (JSON object: `{"question_id": {"value": "...", "notes": "...", "photos": ["file:///..."]}}`)

**Table: `action_queue`**
*   `id` (string, primary key)
*   `mutation_name` (string)
*   `variables` (JSON object)
*   `timestamp` (timestamp)
*   `retry_count` (integer)

This detailed specification provides a clear path for the development team to build a robust, feature-complete, and reliable React Native version of "The Smart Inspector" application.