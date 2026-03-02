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

## ✅ Phase 5: Settings Menu (v1.5)
- [x] Collapsed settings panel behind a gear icon button (⚙) placed to the right of the session name input.
- [x] Timer duration sliders (Focus, Short Break, Long Break) moved from always-visible row into the settings panel.
- [x] Bell volume slider and preview button moved from footer into the settings panel.
- [x] Settings panel sections: "Durations" and "Bell Volume", separated by a divider.
- [x] Gear button glows green when the panel is open; toggles closed on second click.
- [x] Multi-word labels ("Short Break", "Long Break") stack vertically so all three sliders are horizontally aligned.
- [x] Footer simplified — only History button remains.

## ✅ Phase 6: Alarm Overhaul (v1.6)
- [x] Replaced base64 WAV with a fully synthesized airplane cabin bell using Web Audio API (A5 → E5 two-tone descending chime with inharmonic overtone for bell character).
- [x] Volume power curve (`gain²`) so 50% volume sounds like 50%, not 100%.
- [x] Alarm repetitions setting (1–5 pill buttons) — alarm fires N times in sequence at phase end.
- [x] Renamed "Bell Volume" → "Alarm Volume" in settings panel.
- [x] Preview always plays exactly one chime (independent of repetitions setting).
- [x] Preview sound stops instantly when the settings panel is closed (dedicated `AudioContext` per preview, closed on panel hide).
- [x] Preview button debounced — cannot overlap with itself.

## ✅ Phase 7: Data Portability (v1.7)
- [x] Export session history as JSON (`fluorite-focus-YYYY-MM-DD.json`) — full `HistoryEntry[]` dump including all segments.
- [x] Export session history as CSV (`fluorite-focus-YYYY-MM-DD.csv`) — one row per session with summary columns: id, name, date, start_time, end_time, duration_min, focus_min, short_break_min, long_break_min.
- [x] JSON and CSV buttons added to the History modal footer, above "Clear All History".

## ✅ Phase 8: Background Alarm Fix (v1.8)
- [x] Alarm now fires correctly when the browser tab is in the background.
- [x] Added a `setTimeout`-based backup alarm alongside the RAF loop — `requestAnimationFrame` is throttled/suspended in background tabs, so the RAF-based sound trigger was never reached; `setTimeout` fires reliably for minute-scale delays.
- [x] `playSound` made async to properly `await ctx.resume()` before scheduling Web Audio nodes, ensuring audio plays when the `AudioContext` was suspended.

## 🚀 Future Roadmap
- [ ] **Analytics Dashboard:** Visual charts (D3/Recharts) showing productivity trends over weeks/months.
- [ ] **Desktop Notifications:** Browser notifications when a phase ends.
- [ ] **Custom Themes:** Additional high-contrast color schemes (e.g., Amber, Cobalt).
- [ ] **Task List:** Simple integrated todo list for the current session.
- [ ] **Accessibility:** ARIA labels, improved focus states, keyboard navigation for modals.

## Current Priorities
1. Add browser notification support for phase completion.
2. Improve mobile layout and touch interactions.
3. Optimize `localStorage` usage for large history sets.
