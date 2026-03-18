# Parivesh 3.0 - Chhattisgarh Environmental Clearance System

![Status](https://img.shields.io/badge/Status-Development-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20TypeScript-green)

Parivesh 3.0 is a next-generation unified digital portal designed for the **Chhattisgarh Environment Conservation Board (CECB)**. It streamlines the entire lifecycle of environmental clearance applications, fostering transparency, efficiency, and accountability in the approval process.

## 🚀 Key Features

### 🔐 Role-Based Access Control
- **Project Proponent**: Submit new proposals, track application status, submit meeting gists, and manage payments.
- **Scrutiny Team**: Verify documents, raise **Essential Document Seeking (EDS)** requests, and forward applications for committee review.
- **MoM Team**: Manage meeting minutes, generate gists from transcripts, and finalize Minutes of Meeting (MoM).
- **Admin**: Comprehensive dashboard to manage users, sectors, document templates, and view system-wide analytics.

### 📄 Application Lifecycle Management
- **End-to-End Workflow**: From initial "Draft" submission to "Finalized" clearance.
- **Document Management**: Secure upload and verification of environmental documents (PDFs, etc.).
- **EDS System**: Structured communication channel for requesting missing or additional information from proponents.

### 🤖 AI & Automation
- **AI-Powered Assistance**: Integrated **OpenRouter (Stepfun Step-3.5-Flash Free)** for intelligent chatbot support and content summarization.
- **Meeting Intelligence**: **Fireflies.ai** integration for automated meeting transcription and gist generation.
- **Automated Notifications**: Email alerts for status changes, EDS requests, and meeting schedules.

### 💳 Integrated Payments
- **Razorpay Integration**: Seamless and secure payment processing for application fees.

### 📊 Analytics & Reporting
- **Interactive Dashboards**: Visual insights using Recharts for application trends, sector-wise distribution, and processing times.
- **Geo-Tagging**: Map integration (Leaflet) for visualizing project locations.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) (Vite), [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: React Query (TanStack Query), Context API
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Services**: OpenRouter, Fireflies.ai
- **Maps**: React Leaflet
- **Utilities**: `jspdf` & `docx` for document generation

---

## 📂 Project Structure

```bash
d:\iiitnr_esummit\Project Repo
├── src/
│   ├── components/       # Reusable UI components (Shadcn, Custom)
│   ├── contexts/         # Global state (AuthContext, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Supabase client & types
│   ├── lib/              # Utility functions (export, i18n)
│   ├── pages/            # Application routes & views
│   │   ├── Admin*.tsx    # Admin dashboard pages
│   │   ├── Mom*.tsx      # Meeting management pages
│   │   └── ...           # Other feature pages
│   ├── App.tsx           # Main router configuration
│   └── main.tsx          # Entry point
├── supabase/
│   ├── functions/        # Edge Functions (Razorpay, Email, Fireflies)
│   └── migrations/       # Database schema changes
├── public/               # Static assets
└── docs/                 # Project documentation & specs
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **bun** package manager
- **Supabase Account**: For backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ghostyARYAN/iiitnr_esummit_hackathon.git
   cd iiitnr_esummit_hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   FIREFLIES_API_KEY=your_fireflies_key
   VITE_OPENROUTER_API_KEY=your_openrouter_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:8080` (or the port shown in terminal).

---

## 🗄️ Database Setup (Supabase)

This project uses Supabase for the database and backend logic.

1. **Link Project**: Connect your local environment to your Supabase project.
   ```bash
   npx supabase link --project-ref your-project-id
   ```
2. **Apply Migrations**: Push the schema to your remote database.
   ```bash
   npx supabase db push
   ```
3. **Deploy Edge Functions**:
   ```bash
   npx supabase functions deploy
   ```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

© 2026 CECB — Chhattisgarh Environment Conservation Board. All rights reserved.
Confidential and Proprietary.
