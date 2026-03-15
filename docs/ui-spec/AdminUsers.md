# Admin: Users & Roles

**Source File**: [AdminUsers.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/AdminUsers.tsx)

## UI Structure

### Users Table
- Lists all registered users.
- **Columns**:
  - Full Name
  - Email Address
  - Organization
  - Role (with colored badge)
  - Action (Role Selector)

### Role Selector
- Dropdown menu in each row to change a user's access level.
- **Available Roles**: Admin, Proponent, Scrutiny Team, and MoM Team.

## Functionality
- **Dynamic Role Management**: Immediately updates the `user_roles` table in Supabase upon selection.
- **Visual Feedback**: Uses color-coded badges to identify roles quickly.
- **Role-Based Access**: Accessible only to users with the "admin" role.
- **Real-time Synchronization**: Reflects role changes across the entire platform.
