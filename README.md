# Parivesh 3.0

## Chhattisgarh Environmental Clearance System

Parivesh 3.0 is a unified digital portal for the Chhattisgarh Environment Conservation Board (CECB). It streamlines the complete lifecycle of environmental clearance applications, from initial filing to finalized Minutes of Meeting.

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS, Lucide React
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Payment Integration**: Razorpay
- **Documentation**: docx, jspdf

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```sh
   git clone <YOUR_GIT_URL>
   ```

2. Navigate to the project directory:
   ```sh
   cd Parivesh-3.0
   ```

3. Install dependencies:
   ```sh
   npm install
   # or
   bun install
   ```

4. Start the development server:
   ```sh
   npm run dev
   # or
   bun dev
   ```

## Project Structure

- `src/components`: Reusable UI components and layout elements.
- `src/pages`: Main application pages and routes.
- `src/contexts`: React contexts for state management (e.g., Auth).
- `src/hooks`: Custom React hooks.
- `src/integrations`: API clients and integrations (Supabase, Razorpay).
- `supabase/migrations`: Database schema and migrations.

## License

© 2026 CECB — Chhattisgarh Environment Conservation Board. All rights reserved.
