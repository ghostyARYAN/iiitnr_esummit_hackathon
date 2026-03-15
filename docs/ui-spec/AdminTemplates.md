# Admin: Templates

**Source File**: [AdminTemplates.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/AdminTemplates.tsx)

## UI Structure

### Templates Table
- Lists available meeting gist templates.
- **Columns**:
  - Template Name
  - Associated Sectors
  - Template Content
  - Action (Edit, Delete)

### Template Creator Dialog
- Modal form with a large textarea for defining template structures.
- **Fields**: Template name, sector selection, and content.

## Functionality
- **Placeholder Support**: Supports templates with placeholders like `{{project_name}}` which are automatically replaced during gist generation.
- **Sector Targeting**: Templates can be assigned to specific sectors or marked as "Global".
- **Role-Based Access**: Accessible only to users with the "admin" role.
- **Dynamic Content Generation**: Uses templates to auto-generate meeting gists for applications referred to a committee.
- **CRUD Operations**: Full Create, Read, Update, and Delete capabilities for templates.
