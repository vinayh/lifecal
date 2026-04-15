# LifeCal

A life calendar web app that visualizes your entire life as a grid of weeks. Each cell represents one week — past weeks can be annotated with notes and tags to reflect on how you've spent your time.

## Project Structure

This is a monorepo with two independent packages:

```
lifecal/
├── web/              # React frontend
├── backend/          # Firebase Cloud Functions backend
```

### Frontend (`web/`)

A single-page React application built with:

- **React 19** + **React Router 7** for routing
- **Mantine 8** for UI components (forms, modals, date inputs, notifications)
- **Zustand** for state management with localStorage persistence
- **Firebase Auth** for authentication (email/password, Google, GitHub)
- **Zod** for runtime schema validation
- **Vite** for development and builds
- **TypeScript**

Key pages:
- **Home** — Landing page
- **Login** — Login/register with email, Google, or GitHub
- **Profile** — Set name, date of birth, and life expectancy
- **Calendar** — Life calendar grid where each cell is a clickable week

### Backend (`backend/functions/`)

Serverless API built with Firebase Cloud Functions:

- **addUser / deleteUser** — Firestore triggers that sync Firebase Auth users to the database
- **getUserAndEntries** — Fetches user profile and all calendar entries
- **updateUserProfile** — Updates profile fields (name, birth date, life expectancy)
- **addUpdateEntry** — Creates or updates a calendar entry (note + tags) for a given week
- **deleteEntry** — Removes a calendar entry

Data is stored in Firestore under a `users` collection, with entries in a nested `entries` subcollection.

## Development

### Prerequisites

- [Bun](https://bun.sh/) (package manager)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### Frontend

```sh
cd web
bun install
bun run dev        # Start Vite dev server on port 5173
```

### Backend

```sh
cd backend/functions
bun install
bun run serve      # Build + start Firebase emulator
```

### Deployment

```sh
# Frontend (GitHub Pages)
cd web
bun run deploy

# Backend (Firebase Cloud Functions)
cd backend
firebase deploy --only functions
```
