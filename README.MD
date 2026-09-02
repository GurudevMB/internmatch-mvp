# InternMatch 🎓💼

InternMatch is a full-stack internship discovery platform designed to help students explore internship opportunities, search for internships, apply or unapply, save internships for later, and manage their profile through a simple and user-friendly interface.

The application uses a **JavaScript-based frontend**, **FastAPI backend**, and **PostgreSQL database** to provide real backend-connected functionality.

---

## 🚀 Features

### 🔐 Authentication

* User Signup
* User Login
* JWT-based authentication
* Access token generation on successful login
* Logout functionality
* User authentication state handling

### 🏠 Home Page

* Landing page for InternMatch
* Navigation to different sections of the application
* Login / Logout state display

### 📊 Dashboard

* Personalized user dashboard
* Internship activity overview
* Available internship count
* Saved internship count
* Applied internship count
* Quick access to internship listings

### 💼 Internships

* Display available internship opportunities
* Search internships
* Apply for internships
* Unapply from internships
* Save internships
* Unsave internships
* Prevent duplicate applications
* Prevent duplicate saved internships

### 👤 Profile

* View user profile
* Edit profile information
* Manage personal details

### 🗄️ Backend & Database

* FastAPI REST API
* PostgreSQL database
* User management
* Company management
* Internship management
* Application management
* Saved internship management
* CRUD operations for internship data

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* FastAPI
* Uvicorn
* JWT Authentication

### Database

* PostgreSQL
* pgAdmin 4

### Development Tools

* Visual Studio Code
* Git
* GitHub
* FastAPI Swagger / OpenAPI

---

## 🏗️ Project Structure

```text
internmatch-mvp/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── internships.html
│   ├── profile.html
│   ├── app.js
│   ├── dashboard.js
│   ├── internships.js
│   └── ...
│
├── docs/
│   └── diagrams/
│
├── .gitignore
└── README.md
```

---

## 🔄 User Flow

```text
                    ┌─────────────┐
                    │    Home     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Signup/Login │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Dashboard  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Internships │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
           Search       Apply/Unapply  Save/Unsave
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │   Profile   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Logout   │
                    └─────────────┘
```

---

## 🔗 Backend Architecture

InternMatch follows a simple client-server architecture:

```text
┌──────────────────────┐
│      Frontend        │
│ HTML / CSS / JS      │
└──────────┬───────────┘
           │ HTTP Requests
           ▼
┌──────────────────────┐
│      FastAPI         │
│      Backend         │
└──────────┬───────────┘
           │ SQLAlchemy
           ▼
┌──────────────────────┐
│     PostgreSQL       │
│       Database       │
└──────────────────────┘
```

---

## 🔄 Core End-to-End Flows

### 1. Apply / Unapply Internship

```text
Frontend
   ↓
FastAPI API
   ↓
PostgreSQL
   ↓
Application Created / Deleted
   ↓
Frontend Updated
```

### 2. Save / Unsave Internship

```text
Frontend
   ↓
FastAPI API
   ↓
PostgreSQL
   ↓
Saved Internship Created / Deleted
   ↓
Frontend Updated
```

These flows demonstrate communication between the frontend, backend, and database.

---

## 🔐 Authentication Flow

```text
User
 ↓
Login Form
 ↓
POST /login
 ↓
FastAPI
 ↓
User Verification
 ↓
JWT Access Token
 ↓
Frontend
```

A successful login returns a JWT access token with the authenticated user's information.

---

## 🌐 API Endpoints

### Authentication

```text
POST /users
POST /login
GET  /users
```

### Companies

```text
GET  /companies
POST /companies
```

### Internships

```text
GET    /internships
POST   /internships
GET    /internships/{internship_id}
PUT    /internships/{internship_id}
DELETE /internships/{internship_id}
```

### Applications

```text
GET    /applications
POST   /applications
DELETE /applications/{user_id}/{internship_id}
```

### Saved Internships

```text
GET    /saved-internships
POST   /saved-internships
DELETE /saved-internships/{user_id}/{internship_id}
```

---

## ▶️ How to Run Locally

### Prerequisites

Make sure the following are installed:

* Python 3.11+
* PostgreSQL
* pgAdmin 4
* Visual Studio Code
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/GurudevMB/internmatch-mvp.git
cd internmatch-mvp
```

### 2. Set Up the Backend

Open a terminal inside the backend directory:

```bash
cd backend
```

Create and activate a virtual environment if required:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 3. Configure PostgreSQL

Create the required PostgreSQL database and make sure the database configuration in the backend matches your local PostgreSQL setup.

The backend connects to PostgreSQL through the project's database configuration.

### 4. Start FastAPI

From the `backend` directory:

```bash
python -m uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### 5. Run the Frontend

Open the project in Visual Studio Code.

Navigate to:

```text
frontend/index.html

## 🧪 API Documentation

FastAPI automatically provides interactive API documentation through Swagger UI.

```text
http://127.0.0.1:8000/docs
```

The Swagger interface can be used to test the available API endpoints.

---

## 🎯 Project Goal

The goal of InternMatch is to provide students with a simple platform for discovering and managing internship opportunities while demonstrating a complete frontend-to-backend-to-database application workflow.

---

## 🚀 Future Scope

* Advanced internship filtering
* Internship recommendations
* Company profiles
* Application status tracking
* Admin dashboard
* Production deployment
* Improved authentication and authorization
* Enhanced UI/UX


## Backend Deployment

The backend is configured for deployment and can be run using the project's configured environment settings.