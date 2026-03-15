# Dashboard Home

**Source File**: [DashboardHome.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/DashboardHome.tsx)

## UI Structure

### Stat Cards
- Displays high-level metrics for the user.
- **Metrics Included**:
  - Total Applications
  - Submitted
  - Under Scrutiny
  - EDS Pending
  - Referred
  - Finalized

### Workflow Pipeline
- Visual horizontal step-indicator showing the application lifecycle.
- **Stages**: Draft → Submitted → Scrutiny → EDS → Referred → MoM → Final.
- Shows the count of applications currently at each stage.

### Analytics Section
- **Applications by Sector**: Bar chart showing distribution across different industry sectors.
- **Status Distribution**: Pie chart showing the percentage of applications in each state.
- **Submission Trend**: Line chart showing the trend of application submissions over the last 30 days.

## Functionality
- **Real-time Data**: Fetches statistics and sector-specific data from Supabase.
- **Role-Based Views**: Adjusts header text and visible data based on the user's role (Admin, Proponent, Scrutiny, or MoM team).
- **Responsive Charts**: Uses `recharts` for dynamic data visualization.
