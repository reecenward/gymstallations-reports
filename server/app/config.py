from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    jwt_secret: str = "dev-secret-change-me"
    jwt_expires_minutes: int = 720
    db_path: str = "./data/app.db"

    cors_origins: str = "http://localhost:5173"

    # Webhook that receives a simple notification when a report is submitted.
    # The destination service handles downstream delivery (email, Slack, etc.).
    form_handler_url: str = ""

    # Public base URL of the app, used to build a "view report" link in the
    # notification payload (e.g. https://reports.example.com).
    app_base_url: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
