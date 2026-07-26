"""
Application Settings using Pydantic Settings
"""

from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Contract AI SaaS"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/contract_ai?schema=public"
    
    # Security
    JWT_SECRET: str = Field(..., description="JWT Secret Key")
    JWT_EXPIRY_DAYS: int = 30
    JWT_ALGORITHM: str = "HS256"
    
    # AI Configuration
    AI_PROVIDER: str = "deepseek"
    AI_MODEL: str = "deepseek-chat"
    AI_FALLBACK_PROVIDER: str = "openai"
    AI_FALLBACK_MODEL: str = "gpt-4o-mini"
    AI_TIMEOUT: int = 120
    AI_MAX_TOKENS: int = 4000
    
    DEEPSEEK_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_FILE_TYPES: str = ".pdf,.docx,.txt,.doc"
    
    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PRO_PLAN_PRICE_ID: str = "price_pro_monthly"
    STRIPE_FREE_TRIAL_DAYS: int = 7
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    
    # Subscription Limits
    FREE_TIER_CONTRACT_LIMIT: int = 5
    PRO_TIER_CONTRACT_LIMIT: int = 50
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# Create settings instance
settings = Settings()
