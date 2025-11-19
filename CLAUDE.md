# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CoconutRoads Admin is a booking management dashboard for a van rental service in Thailand. It's built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and Supabase for the backend.

## Development Commands

```bash
# Install dependencies (project uses pnpm)
pnpm install

# Run development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4, shadcn/ui components (Radix UI primitives)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom configuration
- **Icons**: Lucide React
- **Package Manager**: pnpm (not npm)

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Admin dashboard (booking list)
│   ├── [id]/page.tsx      # Individual booking detail page
│   ├── login/page.tsx     # Login page
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── login-form.tsx     # Login form with Supabase auth
│   └── auth-provider.tsx  # Auth context wrapper with logout
├── lib/
│   ├── supabase.ts        # Legacy Supabase client + TypeScript types
│   ├── supabase-client.ts # Browser Supabase client (SSR-compatible)
│   ├── supabase-server.ts # Server Supabase client (SSR-compatible)
│   └── utils.ts           # Utility functions (cn, etc.)
└── proxy.ts               # Next.js 16 request proxy for route protection
```

### Key Architectural Patterns

1. **Authentication** (`src/proxy.ts`, `src/components/auth-provider.tsx`):
   - **Route Protection**: `src/proxy.ts` uses Next.js 16 proxy to protect all admin routes
   - Redirects unauthenticated users to `/login`
   - Redirects authenticated users away from `/login` to dashboard
   - **Login**: Email/password authentication via Supabase Auth at `/login`
   - **Session Management**: Handled via Supabase Auth cookies with `@supabase/ssr`
   - **Logout**: Available in header on all protected pages via `AuthProvider`
   - Admin users must be created in Supabase Dashboard → Authentication → Users

2. **Data Layer**:
   - `src/lib/supabase.ts` - **DEPRECATED CLIENT** - Contains TypeScript interfaces (`Booking`, `Van`, `BookingStatusHistory`). **NEVER import the `supabase` client from this file** - it doesn't handle cookie-based authentication and will cause data operations to fail silently. Only import TypeScript types from here.
   - `src/lib/supabase-client.ts` - **USE THIS for client components** (components with `'use client'` directive that run in the browser). Properly handles auth cookies.
   - `src/lib/supabase-server.ts` - **USE THIS for server components** (no `'use client'` directive, runs on server). Properly handles auth cookies.
   - Requires environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Database Schema**:
   - `bookings` table: Core booking records with status workflow (pending → approved/rejected/cancelled/completed)
   - `vans` table: Van inventory management
   - `booking_status_history` table: Audit trail for status changes
   - All tables include `created_at` and `updated_at` timestamps

4. **Routing**:
   - `/login` - Public login page (redirects to `/` if already authenticated)
   - `/` - Protected admin dashboard showing all bookings in a table view
   - `/[id]` - Protected booking detail page with approve/reject actions
   - All pages use `'use client'` directive for React hooks and interactivity

5. **Booking Status Workflow**:
   - **pending**: Initial state when booking is submitted
   - **approved**: Admin approved the booking
   - **rejected**: Admin rejected the booking (with optional admin_notes)
   - **cancelled**: Customer cancelled (planned, not yet implemented)
   - **completed**: Trip finished (planned, not yet implemented)

6. **Component Library**:
   - Uses shadcn/ui components with Radix UI primitives
   - Component configuration in `components.json`
   - Pre-installed: Badge, Button, Card, Dialog, Input, Label, Table, Tabs
   - **IMPORTANT - Tailwind CSS 4 Compatibility Issue**:
     - This project uses Tailwind CSS 4 (CSS-first configuration)
     - `npx shadcn@latest add` may incorrectly transform components to use old Tailwind v3 syntax
     - **Issue**: CLI changes `w-(--sidebar-width)` (v4 syntax with parentheses) to `w-[--sidebar-width]` (v3 syntax with brackets)
     - **Solution**: For Tailwind v4 projects, copy components directly from the shadcn reference repo instead of using the CLI
     - **Reference Repo**: `/Users/bryan/repos/playground/ui/apps/v4/registry/new-york-v4/`
     - After copying, update imports from `@/registry/new-york-v4/...` to `@/...`
     - Check for Tailwind v4 syntax: CSS custom properties should use `w-(--var-name)` NOT `w-[--var-name]`

## Code Style

The project uses Prettier with these settings:
- No semicolons
- Single quotes
- No trailing commas
- 120 character line width
- 2 space indentation
- Arrow functions without parens (when possible)
- Single attribute per line in JSX

## Important Implementation Details

1. **Next.js 16 Specifics**:
   - **CRITICAL**: This project uses Next.js 16. DO NOT use features from Next.js 15 or earlier versions
   - Use `proxy.ts` (NOT `middleware.ts`) for request interception
   - The proxy function must be exported as `export function proxy(request: NextRequest)` or as default export
   - Proxy runs on Node.js runtime (not Edge Runtime)
   - Example proxy.ts structure:
     ```typescript
     import { NextResponse, NextRequest } from 'next/server'

     export function proxy(request: NextRequest) {
       return NextResponse.next()
     }

     export const config = {
       matcher: '/protected/:path*'
     }
     ```

2. **Path Aliases**: Use `@/*` to import from `src/`, e.g., `import { supabase } from '@/lib/supabase'`

3. **Image Configuration**: Next.js is configured to allow images from `a.storyblok.com` (though not currently used)

4. **Client Components**: Pages use `'use client'` directive when they need React hooks and interactivity

5. **Type Safety**: TypeScript interfaces in `src/lib/supabase.ts` define the shape of database records. Update these when the database schema changes

6. **Supabase Client Usage**:
   - **CRITICAL**: The legacy `supabase` client from `@/lib/supabase` does NOT handle authentication properly. Using it will cause database operations to fail silently or not persist data.
   - **Client components** (with `'use client'` directive):
     ```typescript
     import { createClient } from '@/lib/supabase-client'
     import type { Booking, Van } from '@/lib/supabase' // Types only

     const supabase = createClient()
     const { data, error } = await supabase.from('bookings').select('*')
     ```
   - **Server components/actions** (no `'use client'` directive):
     ```typescript
     import { createClient } from '@/lib/supabase-server'
     import type { Booking, Van } from '@/lib/supabase' // Types only

     const supabase = await createClient()
     const { data, error } = await supabase.from('bookings').select('*')
     ```
   - The SSR-compatible clients handle cookie-based session management automatically. The distinction is about where the code runs (browser vs server), NOT about admin vs user access.

## Known TODOs and Roadmap

High-priority items from TODO.md:
- ✅ ~~Authentication to protect admin routes~~ - COMPLETED (Supabase Auth with proxy.ts)
- Email notifications for booking confirmations and status changes
- Van management interface
- Calendar view with availability checking and conflict detection
- Payment integration (Stripe or Thai payment providers)
- Customer portal for booking status lookup

Refer to `TODO.md` for the complete roadmap organized by category.

## Testing

### Playwright E2E Tests

The project uses Playwright for end-to-end testing with the MCP Playwright integration.

**Test Credentials** (for development/testing environment):
- Email: `contact@coconutroads.com`
- Password: `123456`

These credentials are for local testing and automated E2E tests only. Do not use in production.

## Database Operations

When working with Supabase:
- Always handle errors from Supabase operations
- Use `.single()` when expecting one result, `.select()` for multiple
- Status updates should include `approved_by`, `approved_at`, and optional `admin_notes`
- Consider implementing status history tracking using the `booking_status_history` table (currently not used in code)

### Understanding Database Structure

You have access to tools for inspecting the database schema:

1. **MCP Supabase Tools** (preferred for quick inspection):
   - `mcp__supabase__list_tables` - Lists all tables in the database (defaults to `public` schema)
   - `mcp__supabase__list_migrations` - Shows migration history
   - `mcp__supabase__execute_sql` - Run SQL queries to inspect schema details
   - Example: Use `execute_sql` with queries like `SELECT * FROM information_schema.columns WHERE table_name = 'bookings'` to see column details

2. **Supabase CLI** (for comprehensive schema inspection):
   - The project includes Supabase CLI configuration in `supabase/` directory
   - Use `pnpm supabase db inspect` to view database schema
   - Use `pnpm supabase migration list` to see migration history
   - Use `pnpm supabase db diff` to compare local and remote schemas

Use these tools when you need to understand table structures, relationships, constraints, or available columns before implementing database operations.
