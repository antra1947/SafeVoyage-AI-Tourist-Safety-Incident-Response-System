# SafeVoyage AI - Tourist Safety & Incident Response System

## Project Structure
```
SafeVoyage AI-Powered Tourist Incident Response System/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/authMiddleware.js
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── components/
    │   ├── context/AuthContext.js
    │   ├── pages/
    │   ├── styles/global.css
    │   ├── api.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017

### 1. Backend Setup
```bash
cd backend
npm install
```
Edit `.env` with your MongoDB URI and email credentials, then:
```bash
npm run dev
```
Backend runs on http://localhost:5000

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

### 3. Create Admin Account
Register normally, then update the user role in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## Features
- JWT Authentication (signup/login)
- Tourist Dashboard with live map (Leaflet)
- One-click SOS with GPS location + email alert
- Incident reporting system
- Admin panel (users, incidents, SOS management)
- Safety zone alerts
- Responsive Bootstrap UI
