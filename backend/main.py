import os

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    status
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

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
from jose import jwt, JWTError


# ---------------- ENVIRONMENT ----------------

load_dotenv()


# ---------------- DATABASE ----------------

Base.metadata.create_all(bind=engine)


# ---------------- FASTAPI ----------------

app = FastAPI(
    title="InternMatch API",
    description="Backend API for InternMatch",
    version="1.0.0"
)


# ---------------- PASSWORD HASHING ----------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ---------------- JWT SECURITY ----------------

security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    SECRET_KEY = "internmatch-development-secret-key"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ---------------- CORS ----------------

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


# ---------------- JWT FUNCTIONS ----------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )

    db = SessionLocal()

    user = db.query(User).filter(
        User.user_id == int(user_id)
    ).first()

    db.close()

    if user is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


# ---------------- HOME ----------------

@app.get("/")
def home():

    return {
        "message": "InternMatch Backend is running"
    }


# ---------------- HEALTH CHECK ----------------

@app.get("/health")
def health():

    return {
        "status": "OK",
        "service": "InternMatch Backend"
    }


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

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        db.close()

        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    db.close()

    return {
        "user_id": new_user.user_id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role
    }


# ---------------- LOGIN ----------------

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

    if not pwd_context.verify(
        user.password,
        existing_user.password
    ):

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
        "token_type": "bearer",
        "role": existing_user.role
    }


# ---------------- CURRENT USER ----------------

@app.get("/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):

    return {
        "user_id": current_user.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


# ---------------- COMPANIES ----------------

@app.get("/companies")
def get_companies():

    db = SessionLocal()

    companies = db.query(Company).all()

    db.close()

    return companies


@app.post("/companies")
def create_company(
    company: CompanyCreate,
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Only admin can create companies"
        )

    db = SessionLocal()

    existing_company = db.query(Company).filter(
        Company.email == company.email
    ).first()

    if existing_company:

        db.close()

        raise HTTPException(
            status_code=409,
            detail="Company email already registered"
        )

    hashed_password = pwd_context.hash(
        company.password
    )

    new_company = Company(
        company_name=company.company_name,
        email=company.email,
        password=hashed_password,
        location=company.location,
        description=company.description
    )

    db.add(new_company)

    db.commit()

    db.refresh(new_company)

    db.close()

    return {
        "company_id": new_company.company_id,
        "company_name": new_company.company_name,
        "email": new_company.email,
        "location": new_company.location,
        "description": new_company.description
    }


# ---------------- INTERNSHIPS ----------------

@app.get(
    "/internships",
    response_model=list[InternshipResponse]
)
def get_internships():

    db = SessionLocal()

    internships = db.query(
        Internship
    ).all()

    db.close()

    return internships


@app.get(
    "/internships/{internship_id}",
    response_model=InternshipResponse
)
def get_internship(internship_id: int):

    db = SessionLocal()

    internship = db.query(
        Internship
    ).filter(
        Internship.internship_id == internship_id
    ).first()

    db.close()

    if internship is None:

        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )

    return internship


@app.post(
    "/internships",
    response_model=InternshipResponse
)
def create_internship(
    internship: InternshipCreate,
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Only admin can create internships"
        )

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


@app.put(
    "/internships/{internship_id}",
    response_model=InternshipResponse
)
def update_internship(
    internship_id: int,
    internship: InternshipCreate,
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Only admin can update internships"
        )

    db = SessionLocal()

    existing_internship = db.query(
        Internship
    ).filter(
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

    existing_internship.skills_required = (
        internship.skills_required
    )

    db.commit()

    db.refresh(existing_internship)

    db.close()

    return existing_internship


@app.delete(
    "/internships/{internship_id}"
)
def delete_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Only admin can delete internships"
        )

    db = SessionLocal()

    internship = db.query(
        Internship
    ).filter(
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

    return {
        "message": "Internship deleted successfully"
    }


# ---------------- APPLICATIONS ----------------

@app.post(
    "/applications",
    response_model=ApplicationResponse
)
def create_application(
    application: ApplicationCreate,
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "student":

        raise HTTPException(
            status_code=403,
            detail="Only students can apply"
        )

    if current_user.user_id != application.user_id:

        raise HTTPException(
            status_code=403,
            detail="You can only apply using your own account"
        )

    db = SessionLocal()

    internship = db.query(
        Internship
    ).filter(
        Internship.internship_id ==
        application.internship_id
    ).first()

    if internship is None:

        db.close()

        raise HTTPException(
            status_code=404,
            detail="Internship not found"
        )

    existing_application = db.query(
        Application
    ).filter(
        Application.user_id ==
        application.user_id,

        Application.internship_id ==
        application.internship_id
    ).first()

    if existing_application:

        db.close()

        raise HTTPException(
            status_code=409,
            detail="You have already applied for this internship"
        )

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


@app.get(
    "/applications",
    response_model=list[ApplicationResponse]
)
def get_applications(
    current_user: User = Depends(get_current_user)
):

    db = SessionLocal()

    if current_user.role == "admin":

        applications = db.query(
            Application
        ).all()

    else:

        applications = db.query(
            Application
        ).filter(
            Application.user_id ==
            current_user.user_id
        ).all()

    db.close()

    return applications


@app.delete(
    "/applications/{internship_id}"
)
def unapply_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user)
):

    db = SessionLocal()

    application = db.query(
        Application
    ).filter(
        Application.user_id ==
        current_user.user_id,

        Application.internship_id ==
        internship_id
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
def save_internship(
    data: SavedInternshipCreate,
    current_user: User = Depends(get_current_user)
):

    if current_user.user_id != data.user_id:

        raise HTTPException(
            status_code=403,
            detail="You can only save internships for your own account"
        )

    db = SessionLocal()

    existing = db.query(
        SavedInternship
    ).filter(
        SavedInternship.user_id ==
        data.user_id,

        SavedInternship.internship_id ==
        data.internship_id
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
def get_saved_internships(
    current_user: User = Depends(get_current_user)
):

    db = SessionLocal()

    saved_internships = db.query(
        SavedInternship
    ).filter(
        SavedInternship.user_id ==
        current_user.user_id
    ).all()

    db.close()

    return saved_internships


@app.delete(
    "/saved-internships/{internship_id}"
)
def unsave_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user)
):

    db = SessionLocal()

    saved = db.query(
        SavedInternship
    ).filter(
        SavedInternship.user_id ==
        current_user.user_id,

        SavedInternship.internship_id ==
        internship_id
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