# Portfolio Project - Noah Ojile

## Overview

This is a personal portfolio website for Noah Ojile, a full-stack developer specializing in web development, blockchain technology, and data analysis. The project is built using modern web technologies and showcases projects, skills, and professional experience through an interactive, responsive interface.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Database**: Supabase PostgreSQL (fully serverless)
- **API Layer**: Direct Supabase client integration
- **Data Management**: Live data fetching from Supabase tables
- **Authentication**: Supabase built-in auth system
- **Real-time**: Supabase real-time subscriptions capability

### Key Components

#### Frontend Components
- **ProfileCard**: Interactive profile display with image switching functionality
- **ProjectsCarousel**: Horizontal scrollable showcase of projects with keyboard navigation
- **ContactModal**: Form-based contact system with validation
- **ThemeSwitch**: Dark/light theme toggle with persistent storage
- **TechStackCard**: Animated technology showcase
- **LiveClock**: Real-time clock display
- **WorkExperienceCard**: Expandable experience timeline

#### Backend Components
- **Database Schema**: Complete portfolio schema with 8 tables (profile, projects, experiences, testimonials, skills, tech_stack, fun_facts, contacts)
- **API Endpoints**: Direct Supabase client functions for all database operations
- **React Query Integration**: Custom hooks for data fetching with caching and real-time updates
- **Contact Management**: Form submissions saved directly to Supabase

### Data Flow

1. **Direct Database Connection**: Components fetch live data directly from Supabase
2. **API Layer**: Supabase client provides type-safe database operations
3. **Data Fetching**: React Query hooks handle caching, loading states, and real-time updates
4. **Dynamic Content**: All portfolio cards load content dynamically from database
5. **Contact Management**: Form submissions stored in database with full audit trail
6. **Content Management**: All portfolio content managed through Supabase dashboard

### External Dependencies

#### Core Framework Dependencies
- React 18 with TypeScript support
- Vite for build tooling and development server
- Supabase for backend database and real-time features
- TanStack Query for data fetching and caching

#### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI for accessible component primitives
- Shadcn/ui for pre-built component library
- Custom theme system with CSS variables

#### Development Tools
- TypeScript for type safety
- ESLint and Prettier for code quality
- Hot Module Replacement for development efficiency

### Deployment Strategy

#### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: Fully serverless with Supabase
- **Static Assets**: Public files served directly from CDN

#### Deployment Targets
- **Primary**: Any static hosting (Netlify, Vercel, GitHub Pages)
- **Development**: Replit with live preview
- **Alternative**: Any static file hosting service

#### Environment Configuration
- Development: Vite dev server with Supabase connection
- Production: Static site deployment with Supabase backend
- Database: Supabase PostgreSQL with built-in connection pooling

#### Asset Management
- PDF downloads served from public directory
- Images served from public directory
- Profile images kept local for performance

## Changelog

```
Changelog:
- June 23, 2025. Initial setup
- June 23, 2025. Migrated from Express.js server to serverless architecture with Supabase
- June 23, 2025. Complete Supabase database integration with live data fetching
  * Database schema implemented with 8 tables for full portfolio content
  * All components now fetch data dynamically from Supabase (projects, experiences, testimonials, skills, tech stack, fun facts)
  * Contact form submissions save directly to database
  * Removed all server-side dependencies and deprecated files
  * Cleaned up project structure for pure serverless architecture
- June 24, 2025. Complete admin dashboard implementation
  * Long-press authentication on "Ojile" name for secure admin access
  * Full CRUD operations for all 8 database tables
  * Real-time cache invalidation between admin and frontend
  * Fixed ProjectModal to use live Supabase data instead of static data
  * Enhanced cache management with reduced stale times for faster updates
- June 24, 2025. Enhanced project cards and modal functionality
  * Fixed project card indicators to show database sort order instead of ID
  * Removed duplicate close buttons from all modals
  * Added video embedding support for YouTube/Vimeo URLs in project modals
  * Videos display below project screenshots when available
- June 24, 2025. Improved admin workflow and navigation
  * Added theme switcher to admin dashboard
  * Admin preview now navigates to main site instead of modal
  * Added floating admin panel button on main site when logged in
  * Session management ensures admin access persists across page navigation
  * Auto-cleanup of expired sessions (24-hour validity)
- June 24, 2025. Database-driven assets with fallbacks
  * Profile card now uses database URLs for images with fallback to public files
  * Download CV button uses database URL with fallback to static file
  * Profile name, bio, and social links load from database with static fallbacks
  * Maintains backward compatibility when database fields are empty
- June 24, 2025. Enhanced contact form and project management
  * Contact form now shows success notification and transforms modal after message submission
  * Added project reordering modal within Projects tab (simplified interface with just names and images)
  * Project positions can be rearranged using up/down arrow buttons with visual feedback
  * Contact modal resets cleanly and allows sending multiple messages
- June 24, 2025. Vercel deployment configuration
  * Added vercel.json with proper static site configuration
  * Created build:client script for frontend-only builds
  * Added chunk splitting to reduce bundle sizes and improve loading performance
  * Configured rewrites for SPA routing support
- July 6, 2025. Migration to standard Replit environment and admin UI improvements
  * Successfully migrated from Replit Agent to standard Replit environment
  * Redesigned admin dashboard with sidebar navigation instead of tabs
  * Added icon-based sidebar with hover expansion and smooth transitions
  * Projects now automatically get assigned to last position when created (auto sort_order)
  * Added "Welcome Noah" message to admin dashboard overview section
  * Enhanced admin interface with better responsive behavior and modern design patterns
  * Fixed sidebar to be fixed position with proper scrolling behavior
  * Added Instagram, Facebook, and Medium social media fields to profile management
  * Updated ProfileCard to show social media icons dynamically (only when links exist)
  * LinkedIn icon now shows properly when database value is present
  * Implemented automatic sort order management for projects (auto-assignment on create, auto-reordering on delete)
  * Made project sort order non-editable and informational only (shows current/predicted position)
  * Created complete "Others" section with database table, frontend components, and admin management
  * Others section displays as cards below contact buttons, only visible when items exist
  * Others modal system identical to projects with support for 5 item types (tool, resource, tutorial, template, other)
- July 7, 2025. Simplified Others table and added reordering functionality
  * Simplified the "others" database table by removing image_url, technologies, video_url, download_url, is_featured, and status columns
  * Updated all components (OthersManager, OthersSection, OthersModal, OthersReorderManager) to work with simplified structure
  * Added reorder functionality for Others section identical to Projects section
  * Others now supports only: title, description, link (optional), item_type, sort_order
  * Reorder button available in admin dashboard Others management section
  * All admin CRUD operations updated for simplified schema
- July 7, 2025. Custom types and UI improvements for Others section
  * Changed Others section to support custom types (free text input instead of predefined dropdown)
  * Updated main page to display Others as horizontal scrollable rectangular cards without images
  * Cards show title, two-line description truncation, and custom type badges with color coding
  * Removed "Open Original" buttons from Others modals for cleaner interface
  * Removed "Link available" indicators from cards to reduce vertical height
  * Others modals now match Project modal width (max-w-2xl)
  * Enhanced type color system to support common custom types (guide, library, framework, plugin, etc.)
  * Database constraint issue identified: item_type column has check constraint preventing custom values
- July 8, 2025. Complete markdown support and enhanced media rendering
  * Created comprehensive markdown editor with preview tabs for admin management
  * Added full markdown renderer supporting headers, tables, code blocks, links, and rich formatting
  * Enhanced Others modals to display markdown content with fallback to simple description
  * Added RGB glowing border animation for Others cards on hover (cycling through rainbow colors)
  * Enhanced video embedding to support Instagram posts and reels alongside YouTube/Vimeo
  * Added automatic webpage screenshot functionality for regular links using multiple free services
  * Special handling for Medium articles with green styling and branding
  * Created database migration file for adding markdown_content column and removing type constraints
  * Added comprehensive prose styling for markdown content with proper theme support
- July 8, 2025. Complete removal of redundant static assets for fully database-driven architecture
  * Removed all static project images (9 files) since projects now load dynamically from Supabase
  * Removed static projects data file that was no longer imported or used
  * Removed duplicate profile images, keeping only database-driven profile system
  * Removed static CV file since downloads now use database URLs exclusively
  * Removed all placeholder image files and replaced with inline base64 SVGs in LinkPreview utility
  * Updated ProfileCard to show placeholder when no database images are available
  * Updated DownloadCVButton to hide completely when no database CV URL is available
  * Cleaned public directory completely - app now fully serverless with no static dependencies
- July 24, 2025. Successfully migrated from Replit Agent to standard Replit environment
  * Completed seamless migration with all dependencies intact
  * Enhanced Others section with center-justified layout for improved visual balance
  * Added 9:16 aspect ratio banner images to Others cards similar to project cards
  * Cards now display link preview images as banners with proper aspect ratios
  * Improved responsive design with horizontal scrolling when screen width is exhausted
  * Fixed TypeScript errors in LinkPreview utility for better type safety
  * Restored horizontal rectangular card layout (320px x 160px) with left-side banner images
  * Type badges remain visible and properly colored for different item categories
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```