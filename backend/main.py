import os
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from passlib.context import CryptContext
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


# ---------------- CONFIGURATION ----------------

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


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


# ---------------- HEALTH ----------------

@app.get("/health")
def health_check():
    logger.info("Health check requested")

    return {
        "status": "OK",
        "service": "InternMatch Backend"
    }


@app.get("/")
def home():
    return {"message": "InternMatch Backend is running"}


# ---------------- USERS ----------------

@app.get("/users")
def get_users():
    db = SessionLocal()

    users = db.query(User).all()

    db.close()

    # Hide password hashes from API response
    return [
        {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]


@app.post("/users")
def create_user(user: UserCreate):
    db = SessionLocal()

    try:
        existing_user = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email already registered"
            )

        hashed_password = pwd_context.hash(user.password)

        new_user = User(
            name=user.name,
            email=user.email,
            password=hashed_password,
            role=user.role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(
            "New user registered: %s with role %s",
            new_user.email,
            new_user.role
        )

        return {
            "user_id": new_user.user_id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }

    finally:
        db.close()


@app.post("/login")
def login(user: LoginRequest):
    db = SessionLocal()

    try:
        existing_user = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user is None:
            logger.warning(
                "Failed login attempt for email: %s",
                user.email
            )

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if not pwd_context.verify(
            user.password,
            existing_user.password
        ):
            logger.warning(
                "Failed login attempt for email: %s",
                user.email
            )

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

        logger.info(
            "Successful login: %s",
            existing_user.email
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    finally:
        db.close()


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

    logger.info(
        "New company created: %s",
        new_company.company_name
    )

    db.close()

    return new_company


# ---------------- INTERNSHIPS ----------------

@app.get(
    "/internships",
    response_model=list[InternshipResponse]
)
def get_internships():
    db = SessionLocal()

    internships = db.query(Internship).all()

    db.close()

    return internships


@app.get(
    "/internships/{internship_id}",
    response_model=InternshipResponse
)
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


@app.put(
    "/internships/{internship_id}",
    response_model=InternshipResponse
)
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

    logger.info(
        "Internship updated: ID %s",
        internship_id
    )

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

    logger.info(
        "Internship deleted: ID %s",
        internship_id
    )

    db.close()

    return {
        "message": "Internship deleted successfully"
    }


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

    logger.info(
        "New internship created: %s",
        new_internship.title
    )

    db.close()

    return new_internship


# ---------------- APPLICATIONS ----------------

@app.post(
    "/applications",
    response_model=ApplicationResponse
)
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

    logger.info(
        "Application created for user %s and internship %s",
        application.user_id,
        application.internship_id
    )

    db.close()

    return new_application


@app.get(
    "/applications",
    response_model=list[ApplicationResponse]
)
def get_applications():
    db = SessionLocal()

    applications = db.query(Application).all()

    db.close()

    return applications


@app.delete(
    "/applications/{user_id}/{internship_id}"
)
def unapply_internship(
    user_id: int,
    internship_id: int
):
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

    logger.info(
        "Application withdrawn by user %s",
        user_id
    )

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

    logger.info(
        "Internship saved by user %s",
        data.user_id
    )

    db.close()

    return saved


@app.get(
    "/saved-internships",
    response_model=list[SavedInternshipResponse]
)
def get_saved_internships():
    db = SessionLocal()

    saved_internships = db.query(
        SavedInternship
    ).all()

    db.close()

    return saved_internships


@app.delete(
    "/saved-internships/{user_id}/{internship_id}"
)
def unsave_internship(
    user_id: int,
    internship_id: int
):
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

    logger.info(
        "Saved internship removed by user %s",
        user_id
    )

    db.close()

    return {
        "message": "Internship removed from saved"
    }