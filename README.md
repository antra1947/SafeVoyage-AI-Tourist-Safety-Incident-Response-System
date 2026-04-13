# SafeVoyage AI — Tourist Safety & Incident Response System

A full-stack MERN application that helps tourists stay safe with real-time location tracking, emergency SOS alerts, incident reporting, and safety zone warnings.

---

## Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Safety Alerts & Zone Warnings
![Safety Alerts](screenshots/alerts.png)

### Report an Incident
![Report Incident](screenshots/report.png)

### Emergency SOS
![Emergency SOS](screenshots/sos.png)

---

## Tech Stack

**Frontend**
- React.js
- React Router DOM
- Bootstrap 5
- Leaflet.js (maps)
- Axios

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO (real-time location)
- JWT Authentication
- Joi Validation
- Nodemailer (Gmail / Amazon SES)
- EJS (map interface)

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
│   │   │   └── location/
│   │   ├── utils/emailService.js
│   │   ├── views/map.ejs
│   │   └── app.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/AuthContext.js
    │   ├── pages/
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
EMAIL_PASS=your_app_password

# Amazon SES (alternative)
# EMAIL_PROVIDER=ses
# SES_HOST=email-smtp.ap-south-1.amazonaws.com
# SES_PORT=587
# SES_USER=your_ses_user
# SES_PASS=your_ses_pass

ALLOWED_ORIGINS=http://localhost:3000
```

---

## Local Setup

### 1. Backend
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

### 3. Make Admin Account
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
| PATCH | `/api/user/profile` | Update profile + safety info |

### Emergency
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emergency/sos` | Trigger SOS alert |
| GET | `/api/emergency/history` | Get SOS history |
| GET | `/api/emergency/:id` | Get single emergency |
| PATCH | `/api/emergency/:id/resolve` | Resolve emergency |

### Location
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations/nearby?lat=&lng=` | Get nearby users (100m radius) |
| GET | `/api/map` | Live map UI (EJS) |

### Auth Header
```
Authorization: Bearer <token>
```

---

## Real-Time Location (Socket.IO)

Connect with JWT token, then emit:
```js
socket.emit("send-location", { latitude: 31.25, longitude: 75.70 })
```
- Location saved in memory instantly
- DB write throttled by time (5s) and distance (10m)
- Last location saved on disconnect

---

## Features

- JWT-based authentication
- Tourist dashboard with live Leaflet map
- One-click SOS with GPS + email alerts to emergency contacts
- Real-time location tracking via Socket.IO
- Nearby users via MongoDB geospatial query (2dsphere)
- Incident reporting (type, severity, GPS location)
- Safety zone alerts with severity levels
- Admin panel for managing users, incidents, SOS
- Provider-agnostic email (Gmail or Amazon SES)
- Joi input validation on all endpoints

---

