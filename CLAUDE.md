# CLAUDE.md - Fluorite Focus Project Guide

## Project Overview
Fluorite Focus is a high-contrast, professional-grade Pomodoro timer built with React and TypeScript. It features persistent settings, session history, a visual timeline of work/break balance, and distraction management.

## Tech Stack
- **Framework:** React 19 (Functional Components, Hooks)
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Utility-first, high-contrast dark theme)
- **State Management:** React `useState`, `useEffect`, `useRef`, `useCallback`
- **Persistence:** Browser `localStorage`

## Core Commands
- `npm run dev`: Start development server (port 3000)
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally

## Code Conventions
- **Components:** Use functional components with explicit prop interfaces.
- **Styling:** Strictly use Tailwind CSS classes. Maintain a "True Black" (#000000) background.
- **Types:** Define all interfaces and enums in `types.ts`.
- **Constants:** Store default settings and static assets (like base64 audio) in `constants.ts`.
- **State:** Keep the source of truth in `App.tsx` and pass data down via props.
- **Performance:** Use `useCallback` and `useMemo` for expensive calculations or stable function references.
- **Icons:** Use inline SVGs or `lucide-react` (if installed).

## Project Structure
- `/App.tsx`: Main application logic and state orchestration.
- `/components/`: Reusable UI components.
- `/types.ts`: TypeScript definitions.
- `/constants.ts`: Shared configuration and assets.
- `/index.tsx`: Entry point.
- `/index.html`: Main HTML template with Tailwind configuration.

## Key Logic & Restrictions
- **Timer:** Uses `requestAnimationFrame` for high-precision ticking.
- **Persistence:** Automatically saves settings, current timer state, timeline, and history to `localStorage`.
- **Overflow:** Tracks time spent *after* the timer reaches zero (useful for finishing a task or extending a break).
- **Smart Reset:** Settings changes only apply to the next session or if the timer is stopped.
- **No Backend:** This is a pure client-side application. Do not add server-side dependencies unless explicitly requested.
