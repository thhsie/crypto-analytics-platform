# backend/Dockerfile

# 1. Use Python 3.12 Slim
FROM python:3.12-slim

# 2. Set working directory
WORKDIR /app

# 3. Install Poetry
RUN pip install poetry

# 4. Copy configuration files first (for caching)
COPY pyproject.toml poetry.lock ./

# 5. Disable virtualenv (install globally in container)
RUN poetry config virtualenvs.create false

# 6. Install dependencies
RUN poetry install --only main --no-root

# 7. Copy the rest of the code
COPY . .

# 8. Expose the port
EXPOSE 8080

# 9. Run with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]