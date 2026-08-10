from fastapi import FastAPI
from database import SessionLocal
from models import User
from schemas import UserCreate


app = FastAPI()


@app.get("/")
def home():
    return {"message": "InternMatch Backend is running"}


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