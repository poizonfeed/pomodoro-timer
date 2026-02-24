# ARCHITECTURE.md - Fluorite Focus System Design

## Component Hierarchy

```text
App (Root)
├── SettingsPanel       — Duration sliders (Focus / Short Break / Long Break)
├── TimerDisplay        — Large MM:SS clock with overflow (+) prefix
├── Controls            — Start / Pause / Resume / Stop / Next Phase buttons
├── Timeline            — Dual-mode progress bar (slider ↔ segmented timeline)
├── Modal               — Distraction/interruption handler (Restart vs. Break)
├── HistoryModal        — Past sessions list with expandable timelines
└── [Footer]            — Volume slider, bell preview, History trigger
```

## State Management (App.tsx)

`App.tsx` acts as the central hub (Controller):

1. **Timer State:** `phase`, `isRunning`, `startTime`, `remainingTimeAtPause`, `cycleCount`.
2. **Timeline State:** `segments` — completed/interrupted `TimelineSegment[]` for the current session.
3. **currentSegmentElapsed:** Live ms elapsed in the current phase, updated every rAF tick.
4. **History State:** `HistoryEntry[]` representing finished sessions (persisted to localStorage).
5. **Settings State:** User-defined durations and volume.
6. **UI State:** Modal visibility flags (`isDistractionModalOpen`, `isResetConfirmOpen`, `isHistoryModalOpen`).

## Data Flow

### 1. The Timer Loop
- A `useEffect` with `requestAnimationFrame` calculates `Date.now() - startTime`.
- Updates `displayTime`, `isOverflowing`, and `currentSegmentElapsed` every frame (~60fps).
- `displayTime` and `isOverflowing` feed `TimerDisplay`; `currentSegmentElapsed` feeds `Timeline`.

### 2. The Timeline (Dual Mode)
- **Running:** Renders a slim single-phase progress slider. Fill % = `currentSegmentElapsed / totalPhaseDuration`. Color matches the active phase (green = Focus, blue = Break).
- **Paused/Stopped:** Renders the full segmented bar — all committed segments proportionally sized and color-coded, plus stats (focus %, work/rest time) and a legend.
- **Animation:** Uses the CSS `grid-template-rows: 0fr ↔ 1fr` trick for height animation combined with directional opacity delays. Exiting view fades out first, then collapses; entering view expands first, then fades in.

### 3. Committing Progress
- When a phase ends or is skipped, `commitSegment('completed' | 'interrupted')` is called.
- Creates a `TimelineSegment` and appends it to `segments`.
- This triggers a re-render of the `Timeline` component.

### 4. Ending a Session
- "Stop Session" triggers `confirmFullReset()`.
- Snapshots current `segments` + any uncommitted `currentSegmentElapsed`, calculates total focus time, creates a `HistoryEntry`.
- `history` state updates, `segments` clears for the next session.

### 5. Persistence
- Multiple `useEffect` hooks watch `settings`, `timerState`, `segments`, and `history`.
- Changes are serialized to JSON and saved to `localStorage` under three keys:
  - `fluoritefocus_v1` — settings, timer state, session name
  - `fluoritefocus_timeline` — current session segments
  - `fluoritefocus_history` — all historical entries

## Component Responsibilities

- **TimerDisplay:** Purely representational. Formats milliseconds into `MM:SS`, handles overflow color/glow, renders `+` prefix with proper spacing (`mr-2`).
- **Timeline:** Dual-mode component. In running mode shows a live progress bar. In paused/stopped mode shows the full segmented history with stats. Accepts `totalPhaseDuration` prop to compute fill percentage.
- **Controls:** Determines which button to show (Start / Resume / Pause / Next Phase) based on `isRunning`, `isOverflowing`, `hasStarted`, and `phase`.
- **HistoryModal:** Data management for past sessions — expandable per-session timelines, individual delete, clear all.
- **SettingsPanel:** Direct interface for modifying the `Settings` object via range sliders.

## Key Props: Timeline

| Prop | Type | Description |
|---|---|---|
| `segments` | `TimelineSegment[]` | Completed segments for the current session |
| `currentPhase` | `Phase` | Active phase (affects slider color) |
| `currentDuration` | `number` | ms elapsed in the current phase (live) |
| `isRunning` | `boolean` | Switches between slider mode and full timeline mode |
| `totalPhaseDuration` | `number` | Total ms for the current phase (used to compute fill %) |
