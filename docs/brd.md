Excellent request. Based on the comprehensive set of files you've provided from the `inspector_ui` and `istimara` Flutter projects, we can reverse-engineer the application's functionality and create a detailed Business Requirements Document (BRD) to guide its reconstruction in React Native.

The analysis of the source code, dependencies (`pubspec.yaml`), assets, and especially the GraphQL schema (`v1-Grid view (1).csv`) reveals a sophisticated application for transportation logistics, specifically for inspectors or supervisors at a company named "Tatweer Transit" in Saudi Arabia. The app's Arabic name is "المراقب الذكي" (The Smart Inspector).

Here is a full, detailed BRD for building this application using React Native.

---

## Business Requirements Document: The Smart Inspector App

**Document Version:** 1.0
**Date:** May 24, 2024
**Author:** AI Analysis & BRD Generation
**Project:** Inspector Mobile Application (React Native Rebuild)

### 1. Introduction

#### 1.1 Purpose
This document outlines the business, functional, and non-functional requirements for developing "The Smart Inspector," a mobile application for field inspectors and supervisors. The original application was built using Flutter, and this document will serve as the primary guide for rebuilding it from the ground up using **React Native** for both iOS and Android platforms.

#### 1.2 Project Background
"The Smart Inspector" is an operational tool for Tatweer Transit, a company specializing in educational transportation in Riyadh, Saudi Arabia. The application empowers field inspectors and supervisors (referred to as "Couriers" in the schema) to monitor, manage, and report on school bus trips in real-time. Key functions include live trip tracking, managing student (rider) pickup/drop-off status, conducting vehicle inspections, and ensuring compliance with operational standards.

#### 1.3 Scope
##### In-Scope:
*   A cross-platform mobile application for iOS and Android built with React Native.
*   All features present in the original Flutter application, including user authentication, dashboard, trip management, live map tracking, student status updates (including BLE/QR integration), and vehicle inspections.
*   Offline capabilities for core functionalities like completing inspections and updating trip step statuses.
*   Integration with the existing Hasura GraphQL backend.
*   Integration with Firebase Cloud Messaging for push notifications.

##### Out-of-Scope:
*   Development or modification of the backend Hasura GraphQL API.
*   Development of the separate application for Parents/Riders.
*   Development of the web-based administrative dashboard.
*   User account creation and management (these are assumed to be provisioned via the admin dashboard).

#### 1.4 Stakeholders
*   **Inspectors/Supervisors:** Primary users of the application in the field.
*   **Operations Managers:** Oversee daily operations and rely on the data collected by the app.
*   **IT/Development Team:** Responsible for building and maintaining the application.
*   **Tatweer Transit Management:** Stakeholders interested in safety, compliance, and efficiency metrics.

---

### 2. Business Objectives
The primary business goals of The Smart Inspector application are:
*   **Enhance Student Safety:** Provide real-time tracking of buses and accurate, timestamped records of student pickups and drop-offs.
*   **Increase Operational Efficiency:** Streamline the process of managing trips, tracking vehicle locations, and conducting mandatory inspections.
*   **Improve Data Accuracy:** Automate data collection through GPS, timestamps, and BLE/QR scanning to reduce human error.
*   **Ensure Compliance:** Maintain a digital audit trail of all trip activities and vehicle inspections to meet regulatory and internal standards.
*   **Provide Real-Time Visibility:** Give the operations team a live view of all active trips, enabling proactive issue resolution.

---

### 3. Functional Requirements

#### 3.1 User Authentication & Profile
*   **FR-1.1: Login:** Users shall log in using their registered mobile number. The system will use a One-Time Password (OTP) verification process.
    *   *Technical Detail:* Leverages `isUserRegistered` and `getUserByUserNameQuery` GraphQL queries.
*   **FR-1.2: Session Management:** The app must securely store the user's authentication token (`jaguar_jwt`) and manage the session, keeping the user logged in until they explicitly log out.
*   **FR-1.3: User Profile:** A user profile screen shall display the inspector's name (in Arabic and English), mobile number, and associated organization details.
*   **FR-1.4: Logout:** Users must have a clear option to log out of the application, which will clear their session token.

#### 3.2 Main Dashboard
*   **FR-2.1: Key Performance Indicators (KPIs):** The dashboard shall display real-time statistics, including:
    *   Number of active trips (`courierActiveTripsCount`).
    *   Total riders/students managed.
    *   Total vehicles in the fleet.
    *   *Technical Detail:* Data is fetched via `riderAppMainDashboardSubscription` and `getStates` queries.
*   **FR-2.2: Banners/Announcements:** The dashboard should display promotional or informational banners.
    *   *Technical Detail:* Images fetched from the `getBanners` query.

#### 3.3 Trip & Route Management
*   **FR-3.1: View Assigned Routes & Trips:** The user shall be able to view a list of all assigned routes and their scheduled trips (e.g., morning "origin-to-destination" and afternoon "destination-to-origin").
    *   *Technical Detail:* Populated by `getCourierRoutes` and `courierTripsSubscription`.
*   **FR-3.2: Trip Details View:** Tapping a trip shall navigate to a detailed view showing the route name, vehicle details (plate number, type), scheduled time, and a list of student stops.
*   **FR-3.3: Live Trip Monitoring (Map View):**
    *   For an active trip, the app must display a real-time map.
    *   The map must show the vehicle's current location, which updates periodically.
    *   The planned route shall be drawn on the map as a polyline (`getVehicleRoutePlan`).
    *   Each student stop (pickup or drop-off) must be marked on the map with a distinct icon.
*   **FR-3.4: Trip Execution:** The user must be able to start and end trips.
    *   A "Start Trip" button will become active near the scheduled departure time. Pressing it updates the trip status.
    *   An "End Trip" button will conclude the trip, capturing the final location and timestamp.
    *   *Technical Detail:* Uses `setTripStartMutation` and `setTripEndMutation`, capturing GPS coordinates.

#### 3.4 Student (Rider) Status Management
*   **FR-4.1: Student Checklist:** Within the active trip view, there must be a checklist of all students (riders) on that route, ordered by their stop sequence (`riding_sequence`).
*   **FR-4.2: Update Student Status:** For each student, the inspector must be able to perform the following actions, each capturing the precise time and GPS location:
    *   **Pick Up:** Mark the student as successfully picked up (`setPickedUpMutation`).
    *   **Drop Off:** Mark the student as successfully delivered (`setDeliveryMutation`).
    *   **Mark as Absent:** Mark a student as missed/absent for a pickup (`setMissedMutation`).
*   **FR-4.3: Automated Check-in/Check-out (BLE/QR):**
    *   The application must have the capability to scan for Bluetooth Low Energy (BLE) beacons or QR codes associated with each student.
    *   Upon a successful scan, the app should automatically suggest updating the student's status (e.g., "Check-in [Student Name]?").
    *   *Technical Detail:* Based on `bleRiderUpdate` and `bleHistoryInsert` mutations. This implies interaction with device hardware (Bluetooth/Camera).
*   **FR-4.4: View Student Details:** Tapping on a student's name shall show relevant details (e.g., photo, pickup/drop-off address).

#### 3.5 Vehicle Inspection ("Istimara") Module
*   **FR-5.1: Access Inspections:** Users shall be able to access a list of pending and completed vehicle inspections.
    *   *Technical Detail:* Based on the `istimara` package, `ApiMobileWorkorders` and `ApiMobileInspections` models.
*   **FR-5.2: Perform Inspection:** Users must be able to select a vehicle and initiate a new inspection based on a predefined template.
    *   *Technical Detail:* Templates are fetched and managed via the `ApiMobileTemplates` model.
*   **FR-5.3: Inspection Form:** The inspection form will be dynamic, based on the template, and must support various input types (e.g., text, multiple choice, checkboxes, tags).
*   **FR-5.4: Photo Attachment:** Users must be able to attach photos to inspection items using the device's camera or from the photo library.
    *   *Technical Detail:* Requires camera and photo library permissions.
*   **FR-5.5: Offline Functionality:** Users must be able to complete and save an entire inspection report while offline. The saved report will be synced with the server once a network connection is available.
    *   *Technical Detail:* Local storage (e.g., MMKV, WatermelonDB, or SQLite) is critical here to replace Hive's functionality.

#### 3.6 Notifications
*   **FR-6.1: Push Notifications:** The application must be able to receive and display push notifications for important events (e.g., new trip assignment, delays, emergency alerts).
    *   *Technical Detail:* Integrates with Firebase Cloud Messaging (FCM).
*   **FR-6.2: Notification History:** The app shall include a screen that displays a history of all received notifications.
    *   *Technical Detail:* Data fetched via `getNotificationsByParentId` or `getNotifications` queries.

---

### 4. Non-Functional Requirements

*   **NFR-1.0 Performance:**
    *   The app should launch in under 3 seconds.
    *   Map interactions (panning, zooming) must be smooth and responsive, even with multiple points of interest.
    *   UI transitions should be fluid (60 FPS).
*   **NFR-2.0 Reliability:**
    *   The application must have a crash-free session rate of >99.5%.
    *   Offline mode must be robust, ensuring no data loss during network outages.
*   **NFR-3.0 Usability:**
    *   The UI must be clean, simple, and intuitive for users who may be operating a vehicle.
    *   Key action buttons (Start/End Trip, Pick Up/Drop Off) must be large and easily tappable.
    *   The application must fully support both **English** and **Arabic** languages, including Right-to-Left (RTL) layout for Arabic.
*   **NFR-4.0 Security:**
    *   All communication with the backend API must be over HTTPS/WSS.
    *   Sensitive data, such as the user authentication token and API keys, must be stored securely in the device's keychain/keystore.
    *   The app must request necessary permissions (Location, Camera, Bluetooth, Notifications) at runtime with clear explanations for the user.
*   **NFR-5.0 Platform:**
    *   The application must be developed using **React Native**.
    *   It must be fully functional on iOS 13.0+ and Android 6.0 (API level 23)+.

---

### 5. Technical & Integration Requirements

*   **TIR-1: Technology Stack:** React Native.
*   **TIR-2: API Integration:** The app will communicate with the existing Hasura backend via GraphQL.
    *   **GraphQL Endpoint:** `https://sso-api.tatweertransit.com/v1/graphql`
    *   **Subscription Endpoint:** `wss://sso-api.tatweertransit.com/v1/graphql`
*   **TIR-3: Mapping:** Google Maps SDK must be used for all map-related functionalities. The existing API keys should be securely configured.
*   **TIR-4: Local Storage:** A robust local storage solution (e.g., **MMKV**, **WatermelonDB**, or **SQLite via react-native-sqlite-storage**) must be implemented to replace Hive for offline data persistence.
*   **TIR-5: Push Notifications:** Firebase Cloud Messaging (FCM) SDK for React Native will be used.
*   **TIR-6: Hardware Integration:**
    *   **GPS:** `react-native-geolocation-service` or a similar library for high-accuracy location tracking.
    *   **Camera:** `react-native-image-picker` or `react-native-vision-camera` for capturing inspection photos.
    *   **Bluetooth (BLE):** `react-native-ble-plx` for scanning student beacons.

---

### 6. Recommendations for React Native Implementation
*   **State Management:** Use a scalable state management library like Redux Toolkit, Zustand, or MobX to manage application state, especially for real-time trip data.
*   **GraphQL Client:** Use Apollo Client (`@apollo/client`) for its robust caching, state management, and support for queries, mutations, and subscriptions.
*   **Navigation:** Use React Navigation (`@react-navigation/native`) for handling screen transitions.
*   **Map Component:** Use `react-native-maps` for integrating Google Maps.
*   **Offline Sync:** Implement a background service or queueing mechanism (e.g., using `react-native-background-fetch`) to handle the synchronization of offline data (inspections, trip events) with the backend.

---