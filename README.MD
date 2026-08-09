# InternMatch 🎓💼

InternMatch is a frontend-based internship discovery platform designed to help students explore internship opportunities, search for internships, apply or unapply, save internships for later, and manage their profile through a simple and user-friendly interface.

---

## 🚀 Features

### 🔐 Authentication
- User Signup
- User Login
- Logout functionality
- Login state handling
- User session management

### 🏠 Home Page
- Landing page for InternMatch
- Navigation to different sections of the application
- Login / Logout state display

### 📊 Dashboard
- Personalized user dashboard
- Internship activity overview
- Saved internship count
- Applied internship count
- Quick access to internship listings

### 💼 Internships
- Display available internship opportunities
- Search internships
- Apply for internships
- Unapply from internships
- Save internships
- Unsave internships
- Prevent duplicate saved internships

### 👤 Profile
- View user profile
- Edit profile information
- Manage personal details

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