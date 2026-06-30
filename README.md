# RoadWatch

## Overview

RoadWatch is a web application for reporting road hazards, tracking incident status, and managing municipal maintenance workflows. Citizens can submit hazard reports with location details and images. Administrators and municipal staff can review reports, assign tasks, and monitor progress through the dashboard.

## Features

- Email/password authentication via Supabase
- Role-based access for citizens, municipal staff, and administrators
- Hazard report creation with AI-informed classification and severity analysis
- Real-time report updates using Supabase subscriptions
- Staff approval workflow for municipal accounts
- Region-based filtering and reporting metrics for admins
- Email notifications for new reports, assignments, and status changes

## Tech Stack

- Frontend: React, TypeScript, Vite
- Styling/UI: Tailwind CSS, shadcn-ui, Radix UI primitives
- Backend: Supabase Auth, Supabase Database, Supabase Edge Functions
- State & data fetching: React Context, React Query
- Utilities: Zod, date-fns, lucide-react

## Project Structure

- `src/`
  - `App.tsx` — application entry with routing and provider composition
  - `components/` — reusable UI widgets, forms, cards, and layout components
  - `contexts/` — authentication and application data contexts
  - `data/` — mock data and AI analysis helper logic
  - `integrations/supabase/` — Supabase client setup
  - `pages/` — application screens and role-specific dashboards
  - `hooks/` — shared hooks such as location lookup
  - `types/` — domain models and TypeScript interfaces
  - `utils/` — utility functions like email notification invocation
- `supabase/`
  - `functions/` — Supabase edge functions for email and location proxy
  - `migrations/` — database migration scripts
- `.env` — local environment variables for Supabase configuration

## Architecture

RoadWatch uses Supabase for authentication, database storage, and serverless edge functions. The app flows as follows:

1. User signs up or logs in through Supabase Auth.
2. `AuthContext` loads user profile and role data from Supabase tables.
3. `DataContext` fetches hazard reports, regions, and user records.
4. New reports are inserted into Supabase and analyzed using a local AI helper.
5. Real-time subscriptions refresh report data after updates.
6. Email notifications are sent by invoking Supabase functions for report events.

## Installation Steps

1. Clone the repository:

```sh
git clone <YOUR_GIT_URL>
cd AI-Powered-Pothole-reporting-system
```

2. Install dependencies:

```sh
npm install
```

3. Create a `.env` file in the project root and provide Supabase values.

4. Start the development server:

```sh
npm run dev
```

5. Open the local URL displayed by Vite.

## Environment Variables

Create a `.env` file with the following keys:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_SUPABASE_PROJECT_ID=your-supabase-project-id
```

## Usage

- Use `/signup` to create a citizen, municipal staff, or admin account.
- Citizens can submit hazard reports, view their report history, and monitor nearby hazards.
- Municipal staff verify identity and await admin approval before accessing assignments.
- Administrators review reports, approve staff, assign tasks, and filter hazards by region.
- Authenticate at `/login` and access the dashboard at `/dashboard`.

## Build & Deployment

Build the production assets:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

Deployment notes:

- Serve the built app through a static host compatible with Vite output.
- Configure Supabase environment variables for production.
- Deploy Supabase edge functions and database migrations using the Supabase CLI or dashboard.

## Future Improvements

- Add map-based hazard submission with geolocation pin selection
- Store uploaded images in Supabase Storage and display them in reports
- Replace mock AI analysis with a dedicated prediction service
- Improve mobile layouts and offline report caching
- Add finer-grained auditing and workflow history

## License

This repository does not currently include a license file. Add a `LICENSE` if you want to specify usage and contribution terms.


