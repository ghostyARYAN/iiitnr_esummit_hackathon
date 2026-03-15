# Admin: Sector Management

**Source File**: [AdminSectors.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/AdminSectors.tsx)

## UI Structure

### Sector List Table
- Lists all industry sectors with associated details.
- **Columns**:
  - Sector Name
  - Description
  - Required Documents Count
  - Application Fee Amount

### Management Dialog
- Modal form for adding or editing sector details and document requirements.
- **Fields**: Sector name, description, and document list.

## Functionality
- **CRUD Operations**: Full Create, Read, Update, and Delete capabilities for industry sectors.
- **Requirement Definition**: Allows admins to define a newline-separated list of documents required for applications in that sector.
- **Role-Based Access**: Accessible only to users with the "admin" role.
- **Real-time Synchronization**: Reflects changes in document requirements and fees as sectors are updated.
- **Fee Management**: Allows admins to set application fees per sector.
