# ARCHITECTURE.md - MacModoro System Design

## Component Hierarchy

```text
App (Root)
├── SettingsPanel (Durations & Sliders)
├── TimerDisplay (Big Clock)
├── Controls (Start/Pause/Stop/Next)
├── Timeline (Visual Progress Bar)
├── Modal (Distraction/Interruption Handler)
├── HistoryModal (Past Sessions List)
└── [Footer] (Volume & History Trigger)
```

## State Management (App.tsx)

`App.tsx` acts as the central hub (Controller) for the application:

1.  **Timer State:** Manages `phase`, `isRunning`, `startTime`, and `remainingTimeAtPause`.
2.  **Timeline State:** Tracks `segments` (completed parts of the current session).
3.  **History State:** Stores `HistoryEntry` objects representing finished sessions.
4.  **Settings State:** User-defined durations and volume.
5.  **UI State:** Controls visibility of various modals and confirmation dialogs.

## Data Flow

### 1. The Timer Loop
- `App.tsx` uses a `useEffect` with `requestAnimationFrame` to calculate the difference between `Date.now()` and `startTime`.
- It updates `displayTime` and `isOverflowing` states.
- These values are passed as props to `TimerDisplay`.

### 2. Committing Progress
- When a phase ends or is skipped, `commitSegment()` is called.
- It creates a `TimelineSegment` and adds it to the `segments` array.
- This triggers a re-render of the `Timeline` component.

### 3. Ending a Session
- Clicking "Stop Session" triggers `confirmFullReset()`.
- It snapshots the current `segments`, calculates total focus time, and creates a `HistoryEntry`.
- The `history` state is updated, and `segments` are cleared for the next session.

### 4. Persistence
- Multiple `useEffect` hooks watch for changes in `settings`, `timerState`, `segments`, and `history`.
- Changes are serialized to JSON and saved to `localStorage` using unique keys.

## Component Responsibilities

- **TimerDisplay:** Purely representational. Formats milliseconds into `MM:SS` and handles overflow styling.
- **Timeline:** Calculates statistics (Focus %) and renders a multi-colored bar based on `segments`.
- **Controls:** Handles the logic for which button to show (Start/Resume/Pause/Next) based on the timer's state.
- **HistoryModal:** Provides a dedicated view for data management and reviewing past performance.
- **SettingsPanel:** Direct interface for modifying the `Settings` object.
