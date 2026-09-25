from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "ISense"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+asyncpg://isense:isense_secret@localhost:5432/isense_db"
    SYNC_DATABASE_URL: str = "postgresql://isense:isense_secret@localhost:5432/isense_db"

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Retrieval settings
    VECTOR_SIMILARITY_THRESHOLD: float = 0.3
    MAX_RETRIEVAL_RESULTS: int = 10
    GRAPH_TRAVERSAL_DEPTH: int = 2


settings = Settings()
