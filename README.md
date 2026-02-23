# MacModoro

A high-fidelity, true-black Pomodoro timer designed for users who love minimalism and high contrast. Built with React and Vanilla CSS/Tailwind concepts.

## Features

- **True Black UI**: Optimized for OLED screens and dark mode lovers.
- **Fluid Timer**: Large, monospace typography with overflow counting (counts up after 00:00).
- **Session Timeline**: Visual bar tracking focus vs. break time, including interruptions.
- **Smart Overflow**: "Start" button transforms to "Stop/Next" when timer rings.
- **Stop Session**: "Stop Session" button clears timeline, resets focus cycles, and saves progress to history.
- **Persisted State**: Never lose your timer progress or settings on reload.
- **Keyboard Shortcuts**: Space to toggle, R to stop/reset, Esc to open menu/interrupt.
- **Customizable**: Adjustable Focus/Short/Long durations and bell volume.
- **History**: Track past sessions with ability to delete or clear history.

## Usage

1. Open `index.html` in any modern browser.
2. Set your preferred durations via sliders.
3. Type a session name (optional).
4. **Space** or **Start** to begin.
5. **Stop Session** (at the bottom) to end session and save history.

## Tech Stack

- React 18+ (via CDN/ESM in single file structure)
- Tailwind CSS (via CDN)
- LocalStorage for persistence
- Web Audio API for alarm

## License

MIT
