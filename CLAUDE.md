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
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase.ts        # Supabase client + TypeScript types
│   └── utils.ts           # Utility functions (cn, etc.)
```

### Key Architectural Patterns

1. **Data Layer** (`src/lib/supabase.ts`):
   - Centralized Supabase client configuration
   - TypeScript interfaces for database tables: `Booking`, `Van`, `BookingStatusHistory`
   - Requires environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Database Schema**:
   - `bookings` table: Core booking records with status workflow (pending → approved/rejected/cancelled/completed)
   - `vans` table: Van inventory management
   - `booking_status_history` table: Audit trail for status changes
   - All tables include `created_at` and `updated_at` timestamps

3. **Routing**:
   - `/` - Admin dashboard showing all bookings in a table view
   - `/[id]` - Individual booking detail page with approve/reject actions
   - All pages are client-side rendered (use 'use client')

4. **Booking Status Workflow**:
   - **pending**: Initial state when booking is submitted
   - **approved**: Admin approved the booking
   - **rejected**: Admin rejected the booking (with optional admin_notes)
   - **cancelled**: Customer cancelled (planned, not yet implemented)
   - **completed**: Trip finished (planned, not yet implemented)

5. **Component Library**:
   - Uses shadcn/ui components with Radix UI primitives
   - Component configuration in `components.json`
   - Pre-installed: Badge, Button, Card, Dialog, Table, Tabs

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

1. **Path Aliases**: Use `@/*` to import from `src/`, e.g., `import { supabase } from '@/lib/supabase'`

2. **Image Configuration**: Next.js is configured to allow images from `a.storyblok.com` (though not currently used)

3. **Client Components**: Both main pages (`page.tsx` and `[id]/page.tsx`) use `'use client'` directive because they need React hooks and interactivity

4. **Authentication**: Currently NO authentication is implemented. This is a major TODO item - the admin routes are publicly accessible

5. **Type Safety**: TypeScript interfaces in `src/lib/supabase.ts` define the shape of database records. Update these when the database schema changes

## Known TODOs and Roadmap

High-priority items from TODO.md:
- Authentication to protect admin routes (most critical security concern)
- Email notifications for booking confirmations and status changes
- Van management interface
- Calendar view with availability checking and conflict detection
- Payment integration (Stripe or Thai payment providers)
- Customer portal for booking status lookup

Refer to `TODO.md` for the complete roadmap organized by category.

## Database Operations

When working with Supabase:
- Always handle errors from Supabase operations
- Use `.single()` when expecting one result, `.select()` for multiple
- Status updates should include `approved_by`, `approved_at`, and optional `admin_notes`
- Consider implementing status history tracking using the `booking_status_history` table (currently not used in code)
