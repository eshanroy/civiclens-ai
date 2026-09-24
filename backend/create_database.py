from app.db.database import Base, engine
from app.models.document import Document


print("Creating CivicLens database tables...")

Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")