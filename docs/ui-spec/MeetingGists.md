# Meeting Gists

**Source File**: [MomGists.tsx](file:///d:/ARyan/iiitnr-esummit/hackathon/src/pages/MomGists.tsx)

## UI Structure

### Gist Cards
- Displays the project name and current gist content.
- Metadata: Sector, Proponent Name, and Creation Date.
- **Action Buttons**: Edit, Save, and Delete.

### Inline Editor
- Textarea for modifying gist content directly on the card.
- Auto-updates as changes are made.

## Functionality
- **Refinement Workspace**: Allows the MoM team to refine AI-generated or template-based summaries before they are used to create formal minutes.
- **Real-time Updates**: Changes are saved directly to the `meeting_gists` table in Supabase.
- **Role-Based Access**: Accessible only to users with the "mom_team" role.
- **Application Linking**: Each gist is associated with a specific application ID.
