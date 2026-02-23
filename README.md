# MacModoro

A high-fidelity, true-black Pomodoro timer designed for users who love minimalism and high contrast. Built with React 19 and TypeScript, powered by Vite.

## Features

- **True Black UI**: Optimized for OLED screens and dark mode lovers.
- **Fluid Timer**: Large, monospace typography with overflow counting (counts up after 00:00). The `+` prefix appears with clear spacing when overflowing.
- **Dual-Mode Timeline**: While running, shows a single-phase progress slider (phase color, fills in real time). When paused or stopped, morphs into the full segmented timeline with focus/break/interrupted history. Animated transition between both modes.
- **Smart Overflow**: "Start" button transforms to "Stop/Next" when the timer rings.
- **Stop Session**: Clears the timeline, resets focus cycles, and saves progress to history.
- **Persisted State**: Never lose your timer progress or settings on reload.
- **Keyboard Shortcuts**: Space to toggle, R to stop/reset, Esc to open menu/interrupt.
- **Customizable**: Adjustable Focus/Short/Long durations and bell volume.
- **History**: Track past sessions with expandable timelines, delete individual entries, or clear all.

## Quick Start

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Usage

1. Type a session name (optional).
2. Set your preferred durations via the sliders at the top.
3. **Space** or **Start** to begin.
4. **Pause** to pause; the timeline morphs to show session history.
5. **Stop Session** (link below the controls) to end the session and save to history.

## Tech Stack

- **React 19** (Functional Components + Hooks)
- **TypeScript**
- **Vite** (build tool, dev server on port 3000)
- **Tailwind CSS** (via CDN in `index.html`)
- **localStorage** for full persistence
- **Web Audio API** (base64-encoded WAV alarm)
- **requestAnimationFrame** for high-precision timer ticking

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

## License

MIT
