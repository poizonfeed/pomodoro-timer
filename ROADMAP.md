# ROADMAP.md - Fluorite Focus Evolution

## ✅ Phase 1: Core Functionality (v1.0)
- [x] Pomodoro timer logic (Focus / Short Break / Long Break cycles).
- [x] High-contrast "True Black" dark theme.
- [x] Settings persistence (durations, volume).
- [x] Overflow tracking (counts up after 00:00, `+` prefix with proper spacing).
- [x] Distraction management modal (Restart vs. Take a Break).

## ✅ Phase 2: Visualization & UX (v1.1 - v1.2)
- [x] Visual Timeline bar showing work/break balance across a session.
- [x] Keyboard shortcuts (Space: toggle, R: stop session, Esc: menu/interrupt).
- [x] Pulsating "Resume" button and glowing "Pause" state.
- [x] Alarm sound with volume control and preview button.
- [x] "Stop Session" confirmation dialog to prevent accidental data loss.

## ✅ Phase 3: History & Analytics (v1.3)
- [x] Persistent Session History (name, date, duration).
- [x] Detailed history view with expandable timelines per past session.
- [x] Data management (delete individual entries, clear all).
- [x] Session naming for better organization.

## ✅ Phase 4: Timeline UX Refinement (v1.4)
- [x] Dual-mode Timeline: single-phase progress slider while running, full segmented timeline when paused/stopped.
- [x] Slider fills in real time at 60fps (no CSS transition lag).
- [x] Smooth animated morph between slider and full timeline using CSS `grid-template-rows` trick with directional opacity delays.
- [x] Slider color reflects active phase (green = Focus, blue = Break).

## 🚀 Future Roadmap
- [ ] **Analytics Dashboard:** Visual charts (D3/Recharts) showing productivity trends over weeks/months.
- [ ] **Data Portability:** Export history to CSV or JSON.
- [ ] **Desktop Notifications:** Browser notifications when a phase ends.
- [ ] **Custom Themes:** Additional high-contrast color schemes (e.g., Amber, Cobalt).
- [ ] **Task List:** Simple integrated todo list for the current session.
- [ ] **Accessibility:** ARIA labels, improved focus states, keyboard navigation for modals.

## Current Priorities
1. Optimize `localStorage` usage for large history sets.
2. Add browser notification support for phase completion.
3. Improve mobile layout and touch interactions.
