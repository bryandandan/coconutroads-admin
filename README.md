# CoconutRoads Admin Dashboard

A booking management dashboard for CoconutRoads van rental service in Thailand. Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Supabase.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Supabase account and project

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

Create a `.env` file in the root directory with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Setting Up Authentication

The admin dashboard is protected with Supabase authentication. To create an admin user:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Enter an email and password for the admin account
5. Click **Create user**

Alternatively, use the Supabase SQL Editor to create a user:

```sql
-- Create an admin user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@coconutroads.com',
  crypt('your-secure-password', gen_salt('bf')),
  now()
);
```

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the login page.

### Building for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Admin dashboard (booking list)
│   ├── [id]/page.tsx      # Individual booking details
│   ├── login/page.tsx     # Login page
│   └── layout.tsx         # Root layout with auth provider
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── login-form.tsx     # Login form component
│   └── auth-provider.tsx  # Auth context with logout
├── lib/
│   ├── supabase.ts        # Legacy Supabase client + types
│   ├── supabase-client.ts # Browser Supabase client
│   ├── supabase-server.ts # Server Supabase client
│   └── utils.ts           # Utility functions
└── proxy.ts               # Next.js 16 request proxy (auth protection)
```

## Authentication System

This project uses a simple email/password authentication system via Supabase Auth:

- **Route Protection**: The `src/proxy.ts` file (Next.js 16 proxy) protects all routes except `/login`
- **Login**: Users authenticate via `/login` with email/password
- **Session Management**: Handled automatically by Supabase Auth cookies
- **Logout**: Available in the header on all protected pages

## Key Features

- Protected admin routes with Supabase authentication
- Booking list view with status badges
- Individual booking detail pages
- Approve/reject booking functionality
- Responsive design with Tailwind CSS

## Learn More

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
