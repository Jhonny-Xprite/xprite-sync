FROM python:3.11-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Security: Run as non-root user
RUN adduser -D mcpuser
USER mcpuser

ENTRYPOINT ["python", "src/main.py"]
