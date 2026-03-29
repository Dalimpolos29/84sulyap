# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

84Sulyap is an alumni portal for UPIS Batch '84, built with Next.js 15, React 19, Supabase, and TypeScript. The platform enables alumni to reconnect through profile management, directory features, and event organization.

## Development Commands

```bash
# Development
npm run dev                 # Start dev server (uses next dev)

# Building
npm run build              # Install dependencies with --legacy-peer-deps and build
                          # Note: react-icons requires --legacy-peer-deps flag

# Production
npm start                  # Start production server

# Linting
npm run lint              # Run Next.js linter (ESLint disabled during builds)
```

## Architecture

### Authentication & Authorization
- **Supabase Auth**: Email-based authentication with session management
- **Middleware**: `src/middleware.ts` handles auth redirects for `/` and `/login` routes
- **Client/Server Supabase**: Separate clients for browser (`utils/supabase/client.ts`) and server (`utils/supabase/server.ts`) contexts
- Server client uses Next.js 15's async cookies API

### State Management
- **ProfileContext**: Global profile state via `src/contexts/ProfileContext.tsx`
  - Wraps user profile data with computed values (fullName, displayName, initials)
  - Provides `useProfileContext()` hook for consuming components
  - Must wrap components with `<ProfileProvider user={user}>`
- **useProfile Hook**: Core profile fetching and management in `src/hooks/useProfile.ts`

### Routing Structure (Next.js App Router)
- `(auth)` - Route group for auth pages (login, register)
- `admin` - Admin dashboard and management
- `api` - API routes
- `events` - Event management features
- `members` - Alumni directory
- `profile` - User profile pages (uses slug format: firstname_lastname)
- `support`, `privacy-policy`, `terms-of-use` - Static pages
- `verify-email` - Email verification flow

### Component Organization
Follow the structure defined in `.cursor/rules/file-organization-rule.mdc`:

**Components:**
- `components/ui/` - Generic, reusable UI elements
- `components/features/{feature-name}/` - Feature-specific components
  - `features/profile/` - Profile-related components
  - `features/members/` - Member directory components
  - `features/media/` - Image/video processing components
- `components/icons/` - Icon components
- `components/layout/` - Layout components (LayoutProvider)
- `components/providers/` - Context providers
- `components/common/` - Shared components
- `components/auth/` - Authentication components
- `components/admin/` - Admin-specific components

**Utilities:**
- `utils/supabase/` - Supabase client creation (client.ts, server.ts)
- `utils/profileQueries.ts` - Profile data fetching utilities
- `utils/slugify.ts` - URL slug generation for profiles
- `utils/avatarUtils.ts` - Avatar handling and storage cleanup

**Hooks:**
- Feature-specific: `hooks/use{FeatureName}.ts`
- Current: `useProfile.ts` for profile data management

**File Naming:**
- PascalCase for component files
- camelCase for non-component files
- Keep files under 300 lines when possible

### Key Technical Details

**Next.js Configuration:**
- SVG imports handled via @svgr/webpack
- Remote images allowed from all HTTPS domains
- Cache-Control: no-store to prevent browser caching issues
- X-Frame-Options: ALLOWALL for embedding
- ESLint ignored during builds

**TypeScript:**
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Target: ES2022

**Styling:**
- Tailwind CSS with custom configuration
- Font variables: `--font-geist-sans`, `--font-geist-mono`, `--font-lora`
- Global styles in `src/styles/globals.css`

**Profile URLs:**
- Format: `/profile/{firstname_lastname}`
- Slugs generated via `utils/slugify.ts`

**Dependencies Note:**
- Install commands require `--legacy-peer-deps` flag (especially for react-icons)
- React 19 and Next.js 15 may have peer dependency conflicts with some packages

## Environment Variables

Required variables (stored in `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Deployment

- **Platform**: Vercel
- **Auto-deployment**: Triggered on pushes to `main` branch
- **Build command**: Uses custom build script with --legacy-peer-deps
