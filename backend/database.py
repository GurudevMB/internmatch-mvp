from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:InternMatch%40123@localhost:5432/internmatch"

engine = create_engine(DATABASE_URL)

with engine.connect() as connection:
    print("Database connected successfully!")