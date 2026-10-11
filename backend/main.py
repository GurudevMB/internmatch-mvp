import logging
import os
from datetime import UTC, datetime, timedelta

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import Base, SessionLocal, engine
from models import Application, Company, Internship, SavedInternship, User
from schemas import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    CompanyCreate,
    InternshipCreate,
    InternshipResponse,
    LoginRequest,
    SavedInternshipCreate,
    SavedInternshipResponse,
    UserCreate,
)

# ==================================================
# ENVIRONMENT
# ==================================================

load_dotenv()

# ==================================================
# LOGGING
# ==================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


# ==================================================
# DATABASE
# ==================================================

Base.metadata.create_all(bind=engine)


# ==================================================
# FASTAPI
# ==================================================

app = FastAPI(
    title="InternMatch API",
    description="Backend API for InternMatch",
    version="1.0.0",
)


# ==================================================
# PASSWORD HASHING
# ==================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ==================================================
# JWT SECURITY
# ==================================================

security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is not set"
    )

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://internmatch-mvp-gamma.vercel.app",
        "https://internmatch-mvp-git-main-blacktom15s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# GET CURRENT USER
# ==================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

    db = SessionLocal()

    try:
        user = db.query(User).filter(
            User.user_id == int(user_id)
        ).first()

    finally:
        db.close()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user

def get_current_company(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        if payload.get("role") != "company":
            raise HTTPException(status_code=403, detail="Company access required")
        company_id = int(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid company token")

    db = SessionLocal()
    try:
        company = db.query(Company).filter(
            Company.company_id == company_id
        ).first()
        if not company:
            raise HTTPException(status_code=401, detail="Company not found")
        return company
    finally:
        db.close()
# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():
    return {
        "message": "InternMatch Backend is running"
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
def health():
    return {
        "status": "OK",
        "service": "InternMatch Backend",
    }


# ==================================================
# USERS
# ==================================================


@app.get("/users")
def get_users(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    db = SessionLocal()

    try:
        users = db.query(User).all()

        return [
            {
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            }
            for user in users
        ]
    finally:
        db.close()



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
                detail="Email already registered",
            )

        hashed_password = pwd_context.hash(
            user.password
        )

        new_user = User(
            name=user.name,
            email=user.email,
            password=hashed_password,
            role="student",
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(
            "User registered successfully: %s",
            new_user.email,
        )

        return {
            "user_id": new_user.user_id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
        }

    finally:
        db.close()


# ==================================================
# LOGIN
# ==================================================

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
                user.email,
            )

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        if not pwd_context.verify(
            user.password,
            existing_user.password,
        ):
            logger.warning(
                "Failed login attempt for email: %s",
                user.email,
            )

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        expire = datetime.now(UTC) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

        token_data = {
            "sub": str(existing_user.user_id),
            "email": existing_user.email,
            "role": existing_user.role,
            "exp": expire,
        }

        access_token = jwt.encode(
            token_data,
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        logger.info(
            "User logged in successfully: %s",
            existing_user.email,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": existing_user.role,
        }

    finally:
        db.close()


@app.post("/company-register")
def register_company(company: CompanyCreate):
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == company.email).first():
            raise HTTPException(status_code=409, detail="Email already registered")

        if db.query(Company).filter(Company.email == company.email).first():
            raise HTTPException(status_code=409, detail="Email already registered")

        new_company = Company(
            company_name=company.company_name,
            email=company.email,
            password=pwd_context.hash(company.password),
            location=company.location,
            description=company.description,
        )
        db.add(new_company)
        db.commit()
        db.refresh(new_company)

        return {
            "company_id": new_company.company_id,
            "company_name": new_company.company_name,
            "email": new_company.email,
            "role": "company",
        }
    finally:
        db.close()


@app.post("/company-login")
def company_login(user: LoginRequest):
    db = SessionLocal()
    try:
        company = db.query(Company).filter(
            Company.email == user.email
        ).first()

        if not company or not pwd_context.verify(
            user.password, company.password
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        token = jwt.encode(
            {
                "sub": str(company.company_id),
                "email": company.email,
                "role": "company",
                "exp": datetime.now(UTC) + timedelta(
                    minutes=ACCESS_TOKEN_EXPIRE_MINUTES
                ),
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "company",
        }
    finally:
        db.close()

# ==================================================
# CURRENT USER
# ==================================================

@app.get("/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "user_id": current_user.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }


# ==================================================
# COMPANIES
# ==================================================

@app.get("/companies")
def get_companies():
    db = SessionLocal()

    try:
        companies = db.query(Company).all()
        return companies

    finally:
        db.close()


@app.post("/companies")
def create_company(
    company: CompanyCreate,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can create companies",
        )

    db = SessionLocal()

    try:
        existing_company = db.query(
            Company
        ).filter(
            Company.email == company.email
        ).first()

        if existing_company:
            raise HTTPException(
                status_code=409,
                detail="Company email already registered",
            )

        hashed_password = pwd_context.hash(
            company.password
        )

        new_company = Company(
            company_name=company.company_name,
            email=company.email,
            password=hashed_password,
            location=company.location,
            description=company.description,
        )

        db.add(new_company)
        db.commit()
        db.refresh(new_company)

        logger.info(
            "Company created successfully: %s",
            new_company.email,
        )

        return {
            "company_id": new_company.company_id,
            "company_name": new_company.company_name,
            "email": new_company.email,
            "location": new_company.location,
            "description": new_company.description,
        }

    finally:
        db.close()

@app.get("/company/me")
def company_profile(
    company: Company = Depends(get_current_company),
):
    return {
        "company_id": company.company_id,
        "company_name": company.company_name,
        "email": company.email,
        "location": company.location,
        "description": company.description,
    }


@app.get("/company/internships")
def company_internships(
    company: Company = Depends(get_current_company),
):
    db = SessionLocal()
    try:
        return db.query(Internship).filter(
            Internship.company_id == company.company_id
        ).all()
    finally:
        db.close()

@app.post("/company/internships")
def create_company_internship(
    internship: InternshipCreate,
    company: Company = Depends(get_current_company),
):
    db = SessionLocal()
    try:
        new_internship = Internship(
            company_id=company.company_id,
            title=internship.title,
            description=internship.description,
            location=internship.location,
            duration=internship.duration,
            stipend=internship.stipend,
            skills_required=internship.skills_required,
        )
        db.add(new_internship)
        db.commit()
        db.refresh(new_internship)
        return new_internship
    finally:
        db.close()

@app.get("/company/applications")
def get_company_applications(
    company: Company = Depends(get_current_company),
):
    db = SessionLocal()
    try:
        results = (
            db.query(Application, User, Internship)
            .join(User, Application.user_id == User.user_id)
            .join(
                Internship,
                Application.internship_id == Internship.internship_id,
            )
            .filter(Internship.company_id == company.company_id)
            .all()
        )

        return [
            {
                "application_id": app.application_id,
                "student_name": user.name,
                "student_email": user.email,
                "internship_id": internship.internship_id,
                "internship_title": internship.title,
                "status": app.status,
            }
            for app, user, internship in results
        ]
    finally:
        db.close()

        
# ==================================================
# INTERNSHIPS
# ==================================================

@app.get(
    "/internships",
    response_model=list[InternshipResponse],
)
def get_internships():
    db = SessionLocal()

    try:
        internships = db.query(
            Internship
        ).all()

        return internships

    finally:
        db.close()


@app.get(
    "/internships/{internship_id}",
    response_model=InternshipResponse,
)
def get_internship(
    internship_id: int,
):
    db = SessionLocal()

    try:
        internship = db.query(
            Internship
        ).filter(
            Internship.internship_id == internship_id
        ).first()

        if internship is None:
            raise HTTPException(
                status_code=404,
                detail="Internship not found",
            )

        return internship

    finally:
        db.close()


@app.post(
    "/internships",
    response_model=InternshipResponse,
)
def create_internship(
    internship: InternshipCreate,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can create internships",
        )

    db = SessionLocal()

    try:
        new_internship = Internship(
            company_id=internship.company_id,
            title=internship.title,
            description=internship.description,
            location=internship.location,
            duration=internship.duration,
            stipend=internship.stipend,
            skills_required=internship.skills_required,
        )

        db.add(new_internship)
        db.commit()
        db.refresh(new_internship)

        logger.info(
            "Internship created successfully: %s",
            new_internship.title,
        )

        return new_internship

    finally:
        db.close()


@app.put(
    "/internships/{internship_id}",
    response_model=InternshipResponse,
)
def update_internship(
    internship_id: int,
    internship: InternshipCreate,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can update internships",
        )

    db = SessionLocal()

    try:
        existing_internship = db.query(
            Internship
        ).filter(
            Internship.internship_id == internship_id
        ).first()

        if existing_internship is None:
            raise HTTPException(
                status_code=404,
                detail="Internship not found",
            )

        existing_internship.company_id = internship.company_id
        existing_internship.title = internship.title
        existing_internship.description = internship.description
        existing_internship.location = internship.location
        existing_internship.duration = internship.duration
        existing_internship.stipend = internship.stipend
        existing_internship.skills_required = (
            internship.skills_required
        )

        db.commit()
        db.refresh(existing_internship)

        logger.info(
            "Internship updated: %s",
            existing_internship.internship_id,
        )

        return existing_internship

    finally:
        db.close()


@app.delete("/internships/{internship_id}")
def delete_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can delete internships",
        )

    db = SessionLocal()

    try:
        internship = db.query(
            Internship
        ).filter(
            Internship.internship_id == internship_id
        ).first()

        if internship is None:
            raise HTTPException(
                status_code=404,
                detail="Internship not found",
            )

        db.delete(internship)
        db.commit()

        logger.info(
            "Internship deleted: %s",
            internship_id,
        )

        return {
            "message": "Internship deleted successfully"
        }

    finally:
        db.close()


# ==================================================
# APPLICATIONS
# ==================================================

@app.post(
    "/applications",
    response_model=ApplicationResponse,
)
def create_application(
    application: ApplicationCreate,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can apply",
        )

    if current_user.user_id != application.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only apply using your own account",
        )

    db = SessionLocal()

    try:
        internship = db.query(
            Internship
        ).filter(
            Internship.internship_id
            == application.internship_id
        ).first()

        if internship is None:
            raise HTTPException(
                status_code=404,
                detail="Internship not found",
            )

        existing_application = db.query(
            Application
        ).filter(
            Application.user_id == application.user_id,
            Application.internship_id
            == application.internship_id,
        ).first()

        if existing_application:
            raise HTTPException(
                status_code=409,
                detail="You have already applied for this internship",
            )

        new_application = Application(
            user_id=current_user.user_id,
            internship_id=application.internship_id,
            status="Applied",
        )

        db.add(new_application)
        db.commit()
        db.refresh(new_application)

        logger.info(
            "Application created for user %s",
            current_user.user_id,
        )

        return new_application

    finally:
        db.close()


@app.get(
    "/applications",
    response_model=list[ApplicationResponse],
)
def get_applications(
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        if current_user.role == "admin":
            applications = db.query(
                Application
            ).all()
        else:
            applications = db.query(
                Application
            ).filter(
                Application.user_id
                == current_user.user_id
            ).all()

        return applications

    finally:
        db.close()


# ==================================================
# UPDATE APPLICATION STATUS (ADMIN ONLY)
# ==================================================

@app.patch(
    "/applications/{application_id}/status",
    response_model=ApplicationResponse,
)
def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can update application status",
        )

    allowed_statuses = {
        "Applied",
        "Under Review",
        "Shortlisted",
        "Rejected",
        "Accepted",
    }

    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status",
        )

    db = SessionLocal()

    try:
        application = db.query(Application).filter(
            Application.application_id == application_id
        ).first()

        if application is None:
            raise HTTPException(
                status_code=404,
                detail="Application not found",
            )

        application.status = status_update.status
        db.commit()
        db.refresh(application)

        return application

    finally:
        db.close()

# ==================================================
# WITHDRAW APPLICATION
# ==================================================

@app.delete("/applications/{internship_id}")
def unapply_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        application = db.query(
            Application
        ).filter(
            Application.user_id
            == current_user.user_id,
            Application.internship_id
            == internship_id,
        ).first()

        if application is None:
            raise HTTPException(
                status_code=404,
                detail="Application not found",
            )

        db.delete(application)
        db.commit()

        logger.info(
            "Application withdrawn by user %s",
            current_user.user_id,
        )

        return {
            "message": "Application withdrawn successfully"
        }

    finally:
        db.close()


# ==================================================
# SAVED INTERNSHIPS
# ==================================================

@app.post(
    "/saved-internships",
    response_model=SavedInternshipResponse,
)
def save_internship(
    data: SavedInternshipCreate,
    current_user: User = Depends(get_current_user),
):
    if current_user.user_id != data.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only save internships for your own account",
        )

    db = SessionLocal()

    try:
        existing = db.query(
            SavedInternship
        ).filter(
            SavedInternship.user_id
            == current_user.user_id,
            SavedInternship.internship_id
            == data.internship_id,
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Internship already saved",
            )

        saved = SavedInternship(
            user_id=current_user.user_id,
            internship_id=data.internship_id,
        )

        db.add(saved)
        db.commit()
        db.refresh(saved)

        logger.info(
            "Internship saved by user %s",
            current_user.user_id,
        )

        return saved

    finally:
        db.close()


@app.get(
    "/saved-internships",
    response_model=list[SavedInternshipResponse],
)
def get_saved_internships(
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        saved_internships = db.query(
            SavedInternship
        ).filter(
            SavedInternship.user_id
            == current_user.user_id
        ).all()

        return saved_internships

    finally:
        db.close()


# ==================================================
# UNSAVE INTERNSHIP
# ==================================================

@app.delete("/saved-internships/{internship_id}")
def unsave_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        saved = db.query(
            SavedInternship
        ).filter(
            SavedInternship.user_id
            == current_user.user_id,
            SavedInternship.internship_id
            == internship_id,
        ).first()

        if saved is None:
            raise HTTPException(
                status_code=404,
                detail="Saved internship not found",
            )

        db.delete(saved)
        db.commit()

        logger.info(
            "Saved internship removed by user %s",
            current_user.user_id,
        )

        return {
            "message": "Internship removed from saved"
        }

    finally:
        db.close()