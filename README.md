# VerdeGO

## CS FYP 2026 — Group CS_08

VerdeGO is a green ride-sharing platform for Monash University students and staff. The MVP focuses on **convenience, affordability, security, and sustainability**, initially targeting Monash Clayton.

## 👥 Group Members

| Member | Email |
|---|---|
| **Meng Siau** | hsia0003@student.monash.edu |
| **Ayush Sharma** | asha0300@student.monash.edu |
| **Tye Samuels** | tsam0016@student.monash.edu |
| **Kloe Lashkariov-Lee** | klas0001@student.monash.edu |
| **Samuel Rainbow** | srai0011@student.monash.edu |

## 🛠️ Tech Stack

- **Frontend:** React Native, Expo SDK 57, Expo Router, TypeScript
- **Backend:** Python, Flask
- **Database & Auth:** PostgreSQL / Supabase

## 📁 Repository Structure

```text
VerdeGO/
├── frontend/       # React Native / Expo app
│   ├── app/        # Expo Router routes
│   ├── src/        # Screens, components, API, auth, etc.
│   └── assets/     # Static assets
│
├── backend/        # Flask API
│   ├── app/        # API routes and authentication
│   └── database/   # Database schema and seed data
│
├── package.json    # Root development scripts
└── README.md
```

## 🚀 Setup

### 1. Clone the repository

```bash
git clone https://github.com/MengSiau/VerdeGo.git
cd VerdeGO
```

### 2. Install dependencies

The root `npm install` automatically installs both the root and frontend dependencies.

```bash
npm install
```

### 3. Set up the backend

Create a Python virtual environment:

```bash
cd backend
python -m venv .venv
```

Activate it:

**macOS/Linux**
```bash
source .venv/bin/activate
```

**Windows**
```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
cd ..
```

### 4. Environment variables

Create:

```text
frontend/.env
backend/.env
```

#### `frontend/.env`

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key

# Optional — defaults to the computer's Expo development host IP
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5001
```

#### `backend/.env`

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

> Never commit `.env` files or the Supabase secret key.

### 5. Run the project

From the repository root:

```bash
npm run dev
```

This starts both the Expo frontend and Flask backend.

From the Expo output, you can open the app in:
- [Expo Go](https://expo.dev/go) — scan the QR code with the Expo Go app on your phone.
- [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/) — open the app in an iOS simulator.
- [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/) — open the app in an Android emulator.
- [Development build](https://docs.expo.dev/develop/development-builds/introduction/) — open the app in a development build.

For a physical phone, make sure your phone and computer are connected to the same network.

To run them separately:

```bash
npm run frontend
npm run backend
```

The Flask API runs on **port 5001**.

When testing on a physical device, `EXPO_PUBLIC_API_URL` must use your computer's local network IP rather than `localhost`.

## 🗄️ Database

The PostgreSQL schema is located at:

```text
backend/database/schema.sql
```

Development seed data is located at:

```text
backend/database/seed.sql
```

The application uses the `dev` PostgreSQL schema through Supabase.

## 🌳 Git Workflow

```text
main
  └── dev
       └── feature/*
```

- `main` — stable/production-ready code
- `dev` — integration and testing
- `feature/*` — individual feature branches

Feature branches should be merged into `dev` through a pull request.


## 💻 Useful Commands

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start frontend + backend |
| `npm run frontend` | Start Expo only |
| `npm run backend` | Start Flask only |
