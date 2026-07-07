# CrushLink 💖

CrushLink is a premium, production-ready anonymous confession SaaS application. It allows users to create custom shareable links to ask their crush: **"Do you like me?"**. Senders can track opens and responses in real time, while recipients answer through an animated glassmorphic letter.

## Features

- **Double-Sided UX**: Senders configure links inside a private portal, while recipients vote through an interactive animated letter.
- **Micro-Animations**: Framer Motion page entries, circular metric percentages, hover spring effects, and a confetti celebration on "Yes" clicks.
- **Anti-Spam Controls**: Utilizes one-way SHA-256 IP address hashing to enforce response limits when configured.
- **Real-Time Alerts**: Sends responsive HTML email notifications immediately when someone votes.
- **Administrative Portal**: Admin panel to trace system health, registered users, and block abusive users.
- **Dark Mode**: Seamlessly synchronized system settings and custom theme toggles.
- **Docker Orchestrated**: Production Nginx routing and database containers ready for deploy.

---

## Tech Stack

### Frontend
- **React 19** & **TypeScript**
- **Vite** (build engine)
- **Tailwind CSS** (design system & styling)
- **Framer Motion** (graphics & animations)
- **React Query (v5)** (state cache)
- **React Router (v6)** (layout wrappers)
- **React Hook Form** & **Zod** (inputs parser)
- **Axios** (interceptors auto-refresh token)

### Backend
- **Node.js** & **Express**
- **TypeScript** & **Prisma ORM**
- **PostgreSQL** (production DB)
- **JWT** (HTTP-only refresh cookies) & **Passport Google OAuth**
- **Nodemailer** (alert dispatchers)
- **Helmet**, **CORS**, & **Express Rate Limit** (security)

---

## Local Development Setup

To run CrushLink locally, follow these steps:

### Prerequisites
- Node.js (v20 or higher)
- PostgreSQL database (or Docker to run one)

### 1. Database Setup
If you have Docker installed, you can spin up PostgreSQL immediately:
```bash
docker compose up -d database
```
Alternatively, configure a local PostgreSQL instance.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Setup your `.env` configuration file:
   ```bash
   copy .env.example .env
   ```
3. Update the variables inside `.env` (like `DATABASE_URL` or `SMTP` settings).
4. Run migrations to setup database tables:
   ```bash
   npx prisma db push
   ```
5. Start the Express api in watch mode:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Deployment with Docker

To deploy the entire stack (PostgreSQL database, Node.js API, and compiled Nginx reverse proxy) in a production configuration, run:

```bash
docker compose up -d --build
```

Nginx will listen on port `80` and expose the frontend while proxying `/api` queries to the backend.

---


