from fastapi import FastAPI, HTTPException
from database import SessionLocal
from models import User, Company, Internship
from schemas import (
    UserCreate,
    CompanyCreate,
    InternshipCreate,
    InternshipResponse,
    LoginRequest
)
from datetime import datetime, timedelta
from jose import jwt

app = FastAPI()

SECRET_KEY = "internmatch-super-secret-key"
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
def update_internship(internship_id: int, internship: InternshipCreate):
    db = SessionLocal()

    existing_internship = db.query(Internship).filter(
        Internship.internship_id == internship_id
    ).first()

    if existing_internship is None:
        db.close()
        return {"message": "Internship not found"}

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
        return {"message": "Internship not found"}

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