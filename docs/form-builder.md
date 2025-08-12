Excellent. The provided JSON template gives us a very clear picture of how the inspection forms are structured. Based on this example, we can create a detailed specification for a dynamic form builder component in React Native. This component will be the core of the inspection module (UC-12).

Here is a comprehensive specification for the dynamic form builder.

---

## Technical Specification: Dynamic Inspection Form Builder

### 1. Overview & Purpose

The **Dynamic Form Builder** is a reusable React Native component responsible for rendering and managing vehicle inspection forms. Its primary function is to take a JSON template (like the example provided) as input and dynamically generate a complete, interactive, and validatable form.

This component must handle complex form structures including sections, various question types, conditional logic (based on `response_set`), and offline data handling.

### 2. Data Flow & State Management

1.  **Input Prop:** The component will receive a single prop: `template`, which is the JSON object fetched from the API (`ApiMobileTemplates`) and stored locally.
2.  **Internal State:** The component will manage its own state for user responses. This state will be a structured object mapping each `item_id` to its corresponding answer, notes, and photo URIs.
    *   **State Hook:** `useState` or `useReducer` will be used to manage the form's state.
    *   **Example State Structure:**
    ```typescript
    {
      "65": {
        "response_id": "6", // ID of the selected response from the response_set
        "notes": "All systems nominal.",
        "photos": ["file:///path/to/image1.jpg"]
      },
      "69": {
        "response_id": "2",
        "notes": "Fire extinguisher pressure is low.",
        "photos": ["file:///path/to/image2.jpg"]
      },
      // ... more answers
    }
    ```
3.  **Output (on Submit):** When the "Submit" button is pressed, the component will pass the complete, validated state object to a parent callback function, which will then handle saving it to the local offline database.

### 3. Component Architecture & Breakdown

The form builder will be composed of several smaller, specialized components, rendered within a `ScrollView` or `FlatList` to handle long forms.

#### 3.1. Main `FormBuilder` Component
*   **Props:** `template: TemplateJSON`, `onSubmit: (answers: AnswerState) => void`.
*   **Logic:**
    *   Parses the `template.items` array.
    *   Groups questions under their respective sections (`parent_id`).
    *   Sorts sections and questions within sections based on `sort_score`.
    *   Renders a list of `Section` components.
    *   Manages the overall form state and the `onSubmit` handler.

#### 3.2. `Section` Component
*   **Props:** `title: string`, `children: React.ReactNode`.
*   **UI:** A styled header component that displays the section `label`. The color of the header text can be derived from the `color` property (e.g., `rgb(0, 0, 0)`).

#### 3.3. `Question` Component (The Core Renderer)
*   **Props:** `questionData: Item`, `responseSet: ResponseSet`, `value: Answer`, `onChange: (value: Answer) => void`.
*   **Logic:**
    *   This is the most critical component. It uses a `switch` statement on `questionData.options.response_set` to determine which type of input to render.
    *   It renders the question `label`. The label's color is determined by the `color` property.
    *   It renders a small info icon if `tooltip` text is available, which shows the tooltip on press.
*   **Supported Question Types (based on `response_set`):**
    *   **FR-FORM-1: Yes/No/NA (e.g., `response_set: "1"`, `"11"`)**
        *   **UI:** Renders a group of styled, selectable buttons or radio buttons (e.g., "مطابقة" (Pass), "غير مطابقة" (Fail), "لا ينطبق" (N/A)). The `responses` array within the `template_data.response_sets` provides the labels and IDs.
        *   **Logic:** Manages a single selected `response_id`.
    *   **FR-FORM-2: Multiple Choice (e.g., `response_set: "14"`)**
        *   **UI:** Similar to Yes/No, but can have more than two options (e.g., "يعمل بكفاءة جيدة," "يعمل بكفاءة منخفضة," "لايعمل").
        *   **Logic:** Manages a single selected `response_id`.
    *   **FR-FORM-3: Text Input**
        *   **UI:** Renders a `TextInput` component for free-form text entry.
        *   **Logic:** This would be for a `response_set` that is not predefined in the example but should be supported (e.g., a response set of type "text").
    *   **FR-FORM-4: Numeric Input**
        *   **UI:** Renders a `TextInput` with `keyboardType="numeric"`.
        *   **Logic:** Can include client-side validation based on `range_min_validation` and `range_max_validation` from the `options`.
*   **Common Sub-Components for all Questions:**
    *   **Notes Field:** A collapsiblae/optional `TextInput` for adding comments.
    *   **Photo Attachment:** An "Add Photo" button that:
        *   Launches `react-native-image-picker`.
        *   Allows taking a new photo or selecting from the gallery.
        *   Displays thumbnails of attached photos.
        *   Allows removing attached photos.
        *   Stores the local `file:///` URI of the photos.

### 4. Validation Logic

*   **Mandatory Questions:** Before submission, the form builder must iterate through all questions where `options.is_mandatory` is `true`. If any of these questions do not have a response, the submission is blocked, and the UI should scroll to and highlight the first unanswered mandatory question.
*   **Mandatory Photos:** If `options.pic_mandatory` is `true`, the question must have at least one photo attached before submission.
*   **Failed Responses:** When a user selects an answer that is marked as a failure (e.g., its ID is listed in `options.failed_responses`, although in the example this is just a number `2`, likely indicating the *index* or *ID* of the failed response), the component can:
    *   Visually highlight the question in red.
    *   Automatically make the "Notes" and/or "Photo" fields mandatory for that question to enforce documentation of the failure.

### 5. Technical Implementation Details (React Native)

*   **Component Structure:**
    ```
    <ScrollView>
      <FormBuilder template={templateData} onSubmit={handleFormSubmit}>
        {groupedAndSortedItems.map(section => (
          <Section key={section.item_id} title={section.label}>
            {section.questions.map(question => (
              <Question
                key={question.item_id}
                questionData={question}
                responseSet={templateData.template_data.response_sets[question.options.response_set]}
                value={formState[question.item_id]}
                onChange={(newValue) => updateFormState(question.item_id, newValue)}
              />
            ))}
          </Section>
        ))}
      </FormBuilder>
    </ScrollView>
    ```
*   **Styling:** Use `StyleSheet.create` for performance. The `color` strings (e.g., `"119, 0, 0"`) will need to be parsed into a valid CSS color format (e.g., `rgb(119, 0, 0)`).
*   **Performance:** For very long forms, consider using `FlatList` instead of `ScrollView` to virtualize the rendering of questions, preventing all of them from being rendered at once. The `data` for the `FlatList` would be the sorted array of all items (`section` or `question`). The `renderItem` function would then decide whether to render a `Section` header or a `Question` component.

### 6. Offline Capabilities Specification

*   **FR-OFFLINE-1: Template Caching:** All inspection templates (`ApiMobileTemplates`) must be fetched and stored in the local database (WatermelonDB) upon login or app start when online. This ensures that inspections can be initiated even without a network connection.
*   **FR-OFFLINE-2: Draft Saving:** The state of an in-progress inspection form must be saved to the local `inspections` table on every change. This prevents data loss if the user closes the app mid-inspection.
*   **FR-OFFLINE-3: Photo Handling:** Photos taken for an inspection are saved to the device's temporary directory. The local file URI is stored in the `inspections` table.
*   **FR-OFFLINE-4: Submission Queuing:** When the user taps "Submit," the local inspection record is marked as `pending_sync`. A corresponding entry is created in the `action_queue` table.
*   **FR-OFFLINE-5: Background Sync:** The synchronization service will handle the following logic for a pending inspection:
    1.  If the inspection requires photo uploads, first upload each photo to the designated cloud storage (this step depends on backend architecture, which is not specified but is a common pattern).
    2.  Replace the local file URIs in the inspection data with the returned cloud storage URLs.
    3.  Execute the GraphQL mutation to submit the final inspection data.
    4.  On success, update the local inspection record to `status: 'synced'` and delete the action from the queue.

This detailed specification provides a clear roadmap for building a highly functional and robust dynamic form renderer that meets all the requirements inferred from the provided template.