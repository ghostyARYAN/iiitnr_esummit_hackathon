# Minutes of Meeting (MoM)

**Source File**: [MomMinutes.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/MomMinutes.tsx)

## UI Structure

### Creation Dialog
- Modal for selecting a Gist to convert into a formal Minute of Meeting.
- **Fields**: Gist selection, meeting date, and additional notes.

### Minutes List Table
- Displays draft and finalized MoMs.
- **Columns**: Project Name, Date, Status Badge, and Actions.
- **Locking Indicator**: Padlock icon for finalized (read-only) entries.

### Action Buttons
- Export to PDF
- Export to Word
- Edit (Drafts only)
- Finalize (Drafts only)

## Functionality
- **Gist Conversion**: Copies content from a Gist to a new MoM entry and updates the application status to "MoM Generated".
- **Finalization & Locking**: Once finalized, the MoM becomes read-only, and the application status is set to "Finalized".
- **Exporting**: Generates professional documents from the MoM content using `exportUtils`.
- **Role-Based Access**: Accessible only to users with the "mom_team" role.
