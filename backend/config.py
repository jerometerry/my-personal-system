# backend/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # model_config = SettingsConfigDict(env_file=".env")
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "personalsystem"

    class Config:
         env_file = ".env" # This tells Pydantic to look for a .env file

settings = Settings()
