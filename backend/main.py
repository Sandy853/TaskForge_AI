# TaskForge_AI/backend/main.py

import os
import json
import re
from datetime import timedelta, datetime
from typing import List, Literal, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, ValidationError
from passlib.context import CryptContext
from jose import JWTError, jwt
from ollama import Client
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import IntegrityError

# Load environment variables from .env file
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize the Ollama client
ollama_client = Client(host='http://localhost:11434')
model_name = "llama3:8b"

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# SQLite Database Setup
DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models
class PingResponse(BaseModel):
    status: str
    message: str

class Task(BaseModel):
    description: str
    category: Literal["Health", "Study", "Work", "Personal", "Emotional"]
    is_completed: bool = False
    deadline: Optional[str] = None

class AIPlan(BaseModel):
    daily_schedule: List[Task]
    summary: str
    date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))

class TaskInput(BaseModel):
    tasks: str

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class User(BaseModel):
    username: str

# Helper function to get the current authenticated user
def get_current_user(token: str = Depends(oauth2_scheme), db: SessionLocal = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        user_in_db = db.query(DBUser).filter(DBUser.username == username).first()
        if user_in_db is None:
            raise credentials_exception
        return User(username=user_in_db.username)
    except JWTError:
        raise credentials_exception

# Helper functions for data persistence
def get_user_data_file(username: str):
    """Generates a user-specific file path."""
    return os.path.join("data", f"{username}_plan.json")

def load_plan(username: str):
    data_file = get_user_data_file(username)
    if not os.path.exists(data_file):
        return None
    try:
        with open(data_file, "r") as f:
            data = json.load(f)
            return AIPlan.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as e:
        print(f"Error loading plan: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not load existing plan.")

def save_plan(plan: AIPlan, username: str):
    data_file = get_user_data_file(username)
    try:
        with open(data_file, "w") as f:
            json.dump(plan.model_dump(), f)
    except Exception as e:
        print(f"Error saving plan: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save plan.")

# Endpoints
@app.get("/ping", response_model=PingResponse)
def ping():
    return {"status": "success", "message": "Backend is up and running!"}

@app.get("/tasks/load", response_model=AIPlan | None)
def load_plan_endpoint(current_user: User = Depends(get_current_user)):
    return load_plan(current_user.username)

@app.post("/tasks/save", status_code=status.HTTP_204_NO_CONTENT)
def save_plan_endpoint(plan: AIPlan, current_user: User = Depends(get_current_user)):
    save_plan(plan, current_user.username)

@app.post("/tasks/plan", response_model=AIPlan)
def create_plan(task_input: TaskInput, current_user: User = Depends(get_current_user)):
    try:
        existing_plan = load_plan(current_user.username)
        tasks_list = []
        if existing_plan and existing_plan.daily_schedule:
            for task in existing_plan.daily_schedule:
                tasks_list.append(task.description)
        tasks_list.append(task_input.tasks)
        full_tasks_string = ", ".join(tasks_list)

        prompt = f"""
        Your task is to take a list of tasks and generate a daily plan.
        Your entire response must be a single, valid JSON object. Do not include any extra text, explanations, or markdown formatting outside of the JSON.
        The JSON object must be formatted as follows:
        {{
          "daily_schedule": [
            {{
              "description": "string",
              "category": "string",
              "is_completed": false,
              "deadline": "YYYY-MM-DD or null"
            }}
          ],
          "summary": "A brief, encouraging summary of the day's plan.",
          "date": "YYYY-MM-DD"
        }}
        The "category" field must be one of: "Health", "Study", "Work", "Personal", or "Emotional".
        Fill in the template with the provided tasks.
        User's tasks:
        {full_tasks_string}
        """

        response = ollama_client.generate(
            model=model_name,
            prompt=prompt
        )

        try:
            ai_response_json = response['response'].strip()
            ai_plan_dict = json.loads(ai_response_json)
            ai_plan = AIPlan.model_validate(ai_plan_dict)

        except json.JSONDecodeError as e:
            raise ValueError(f"AI response was not valid JSON: {e}")
        
        save_plan(ai_plan, current_user.username)
        return ai_plan
        
    except ValidationError as e:
        print(f"Pydantic Validation Error: The AI response did not match the required schema. {e.json()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="AI response format invalid.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/tasks/today", response_model=List[Task])
def get_todays_tasks(current_user: User = Depends(get_current_user)):
    try:
        today_str = datetime.now().strftime("%Y-%m-%d")
        plan = load_plan(current_user.username)
        
        if not plan:
            return []
            
        todays_tasks = [task for task in plan.daily_schedule if task.deadline == today_str]
        return todays_tasks
        
    except Exception as e:
        print(f"An error occurred while fetching today's tasks: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve today's tasks.")

@app.get("/analytics", response_model=Dict[str, Any])
def get_analytics(current_user: User = Depends(get_current_user)):
    try:
        plan = load_plan(current_user.username)
        if not plan:
            return {"status": "success", "message": "No data for analysis yet.", "data": {}}

        analytics_data = {}
        for task in plan.daily_schedule:
            if task.is_completed:
                category = task.category
                if category not in analytics_data:
                    analytics_data[category] = 0
                analytics_data[category] += 1
        
        return {"status": "success", "message": "Analytics data retrieved.", "data": analytics_data}
        
    except Exception as e:
        print(f"An error occurred during analytics: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve analytics data.")

# Authentication Endpoints
@app.post("/users/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: SessionLocal = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = DBUser(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User successfully registered"}

@app.post("/users/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: SessionLocal = Depends(get_db)):
    user_in_db = db.query(DBUser).filter(DBUser.username == form_data.username).first()
    if not user_in_db or not verify_password(form_data.password, user_in_db.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_in_db.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "username": user_in_db.username}