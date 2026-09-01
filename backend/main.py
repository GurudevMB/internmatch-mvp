import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import SessionLocal, Base, engine
from models import (
    User,
    Company,
    Internship,
    Application,
    SavedInternship
)

from schemas import (
    UserCreate,
    CompanyCreate,
    InternshipCreate,
    InternshipResponse,
    LoginRequest,
    ApplicationCreate,
    ApplicationResponse,
    SavedInternshipCreate,
    SavedInternshipResponse
)

from datetime import datetime, timedelta
from jose import jwt


load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


@app.get("/")
def home():
    return {"message": "InternMatch Backend is running"}


# ---------------- USERS ----------------

@app.get("/users")
def get_users():
    db = SessionLocal()

    users = db.query(User).all()

    db.close()

    return users


@app.post("/users")
def create_user(user: UserCreate):
    db = SessionLocal()

    new_user = User(
        name=user.name,
        email=user.email,
        password=user.password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    db.close()

    return new_user


@app.post("/login")
def login(user: LoginRequest):
    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    db.close()

    if existing_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if existing_user.password != user.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    token_data = {
        "sub": str(existing_user.user_id),
        "email": existing_user.email,
        "role": existing_user.role,
        "exp": expire
    }

    access_token = jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ---------------- COMPANIES ----------------

@app.get("/companies")
def get_companies():
    db = SessionLocal()

    companies = db.query(Company).all()

    db.close()

    return companies


@app.post("/companies")
def create_company(company: CompanyCreate):
    db = SessionLocal()

    new_company = Company(
        company_name=company.company_name,
        email=company.email,
        password=company.password,
        location=company.location,
        description=company.description
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    db.close()

    return new_company


# ---------------- INTERNSHIPS ----------------

@app.get("/internships", response_model=list[InternshipResponse])
def get_internships():
    db = SessionLocal()

    internships = db.query(Internship).all()

    db.close()

    return internships


@app.get("/internships/{internship_id}", response_model=InternshipResponse)
def get_internship(internship_id: int):
    db = SessionLocal()

    internship = db.query(Internship).filter(
        Internship.internship_id == internship_id
    ).first()

    db.close()

    if internship is None:
        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )

    return internship


@app.put("/internships/{internship_id}", response_model=InternshipResponse)
def update_internship(
    internship_id: int,
    internship: InternshipCreate
):
    db = SessionLocal()

    existing_internship = db.query(Internship).filter(
        Internship.internship_id == internship_id
    ).first()

    if existing_internship is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )

    existing_internship.company_id = internship.company_id
    existing_internship.title = internship.title
    existing_internship.description = internship.description
    existing_internship.location = internship.location
    existing_internship.duration = internship.duration
    existing_internship.stipend = internship.stipend
    existing_internship.skills_required = internship.skills_required

    db.commit()
    db.refresh(existing_internship)

    db.close()

    return existing_internship


@app.delete("/internships/{internship_id}")
def delete_internship(internship_id: int):
    db = SessionLocal()

    internship = db.query(Internship).filter(
        Internship.internship_id == internship_id
    ).first()

    if internship is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )

    db.delete(internship)
    db.commit()

    db.close()

    return {"message": "Internship deleted successfully"}


@app.post("/internships")
def create_internship(internship: InternshipCreate):
    db = SessionLocal()

    new_internship = Internship(
        company_id=internship.company_id,
        title=internship.title,
        description=internship.description,
        location=internship.location,
        duration=internship.duration,
        stipend=internship.stipend,
        skills_required=internship.skills_required
    )

    db.add(new_internship)
    db.commit()
    db.refresh(new_internship)

    db.close()

    return new_internship


# ---------------- APPLICATIONS ----------------

@app.post("/applications", response_model=ApplicationResponse)
def create_application(application: ApplicationCreate):
    db = SessionLocal()

    new_application = Application(
        user_id=application.user_id,
        internship_id=application.internship_id,
        status="Applied"
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    db.close()

    return new_application


@app.get("/applications", response_model=list[ApplicationResponse])
def get_applications():
    db = SessionLocal()

    applications = db.query(Application).all()

    db.close()

    return applications


@app.delete("/applications/{user_id}/{internship_id}")
def unapply_internship(user_id: int, internship_id: int):
    db = SessionLocal()

    application = db.query(Application).filter(
        Application.user_id == user_id,
        Application.internship_id == internship_id
    ).first()

    if not application:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.delete(application)
    db.commit()

    db.close()

    return {
        "message": "Application withdrawn successfully"
    }


# ---------------- SAVED INTERNSHIPS ----------------

@app.post(
    "/saved-internships",
    response_model=SavedInternshipResponse
)
def save_internship(data: SavedInternshipCreate):
    db = SessionLocal()

    existing = db.query(SavedInternship).filter(
        SavedInternship.user_id == data.user_id,
        SavedInternship.internship_id == data.internship_id
    ).first()

    if existing:
        db.close()

        raise HTTPException(
            status_code=409,
            detail="Internship already saved"
        )

    saved = SavedInternship(
        user_id=data.user_id,
        internship_id=data.internship_id
    )

    db.add(saved)
    db.commit()
    db.refresh(saved)

    db.close()

    return saved


@app.get(
    "/saved-internships",
    response_model=list[SavedInternshipResponse]
)
def get_saved_internships():
    db = SessionLocal()

    saved_internships = db.query(SavedInternship).all()

    db.close()

    return saved_internships


@app.delete("/saved-internships/{user_id}/{internship_id}")
def unsave_internship(user_id: int, internship_id: int):
    db = SessionLocal()

    saved = db.query(SavedInternship).filter(
        SavedInternship.user_id == user_id,
        SavedInternship.internship_id == internship_id
    ).first()

    if not saved:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Saved internship not found"
        )

    db.delete(saved)
    db.commit()

    db.close()

    return {
        "message": "Internship removed from saved"
    }