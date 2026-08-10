from fastapi import FastAPI
from database import SessionLocal
from models import User


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