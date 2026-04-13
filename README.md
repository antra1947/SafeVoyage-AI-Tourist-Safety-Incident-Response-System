# SafeVoyage AI — Enterprise Tourist Safety & Incident Intelligence Platform

A production-ready, full-stack MERN application built for real-world tourist safety. Features real-time location tracking, AI-powered safety advice, emergency SOS with email alerts, incident reporting, and an admin control panel.

---

## Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Emergency SOS
![Emergency SOS](screenshots/sos.png)

### Report an Incident
![Report Incident](screenshots/report.png)

### Safety Alerts & Zone Warnings
![Safety Alerts](screenshots/alerts.png)

---

## Tech Stack

**Frontend**
- React.js (Context API)
- Bootstrap 5
- Leaflet.js (live map)
- Axios

**Backend**
- Node.js + Express.js (MVC + Microservices)
- MongoDB + Mongoose (geospatial 2dsphere)
- Socket.IO (real-time location)
- JWT Authentication + bcrypt
- Joi Validation
- Nodemailer (Gmail / Amazon SES)
- Helmet + Rate Limiting + Morgan
- EJS (map interface)
- Google Gemini AI (`gemini-1.5-flash`)

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js, validate.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── emergency/
│   │   │   ├── incident/
│   │   │   ├── location/
│   │   │   ├── admin/
│   │   │   └── ai/
│   │   ├── utils/emailService.js
│   │   ├── views/map.ejs
│   │   └── app.js
│   ├── services/                  ← Microservices
│   │   ├── api-gateway/           → port 7000
│   │   ├── auth-service/          → port 7001
│   │   ├── user-service/          → port 7002
│   │   ├── incident-service/      → port 7003
│   │   ├── emergency-service/     → port 7004
│   │   └── location-service/      → port 7005
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/AuthContext.js
    │   ├── pages/
    │   ├── styles/global.css
    │   ├── api.js
    │   └── App.js
    └── package.json
```

---

## Environment Variables

Create `backend/.env`:

```env
PORT=7000
DB_CONNECTION_STRING=your_mongodb_uri
JWT_SECRET=your_secret_key

# Gmail
EMAIL_PROVIDER=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Amazon SES (alternative)
# EMAIL_PROVIDER=ses
# SES_HOST=email-smtp.ap-south-1.amazonaws.com
# SES_PORT=587
# SES_USER=your_ses_user
# SES_PASS=your_ses_pass

ALLOWED_ORIGINS=http://localhost:3000

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

> Get Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords
> Get Gemini API Key free at: https://aistudio.google.com

---

## Local Setup

### 1. Backend (Monolithic)
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:7000`

### 2. Frontend
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000`

### 3. Microservices (Alternative)
```bash
cd backend/services
node start-all.js
```
Starts all 6 services (ports 7000–7005)

### 4. Make Admin Account
Register normally, then run in MongoDB shell:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PATCH | `/api/user/profile` | Update profile + safety profile + emergency contacts |

### Emergency
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emergency/sos` | Trigger SOS — sends HTML email to all emergency contacts + confirmation to sender |
| GET | `/api/emergency/history` | Get SOS history |
| GET | `/api/emergency/:id` | Get single emergency |
| PATCH | `/api/emergency/:id/resolve` | Resolve emergency |

### Incidents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/incidents` | Report incident |
| GET | `/api/incidents/my` | My incidents |
| GET | `/api/incidents` | All incidents (admin) |
| PATCH | `/api/incidents/:id/status` | Update status (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/sos` | All SOS alerts |
| PATCH | `/api/admin/sos/:id/acknowledge` | Acknowledge SOS |

### AI (Gemini)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/safety-advice` | Get AI safety tips for a location |
| POST | `/api/ai/analyze-incident` | AI risk analysis of an incident |

### Location
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations/nearby?lat=&lng=` | Nearby users (100m radius) |
| GET | `/api/map?token=<jwt>` | Live map UI (EJS + Leaflet) |

### Auth Header
```
Authorization: Bearer <token>
```

---

## SOS Email Flow

When a user triggers SOS:
1. GPS coordinates captured (memory-first, DB fallback)
2. Rich HTML alert email sent to every emergency contact with Google Maps link
3. Confirmation email sent to the user showing exactly who was notified
4. Emergency numbers (100, 108, 101, 1091) included in every email
5. SOS logged in DB with timestamp and status tracking

---

## Real-Time Location (Socket.IO)

```js
socket.emit("send-location", { latitude: 31.25, longitude: 75.70 })
```
- JWT-authenticated socket connection
- Location saved in memory instantly
- DB write throttled: 5s time + 10m distance
- Last location saved on disconnect
- Nearby users via MongoDB `$near` geospatial query

---

## Features

- JWT authentication with role-based access (Tourist / Admin)
- Full safety profile — blood group, allergies, medical notes, emergency contacts
- One-click SOS with rich HTML email alerts + sender confirmation
- Real-time location tracking via Socket.IO
- Nearby users via MongoDB 2dsphere geospatial query
- Incident reporting with type, severity, GPS, AI analysis
- AI Safety Advisor powered by Google Gemini
- Safety zone warnings with severity levels
- Admin panel — stats, user management, incident management, SOS acknowledgment
- Provider-agnostic email (Gmail or Amazon SES)
- Rate limiting, Helmet security headers, Morgan logging
- Microservices architecture with API Gateway

---

## Deployment

- Frontend → [Vercel](https://vercel.com)
- Backend → [Render](https://render.com)
- Database → [MongoDB Atlas](https://mongodb.com/atlas)
