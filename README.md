

# Hifocus Studio

A minimalist productivity app designed to help you focus, track time, and minimize distractions. Featuring a beautiful retro-inspired flip clock with smooth 3D animations, countdown timers, and Pomodoro sessions.

## Features

- 🕐 **Real-time Flip Clock**: Smooth 3D flip animations for a retro aesthetic
- ⏱️ **Countdown Timer**: Customizable focus sessions with precise time tracking
- 🍅 **Pomodoro Timer**: Structured work/break intervals for optimal productivity
- 🎨 **Customizable Themes**: Multiple color schemes to match your style
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🔒 **Authentication**: Secure user accounts with Supabase
- ⚙️ **Settings Panel**: Customize your experience with various options
- 🌙 **Dark/Light Mode**: Automatic theme switching based on your preferences
- 🔊 **Custom Sounds**: Optional alarm sounds for timer completion
- 📊 **Analytics** (Pro): Track your focus stats and productivity trends
- ☁️ **Cloud Sync** (Pro): Access your settings across all devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components with Tailwind CSS
- **Backend**: Supabase for authentication and data storage
- **State Management**: React Context API
- **Routing**: React Router
- **Testing**: Vitest
- **Linting**: ESLint



## Usage

- **Flip Clock**: View the main clock display at the home page
- **Countdown Timer**: Navigate to `/countdown` or use URL parameters like `/countdown/1h30m0s`
- **Pomodoro Timer**: Access at `/pomodoro` for structured work sessions
- **Themes**: Customize appearance in the `/themes` section
- **Settings**: Access via the gear icon for app preferences

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # ShadCN UI components
│   ├── FlipClock.tsx   # Main flip clock component
│   ├── CountdownTimer.tsx
│   ├── PomodoroTimer.tsx
│   └── ...
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Route components
└── integrations/       # External service integrations
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

---

Built  using React, Vite, and Tailwind CSS
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS



