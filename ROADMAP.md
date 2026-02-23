# ROADMAP.md - MacModoro Evolution

## ✅ Phase 1: Core Functionality (v1.0)
- [x] Pomodoro timer logic (Focus/Short Break/Long Break).
- [x] High-contrast "True Black" dark theme.
- [x] Settings persistence (Durations, Volume).
- [x] Overflow tracking (counting up after 00:00).
- [x] Distraction management modal (Restart vs. Break).

## ✅ Phase 2: Visualization & UX (v1.1 - v1.2)
- [x] Visual Timeline bar showing Work/Break balance.
- [x] Keyboard shortcuts (Space: Toggle, R: Stop, Esc: Menu).
- [x] Pulsating "Resume" button and glowing "Pause" state.
- [x] Alarm sound with volume control and preview.
- [x] "Stop Session" confirmation dialog to prevent accidental data loss.

## ✅ Phase 3: History & Analytics (v1.3)
- [x] Persistent Session History (Name, Date, Duration).
- [x] Detailed History View with expandable timelines for each past session.
- [x] Data management (Delete individual entries, Clear All).
- [x] Session naming for better organization.

## 🚀 Future Roadmap
- [ ] **Analytics Dashboard:** Visual charts (D3/Recharts) showing productivity trends over weeks/months.
- [ ] **Data Portability:** Export history to CSV or JSON.
- [ ] **Desktop Integration:** Browser notifications when a phase ends.
- [ ] **Custom Themes:** Additional high-contrast color schemes (e.g., Amber, Cobalt).
- [ ] **Task List:** Simple integrated todo list for the current session.

## Current Priorities
1. Refine the Timeline visualization for very long sessions.
2. Improve accessibility (Aria labels, focus states).
3. Optimize `localStorage` usage for large history sets.
