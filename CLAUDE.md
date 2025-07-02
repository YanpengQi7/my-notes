# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` - Start development server on http://localhost:3000
- `npm run build` - Build production version (CI=false flag for warnings)
- `npm test` - Run tests using React Testing Library
- `npm run vercel-build` - Build for Vercel deployment (CI=false)

### Deployment
- `npm run deploy` - Deploy to GitHub Pages (requires gh-pages setup)
- Vercel deployment configured via vercel.json with SPA routing

## Architecture Overview

This is a React-based notes application with the following key architectural components:

### State Management
- **Redux Toolkit** for global state (templates feature)
- **Local React state** for notes, user auth, and UI state
- Store configured in `src/store/index.js` with templates slice

### Backend Integration
- **Supabase** as backend-as-a-service
- Database: PostgreSQL with Row Level Security (RLS)
- Authentication: Email/password + Google OAuth
- Storage: File uploads to `notes-images` bucket
- Client configured in `src/supabaseClient.js`

### Key Components Structure
- `App.js` - Main application container with auth and notes logic
- `Auth.js` - Authentication (login/register/Google OAuth)
- `AIAssistant.js` - AI-powered writing assistant
- `TemplateManager.js` + `TemplateSelector.js` - Template system
- `ConfirmDialog.js` - Reusable confirmation modals

### Data Flow
1. User authentication via Supabase Auth
2. Notes CRUD operations with RLS policies
3. Real-time updates through Supabase subscriptions
4. Auto-save functionality with debouncing
5. Image uploads to Supabase Storage

## Environment Configuration

Required environment variables in `.env`:
```
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Schema

Main table: `notes`
- `id` (UUID, primary key)
- `title` (TEXT, default '新笔记')
- `content` (TEXT, rich text content)
- `user_id` (UUID, foreign key to auth.users)
- `created_at` / `updated_at` (timestamps)

RLS policies ensure users only access their own notes.

## UI/UX Patterns

- **Rich Text Editor**: React Quill with custom toolbar
- **Responsive Design**: CSS Grid/Flexbox with mobile-first approach
- **Search**: Real-time filtering of notes by content
- **Auto-save**: Automatic saving on content changes
- **Confirmation Dialogs**: For destructive actions (delete notes)

## Key Features Integration

- **AI Assistant**: Integration with Google Gemini for writing help
- **Template System**: Predefined note templates with Redux state
- **Image Upload**: Drag-and-drop with Supabase Storage
- **Google OAuth**: Social authentication alongside email/password

## Testing

- React Testing Library setup in `setupTests.js`
- Test files follow `*.test.js` pattern
- DOM testing utilities configured

## Deployment Considerations

- Build configured to ignore warnings (CI=false)
- SPA routing handled by vercel.json rewrites
- Environment variables must be configured in deployment platform
- Supabase policies must be properly configured for production