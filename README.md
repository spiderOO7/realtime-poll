# Resilient Live Polling System

A production-ready, real-time polling application designed for resilience, scalability, and strict adherence to architectural patterns.

## 🏗️ Architecture

The system is built with a clear separation of concerns, following a strict **Controller-Service-Repository** pattern in the backend and a **Hook-based** architecture in the frontend.

### Backend (`/backend`)

- **Controllers**: Handle HTTP requests/responses. No business logic.
- **Services**: Contain all business logic (validation, timer synchronization, race condition handling).
- **Repositories**: Handle database interactions (MongoDB via Mongoose).
- **Sockets**: Thin wrappers that forward events to Services.
- **Models**: Mongoose schemas enforcing data integrity (e.g., unique indices for votes).

### Frontend (`/frontend`)

- **Hooks**: Encapsulate all state and logic (`usePollState`, `usePollTimer`, `useSession`, `useSocket`).
- **Components**: Pure UI components (dumb) relying on hooks for data.
- **Resilience**:
  - **Refresh Recovery**: App restores state from API on load.
  - **Timer Sync**: Calculates clock drift against server timestamps to ensure accurate countdowns across all clients.
  - **Reconnects**: Socket logic requests active poll state immediately upon reconnection.

## 🚀 Features

- **Teacher Persona**: Create polls, set timers, view live results.
- **Student Persona**: Join via session (no login required), vote once, view results.
- **Real-Time**: Socket.io for instant updates (Poll Start, Vote Count, Timer).
- **Resilience**:
  - Timer maintained on server.
  - Late joiners see correct remaining time.
  - Refreshing the page does not lose state.
- **Data Integrity**: MongoDB unique constraints prevent double voting even if API is hammered.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Socket.io Client.
- **Backend**: Node.js, Express, Socket.io, TypeScript, Mongoose.
- **Database**: MongoDB (Persists polls, options, and votes).

## 🏃‍♂️ Running Locally

1.  **Backend**:
    ```bash
    cd backend
    npm install
    # Set config/env.ts or create .env
    npm run dev
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 🧪 Verification

- **Refresh**: Refreshing the teacher or student page restores the exact state (timer, active question, results).
- **Timer**: Open two tabs. Start a poll. Notice the timer is synchronized perfectly despite one tab being "late".
- **Unique Vote**: MongoDB Index guarantees one vote per student per poll.

---

_Built for the Interview.io SDE Assignment._
