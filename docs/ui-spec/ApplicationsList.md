# Applications List

**Source File**: [ApplicationsList.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/ApplicationsList.tsx)

## UI Structure

### Filter Bar
- Integrated `ApplicationFilters` component.
- **Features**: Search bar, category filter, sector filter, and status filter.

### Bulk Actions Toolbar (Admin/Scrutiny only)
- Appears when one or more applications are selected.
- **Controls**: Status dropdown and "Apply" button.

### Applications Table
- Lists applications with the following columns:
  - Project Name
  - Category
  - Status (with colored badge)
  - Fee Payment Status
  - Submission Date

### Pagination
- Standard controls for navigating through multiple pages of results.

## Functionality
- **Role-Based Views**: Proponents only see their own applications; Admins see all.
- **Bulk Status Update**: Allows authorized users to change the status of multiple applications at once.
- **CSV Export**: Option to download the currently filtered application data as a spreadsheet.
- **Filtering Logic**: Integrates with `useApplicationFilters` for client-side filtering and sorting.
