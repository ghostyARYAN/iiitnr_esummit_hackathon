# Scrutiny Review

**Source File**: [ScrutinyReview.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/ScrutinyReview.tsx)

## UI Structure

### Review Queue Table
- Specialized view showing only applications in the following states:
  - Submitted
  - Under Scrutiny
  - EDS (Essential Documents Sought)
- **Columns**: Project Name, Category, Status Badge, and Submission Date.

### Filter Bar
- Standard application filters for search, category, and sector.

## Functionality
- **Queue Management**: Provides a focused workspace for the Scrutiny Team to manage pending tasks.
- **Review Links**: Direct links to the `ApplicationDetail` page for each entry in the queue.
- **Filtering Logic**: Uses `useApplicationFilters` for efficient search and filtering.
- **Role-Based Access**: Accessible only to users with the "scrutiny_team" role.
