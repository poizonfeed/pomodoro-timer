# ARCHITECTURE.md - Fluorite Focus System Design

## Component Hierarchy

```text
App (Root)
├── [Header]            — Session name input + gear icon button (⚙) that toggles SettingsMenu
├── SettingsMenu        — Collapsible panel: duration sliders + alarm volume + alarm repetitions + overflow tick (opened via gear button)
├── TimerDisplay        — Large MM:SS clock with overflow (+) prefix and phase-aware color/glow
├── Controls            — Start / Pause / Resume / Stop / Next Phase buttons
├── Timeline            — Dual-mode progress bar (slider ↔ segmented timeline)
├── [Footer]            — History trigger button only
├── Modal               — Distraction/interruption handler (Restart vs. Break)
├── HistoryModal        — Past sessions list with expandable timelines
└── [Reset Confirm]     — Inline "Stop Session?" confirmation dialog (rendered in App.tsx)
```

## State Management (App.tsx)

`App.tsx` acts as the central hub (Controller):

1. **Timer State:** `phase`, `isRunning`, `startTime`, `remainingTimeAtPause`, `cycleCount`.
2. **Timeline State:** `segments` — completed/interrupted `TimelineSegment[]` for the current session.
3. **currentSegmentElapsed:** Live ms elapsed in the current phase, updated every rAF tick.
4. **History State:** `HistoryEntry[]` representing finished sessions (persisted to localStorage).
5. **Settings State:** User-defined durations (`focusDuration`, `shortBreakDuration`, `longBreakDuration`), `volume`, `alarmRepetitions`, `tickingEnabled`, `tickingVolume`.
6. **UI State:** Modal visibility flags (`isDistractionModalOpen`, `isResetConfirmOpen`, `isHistoryModalOpen`, `isSettingsOpen`).

## Data Flow

### 1. The Timer Loop
- A `useEffect` with `requestAnimationFrame` calculates `Date.now() - startTime`.
- Updates `displayTime`, `isOverflowing`, and `currentSegmentElapsed` every frame (~60fps).
- `displayTime` and `isOverflowing` feed `TimerDisplay`; `currentSegmentElapsed` feeds `Timeline`.
- `requestAnimationFrame` is throttled/paused in background tabs, so a parallel `setTimeout`-based effect schedules the alarm at the exact wall-clock expiry time (`startTime + remainingTimeAtPause`). This ensures the alarm fires even when the tab is not active. The two triggers share `hasPlayedSoundRef` to prevent double-play.

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

### 6. Settings Menu
- `isSettingsOpen` (boolean) in App.tsx controls whether `<SettingsMenu>` is mounted.
- The gear button in the header toggles this state.
- When open, the panel appears between the header and the timer, pushing content down.
- `setSettings`, `previewSound`, and `previewTick` are passed as props so the panel can update settings and trigger audio previews. Both preview functions use a shared `previewCtxRef` (`AudioContext`) that is closed instantly when the panel closes via `stopPreview()`.

### 7. Overflow Tick
- `playTick` synthesizes a soft C5 (523.25 Hz) sine tone: 4ms attack, 220ms exponential decay, peak gain `volume² × 0.09` (much quieter than the alarm).
- A `useEffect` watches `displayTime` during overflow. It computes the current overflow second (`floor(|displayTime| / 1000)`) and fires `playTick` when the second changes, but only after the alarm has fully finished playing.
- Tick start threshold: `ceil((alarmRepetitions - 1) × 2.8 + 2.65)` seconds (accounts for all repetition spacings + last bell decay).
- `lastTickSecondRef` prevents double-firing within the same second and is reset to `-1` on phase change, stop, or restart.

## Component Responsibilities

- **TimerDisplay:** Purely representational. Formats milliseconds into `MM:SS`, handles overflow color/glow, renders `+` prefix. Green glow on Focus overflow, red glow on Break overtime.
- **Timeline:** Dual-mode component. Running mode: live progress bar. Paused/stopped mode: full segmented history with stats and legend. Accepts `totalPhaseDuration` prop to compute fill percentage.
- **Controls:** Determines which button to show (Start / Resume / Pause / Next Phase) based on `isRunning`, `isOverflowing`, `hasStarted`, and `phase`. "Stop Session" is a secondary link-style button below the main row.
- **SettingsMenu:** Collapsible settings panel. Four sections separated by dividers: (1) timer duration sliders (Focus 1–60m, Short Break 1–15m, Long Break 1–30m); (2) alarm volume slider (0–100, step 10) with preview button; (3) alarm repetitions — five pill buttons (1–5); (4) overflow tick — On/Off pill toggle + volume slider (0–100, step 10) + preview button (visible only when enabled).
- **HistoryModal:** Data management for past sessions — expandable per-session timelines (reuses `Timeline`), individual delete with confirmation overlay, clear all with confirmation overlay, export to JSON (full dump) or CSV (summary row per session).
- **Modal:** "Session Interrupted" prompt with three actions: Restart Session, Take a Break, Close/Resume.

## Key Props: Timeline

| Prop | Type | Description |
|---|---|---|
| `segments` | `TimelineSegment[]` | Completed segments for the current session |
| `currentPhase` | `Phase` | Active phase (affects slider color) |
| `currentDuration` | `number` | ms elapsed in the current phase (live) |
| `isRunning` | `boolean` | Switches between slider mode and full timeline mode |
| `totalPhaseDuration` | `number` | Total ms for the current phase (used to compute fill %) |

## Key Props: SettingsMenu

| Prop | Type | Description |
|---|---|---|
| `settings` | `Settings` | Current settings object |
| `setSettings` | `Dispatch<SetStateAction<Settings>>` | Setter passed from App.tsx |
| `onPreviewSound` | `() => void` | Calls `previewSound()` in App.tsx — always one chime, stops when settings closes |
| `onPreviewTick` | `() => void` | Calls `previewTick()` in App.tsx — plays one tick tone, stops when settings closes |
