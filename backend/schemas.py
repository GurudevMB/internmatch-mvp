from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str


class CompanyCreate(BaseModel):
    company_name: str
    email: str
    password: str
    location: str | None = None
    description: str | None = None

class InternshipCreate(BaseModel):
    company_id: int
    title: str
    description: str | None = None
    location: str | None = None
    duration: str | None = None
    stipend: str | None = None
    skills_required: str | None = None




class InternshipResponse(BaseModel):
    internship_id: int
    company_id: int
    title: str
    description: str
    location: str
    duration: str
    stipend: str
    skills_required: str

    class Config:
        from_attributes = True