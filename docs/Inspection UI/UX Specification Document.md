Of course. Here are the detailed functional and user experience specifications for building an inspection UI/UX, based on the React and shadcn/ui stack. This document contains no code and focuses entirely on the "what" and "why."

---

## **Inspection UI/UX Specification Document**

### 1.0 Overview

This document specifies the user interface (UI) and user experience (UX) requirements for a digital inspection application. The primary goal is to provide an inspector with a clear, efficient, and reliable tool for completing inspection checklists on various devices (mobile, tablet, desktop). The UI will be built using a component-based architecture and will be dynamically rendered from a JSON template structure.

### 2.0 User Personas & Scenarios

*   **Persona 1: The On-Site Inspector (Primary User)**
    *   **Needs:** Speed, accuracy, minimal distractions, clear indication of progress, ability to add evidence (notes, photos) for failed items.
    *   **Environment:** Often on a factory floor, in a vehicle, or at a construction site. May be using a mobile phone or tablet. May have intermittent internet connectivity.
    *   **Scenario:** At the start of their shift, an inspector pulls out their tablet to perform the "Daily Forklift Safety Check." They need to complete all 20 questions, note any issues, and submit the report before they can begin using the equipment.

*   **Persona 2: The Safety Manager (Secondary User)**
    *   **Needs:** To review completed inspections, see a clear summary of pass/fail status, identify critical failures immediately, and ensure compliance.
    *   **Scenario:** A manager logs into a web dashboard (out of scope for this spec) to review the day's forklift inspections. They need to quickly see that an inspection failed, open it, and view the photos and comments related to the failure.

### 3.0 Core UI/UX Principles

The design and functionality will adhere to the following principles:

*   **Clarity over Density:** Prioritize readability and focus. Avoid overwhelming the user with too much information at once.
*   **Efficiency of Interaction:** Minimize taps, clicks, and typing. Use large, tappable targets for common responses.
*   **Immediate & Obvious Feedback:** The user must instantly understand the consequence of their input (e.g., a "Pass" or "Fail" response).
*   **Guided Workflow:** The interface will guide the user through the inspection, only presenting relevant information and follow-up actions when necessary.
*   **Progressive Disclosure:** Complex information or follow-up questions are hidden until they are contextually relevant.
*   **Responsive & Accessible:** The experience must be seamless across all target devices and usable by people with disabilities (WCAG 2.1 AA compliance).

### 4.0 Functional Specifications

#### 4.1 Main Inspection View

This is the primary screen where the user performs the inspection.

*   **4.1.1 Layout:** The view is vertically oriented and composed of three main parts:
    1.  **Header:** Contains metadata about the inspection.
    2.  **Progress Indicator:** A visual summary of completion.
    3.  **Inspection Body:** The list of sections and questions.
    4.  **Footer:** Contains primary actions like saving or submitting.

*   **4.1.2 Header Component:**
    *   Displays the inspection `name` (e.g., "Daily Forklift Safety Check").
    *   Renders all items from the `header_items` array of the JSON template. Each item will be rendered as a non-editable display field or a pre-filled input (e.g., "Date and Time," "Inspector Name").

*   **4.1.3 Progress Indicator Component:**
    *   A visual progress bar that shows the percentage of *required* questions that have been answered.
    *   The bar updates in real-time as the user answers questions.
    *   An accompanying text label will display the status (e.g., "15 of 20 questions complete").

*   **4.1.4 Inspection Body (Accordion Layout):**
    *   The main body of the inspection, containing the `items` from the JSON template.
    *   **Behavior:** It will be rendered as an **Accordion**.
    *   **Default State:** Only the first incomplete section is open by default. All other sections are collapsed.
    *   **Interaction:** The user can tap on any section header to expand its content and collapse the others. This enforces the "Clarity and Focus" principle.

#### 4.2 Section Component (Accordion Item)

Each `section` from the JSON template is an item in the accordion.

*   **4.2.1 Section Header (Accordion Trigger):**
    *   Displays the section `label` (e.g., "Pre-Operation Check").
    *   To the right of the label, a status icon provides a quick summary of the section's state:
        *   **No Icon:** Section is incomplete.
        *   **Green Checkmark Icon:** Section is complete, and all scored items passed.
        *   **Red Warning Icon:** Section is complete, but contains at least one failed item.

*   **4.2.2 Section Content (Accordion Content):**
    *   When expanded, the section displays a vertical list of its child `items` (questions).
    *   Each question is visually separated and clearly laid out within a `Card`-like container for distinction.

#### 4.3 Question Item Component

This component dynamically renders a question based on its `type` from the JSON.

*   **4.3.1 General Structure:**
    *   Every question item must display its `label`.
    *   If a question is marked as required, an asterisk (*) will be displayed next to the label.

*   **4.3.2 Type: `question` (Multiple Choice):**
    *   **Rendered as:** A `Radio Group` component.
    *   **UX:** Instead of small, standard radio buttons, the options (`Yes`, `No`, `N/A`) will be rendered as full-width, distinct `Button` components. This provides a large, easy-to-tap target.
    *   **Feedback:** Upon selection, the chosen button will adopt the `color` specified in its response data (e.g., green for "Yes," red for "No," grey for "N/A"). Unselected buttons return to a neutral/default state.

*   **4.3.3 Type: `text` or `textarea`:**
    *   **Rendered as:** A standard `Input` or `Textarea` field.
    *   **Behavior:** Allows for free-text entry. If `allow_photos` is true, a button to "Add Photo" will be displayed below the text field. This button will launch the device's camera or file selector.

*   **4.3.4 Type: `signature`:**
    *   **Rendered as:** A dedicated rectangular canvas area for drawing.
    *   **Behavior:** The user can draw their signature using a mouse or touch input. A "Clear" button must be present below the canvas to allow the user to reset their signature.

#### 4.4 Conditional Logic ("Smart Fields")

This is the system for implementing progressive disclosure.

*   **Visibility:** A question item with a `parent_id` is hidden by default.
*   **Trigger:** The item becomes visible only when the user selects the specific response in the parent question that matches the `conditions`.
*   **Example:** A "Describe the leak" text field (child) will only appear *after* the user selects "Yes" on the "Any signs of fluid leaks?" question (parent).
*   **Animation:** The appearance of the child question should be smooth (e.g., slide down and fade in) to avoid a jarring UI change.
*   **Requirement:** If a conditionally shown field is marked as required, it contributes to the overall progress calculation only after it becomes visible.

#### 4.5 Footer & Submission Logic

*   **Position:** The footer is "sticky," meaning it remains visible at the bottom of the viewport as the user scrolls.
*   **Actions:** The footer contains two primary buttons:
    1.  **"Save Draft":** Saves the current state of answers locally. Allows the user to close the app and resume later.
    2.  **"Complete & Submit":** The final action to submit the inspection.
*   **Validation:**
    *   The "Complete & Submit" button is **disabled** by default.
    *   It becomes enabled only when all `required` questions (including conditionally-shown required questions) have been answered.
    *   If a user taps the disabled button, a toast notification or subtle message should appear, informing them: "Please complete all required fields."

### 5.0 Non-Functional Requirements

*   **State Persistence:** The user's answers (the `answers` state object) must be saved to the browser's `localStorage` on every change. If the user accidentally closes the tab or refreshes the page, their progress must not be lost.
*   **Performance:** The UI must remain responsive and fluid, with no noticeable lag when selecting answers or when conditional fields are triggered.
*   **Accessibility (a11y):** All interactive elements must be keyboard-navigable. All controls must have appropriate ARIA labels for screen reader compatibility. Color should not be the *only* means of conveying information (e.g., failed items are marked with a red color *and* a warning icon).