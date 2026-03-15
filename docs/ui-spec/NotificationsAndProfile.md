# Notifications & Profile

**Source Files**: [Notifications.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/Notifications.tsx), [Profile.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/Profile.tsx)

## UI Structure

### Notifications Page
- Lists all user-specific alerts.
- **Alert Details**:
  - Notification Message
  - Timestamp
  - Mark as Read/Unread
  - View Application link

### Profile Page
- Form for updating personal details.
- **Fields**:
  - Full Name
  - Email Address (Read-only)
  - Organization
  - Phone Number
- **Action Button**: Save Changes.

## Functionality
- **Real-time Notifications**: Instantly reflects application status changes and meeting schedules.
- **Account Management**: Allows users to update their personal information and view their account email.
- **Data Persistence**: Changes are saved directly to the `profiles` table in Supabase.
- **Role-Based Views**: Adjusts visible notifications and profile fields based on the user's role.
