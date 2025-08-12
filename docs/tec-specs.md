Of course. The next logical step after defining the requirements and technical specifications is to create a structured **Project Plan and Development Roadmap**. This plan breaks down the entire project into manageable phases (sprints), outlines the key tasks for each phase, and provides a clear path from setup to deployment.

This roadmap will be invaluable for the project manager and the development team to track progress and allocate resources effectively.

---

## Project Plan & Development Roadmap: The Smart Inspector (React Native Rebuild)

This document outlines the phased development plan for rebuilding The Smart Inspector application in React Native. The project is divided into seven distinct phases, each with specific goals, tasks, and deliverables.

### Phase 1: Project Foundation & Core Setup (Sprint 1)

**Goal:** Establish a stable, runnable project foundation with all essential libraries and configurations in place. The output of this phase will be a "hello world" level app that successfully connects to the backend.

**Key Tasks:**
1.  **Project Initialization:**
    *   Create a new React Native project using the TypeScript template.
    *   Set up the project structure: `/src`, `/components`, `/screens`, `/services`, `/redux`, `/navigation`, `/assets`, etc.
2.  **Dependency Integration:**
    *   Install and configure core libraries:
        *   `react-navigation` for the basic navigation structure.
        *   `@apollo/client` for GraphQL communication.
        *   `@reduxjs/toolkit` for state management.
        *   `react-native-mmkv-storage` for secure, fast local storage.
        *   `i18next` and `react-i18next` for localization setup.
3.  **Basic App Shell:**
    *   Implement the main navigation structure: a Splash screen leading to a conditional navigator (either the Auth stack or the Main App stack).
    *   The Main App stack will be a Bottom Tab Navigator with placeholders for Dashboard, Trips, Inspections, and Profile.
4.  **API Connectivity:**
    *   Configure Apollo Client with the Hasura GraphQL HTTP and WebSocket endpoints.
    *   Implement logic to attach the JWT token from MMKV to the headers of all authenticated requests.
5.  **Splash Screen Logic (FR-1.0):**
    *   Implement the logic to check for a valid auth token in MMKV and navigate to either the Login screen or the Dashboard.

**Deliverable:** A runnable app on both iOS and Android simulators that shows a splash screen and then navigates to a placeholder login screen. The app should be able to make an unauthenticated test query to the GraphQL endpoint.

---

### Phase 2: User Authentication & Core UI (Sprint 2)

**Goal:** Implement the complete user authentication flow and build out the static UI for the main application screens.

**Key Tasks:**
1.  **Build Login UI (UC-01):**
    *   Develop the Login screen with input fields for mobile number and OTP.
    *   Implement form validation and state management for the inputs.
2.  **Implement Authentication Logic (UC-01):**
    *   Connect the UI to Apollo Client mutations: `sendOtp` and `getUserByUserNameQuery`.
    *   Handle the success and error states of the API calls, showing appropriate user feedback (e.g., "OTP sent," "Invalid login").
    *   On successful login, securely store the JWT token and user profile data.
3.  **Build Core Screens UI:**
    *   Develop the static UI for the **Dashboard**, **Trips List**, **Inspections List**, and **Profile** screens based on the provided assets and inferred layout.
4.  **Implement Logout (UC-02):**
    *   Add a "Log Out" button to the Profile screen.
    *   Implement the logic to clear the auth token, reset the Redux store, and navigate back to the Login screen.

**Deliverable:** A user can successfully log into the application using a real mobile number and OTP, see the main dashboard, navigate between the empty tab screens, and log out.

---

### Phase 3: Trip & Live Map Implementation (Sprints 3-4)

**Goal:** Build the core functionality of viewing and managing trips, including the live map tracking feature.

**Key Tasks:**
1.  **Trips List Screen (UC-03):**
    *   Integrate the `courierTripsSubscription` to populate the Trips List screen with live data.
    *   Implement the tabbed view to filter trips by "Scheduled," "Active," and "History".
2.  **Map Integration (UC-07):**
    *   Integrate `react-native-maps` into the Active Trip Details screen.
    *   Fetch and draw the route polyline on the map using data from `getVehicleRoutePlan` or the trip object itself.
    *   Fetch and display student stop markers on the map.
3.  **Trip Lifecycle Management (UC-04, UC-06):**
    *   Implement the "Start Trip" functionality, linking the button to the `setTripStartMutation`.
    *   Implement the "End Trip" functionality, linking the button to the `setTripEndMutation`.
    *   Handle UI state changes based on the trip status.
4.  **Background GPS Tracking (UC-15):**
    *   Set up a background task using `react-native-geolocation-service`.
    *   When a trip is started, this service will activate, periodically sending the device's location to the backend via the `updateTripLocationMutation`.

**Deliverable:** The Inspector can view all their trips, start a trip, see their vehicle's location updating in real-time on a map with the route and stops displayed, and end the trip.

---

### Phase 4: Student Management & Interaction (Sprint 5)

**Goal:** Enable the Inspector to manage student check-ins and check-outs during an active trip.

**Key Tasks:**
1.  **Student Checklist UI (UC-08):**
    *   Build the student list component within the Active Trip Details screen.
    *   Use the `tripStepsByTripIdSubscription` to display a live-updating list of students and their statuses.
2.  **Manual Status Updates (UC-09):**
    *   Implement the "Pick Up," "Drop Off," and "Absent" buttons for each student.
    *   Each button press must capture the current GPS coordinates and trigger the corresponding GraphQL mutation (`setPickedUpMutation`, etc.).
3.  **QR Code Scanning (UC-10):**
    *   Integrate `react-native-vision-camera` or a similar library.
    *   Create a scanner interface that, upon a successful QR scan, identifies the student and prompts the Inspector to confirm the check-in/out.
4.  **BLE Beacon Scanning (UC-10 - *Stretch Goal*):**
    *   Integrate `react-native-ble-plx`.
    *   Implement background BLE scanning to detect student beacons when the app is in the foreground.
    *   Develop the logic to associate beacon IDs with students and trigger status updates. This is a complex task and may be deferred if time is a constraint.

**Deliverable:** An Inspector on an active trip can view a list of students, manually update their status, and use the camera to scan a student's QR code for a quick check-in.

---

### Phase 5: Offline Inspection Module (Sprints 6-7)

**Goal:** Create a fully functional, offline-first vehicle inspection module.

**Key Tasks:**
1.  **Local Database Setup:**
    *   Define the schemas for `inspections` and `action_queue` in WatermelonDB or Realm.
2.  **Inspection List & Form UI (UC-11, UC-12):**
    *   Build the UI for the inspections list.
    *   Develop a dynamic form component that renders questions and input types based on a JSON template fetched from the API (`ApiMobileTemplates`).
3.  **Offline Data Persistence (UC-12):**
    *   Implement the logic to save all inspection form data, including local photo paths, directly to the local database as the user fills it out.
    *   When the user submits the form offline, create an action item in the `action_queue` table.
4.  **Synchronization Service (UC-16):**
    *   Build a robust synchronization service that runs on app start and network reconnection.
    *   This service will process the `action_queue`, send the stored mutations to the server, and handle success/failure cases.

**Deliverable:** The Inspector can select and complete a full vehicle inspection, attach photos, and submit it, regardless of network connectivity. If offline, the report is saved locally and synced automatically when the connection is restored.

---

### Phase 6: Finalizing Features & UI Polish (Sprint 8)

**Goal:** Complete all remaining features, refine the user experience, and prepare the app for release.

**Key Tasks:**
1.  **Notifications (UC-13, UC-14):**
    *   Integrate FCM and configure the app to receive and display push notifications.
    *   Build the Notification History screen, fetching data from the `getNotifications` query.
2.  **Localization & RTL:**
    *   Ensure all strings are extracted into translation files.
    *   Thoroughly test the entire application in Arabic to ensure the RTL layout is correct and there are no UI bugs.
3.  **UI/UX Refinement:**
    *   Add loading indicators, empty states, and error messages throughout the app.
    *   Implement smooth screen transitions and micro-interactions.
    *   Ensure a consistent design and branding across all screens.
4.  **Comprehensive Testing:**
    *   Perform end-to-end testing of all user flows.
    *   Conduct rigorous testing of the offline functionality.
    *   Test GPS accuracy and battery consumption of the background service.

**Deliverable:** A feature-complete, stable, and polished application that has been thoroughly tested and is ready for beta release.

---

### Phase 7: Deployment & Post-Launch

**Goal:** Successfully publish the application to the Apple App Store and Google Play Store.

**Key Tasks:**
1.  **App Store Preparation:**
    *   Generate all required app icons, splash screens, and store screenshots.
    *   Write the app store descriptions, privacy policy links, and metadata in both English and Arabic.
2.  **Android Release:**
    *   Generate a signed Android App Bundle (AAB).
    *   Set up the app listing on the Google Play Console and publish to an internal testing track, then to production.
3.  **iOS Release:**
    *   Configure App IDs, certificates, and provisioning profiles in the Apple Developer portal.
    *   Archive and upload the build to App Store Connect using Xcode.
    *   Submit the app for review.
4.  **Post-Launch Monitoring:**
    *   Set up monitoring for crashes and performance issues using a tool like Sentry or Firebase Crashlytics.
    *   Monitor user feedback and prepare for the first patch release.

**Deliverable:** The Smart Inspector application is live and available for download on the Google Play Store and the Apple App Store.