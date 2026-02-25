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
- `/components/Controls.tsx`: Start / Pause / Resume / Stop / Next Phase buttons.
- `/components/HistoryModal.tsx`: Past sessions list with expandable timelines and delete controls.
- `/components/Modal.tsx`: "Session Interrupted" distraction modal.
- `/components/SettingsMenu.tsx`: Collapsible settings panel (timer durations + bell volume). Toggled by a gear icon button in the header.
- `/components/SettingsPanel.tsx`: Original always-visible duration sliders — **unused**, superseded by SettingsMenu.
- `/components/Timeline.tsx`: Dual-mode progress bar (live slider ↔ full segmented timeline).
- `/components/TimerDisplay.tsx`: Large MM:SS clock with overflow prefix and phase-aware color.
- `/types.ts`: TypeScript definitions (`Phase`, `Settings`, `TimerState`, `TimelineSegment`, `HistoryEntry`).
- `/constants.ts`: Default settings and base64-encoded WAV alarm (`DING_B64`).
- `/index.tsx`: React entry point.
- `/index.html`: HTML template — loads Tailwind via CDN, defines custom slider/animation styles.

## Key Logic & Restrictions
- **Timer:** Uses `requestAnimationFrame` for high-precision ticking.
- **Persistence:** Automatically saves settings, current timer state, timeline, and history to `localStorage` under three keys: `fluoritefocus_v1`, `fluoritefocus_timeline`, `fluoritefocus_history`.
- **Overflow:** Tracks time spent *after* the timer reaches zero. Green glow on Focus overflow (keep going), red glow on Break overtime.
- **Smart Reset:** Settings changes only apply to the next session or if the timer is stopped.
- **Settings Menu:** The gear button (⚙) to the right of the session name toggles `isSettingsOpen`. When open, `<SettingsMenu>` mounts between the header and timer.
- **No Backend:** This is a pure client-side application. Do not add server-side dependencies unless explicitly requested.
