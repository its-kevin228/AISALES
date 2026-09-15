from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "omnisales-ai"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/omnisales"
    META_VERIFY_TOKEN: str = "dev_verify_token"
    META_APP_SECRET: str = "dev_app_secret"
    META_ACCESS_TOKEN: str = "dev_access_token"
    GEMINI_API_KEY: str = "dev_gemini_key"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
