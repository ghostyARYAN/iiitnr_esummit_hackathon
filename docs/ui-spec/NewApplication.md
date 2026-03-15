# New Application

**Source File**: [NewApplication.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/NewApplication.tsx)

## UI Structure

### Multi-step Wizard
- **Step 1: Category & Sector Selection**
  - Dropdown for category and sector.
  - Dynamically displays required documents and fees for the chosen sector.
- **Step 2: Project Details**
  - Text inputs for project title, description, location, and proponent information.
- **Step 3: Document Uploads**
  - Drag-and-drop file upload zone.
  - Lists required documents with upload indicators.
- **Step 4: Payment**
  - Displays the final fee summary.
  - Razorpay payment button.

### Step Indicator
- Visual horizontal progress tracker at the top of the page.

## Functionality
- **Draft Saving**: Automatically saves progress to the database before final submission.
- **Dynamic Validation**: Ensures all required fields and documents are provided before proceeding to the next step.
- **Storage Integration**: Directly uploads files to Supabase storage buckets.
- **Payment Flow**: Forces application fee payment via Razorpay before the "Submit" action is enabled.
- **Real-time Updates**: Reflects changes in document requirements and fees as sectors are selected.
