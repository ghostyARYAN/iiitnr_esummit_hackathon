# Application Detail

**Source File**: [ApplicationDetail.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/ApplicationDetail.tsx)

## UI Structure

### Header
- Displays the project title and current status.
- Metadata: Application ID, Category, Sector, and Submission Date.
- **Action Buttons**: Export to PDF and Export to Word.

### Project Information Card
- Detailed description of the project.
- Location and contact information.
- Payment Status indicator.

### Documents Section
- Lists all uploaded files with verification status badges.
- Download link for each document.

### Action Cards (Role-Based)
- **Scrutiny Team**:
  - Begin Scrutiny button.
  - Flag EDS (Essential Documents Sought) with remarks.
  - Refer for Meeting.
- **Proponents**:
  - Pay Now (if payment is pending).
  - Resubmit EDS (if document clarification is requested).

### Status Timeline
- Vertical list of all status changes.
- Shows timestamp, new status, and associated remarks.

## Functionality
- **Payment Integration**: Uses Razorpay for application fee processing.
- **Workflow State Transitions**: Manages complex status changes between different application stages.
- **Document Verification**: Scrutiny team can mark individual documents as verified or missing.
- **Auto-Gist Generation**: Automatically creates a meeting gist when an application is referred to a committee.
- **Exporting**: Generates professional PDF and Word documents using `exportUtils`.
