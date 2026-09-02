from sqlalchemy import Column, Integer, String, Text

from database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    location = Column(String(150))
    description = Column(Text)

class Internship(Base):
    __tablename__ = "internships"

    internship_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    location = Column(String(150))
    duration = Column(String(100))
    stipend = Column(String(100))
    skills_required = Column(Text)


class Application(Base):
    __tablename__ = "applications"

    application_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    internship_id = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="Applied")

class SavedInternship(Base):
    __tablename__ = "saved_internships"

    saved_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    internship_id = Column(Integer, nullable=False)