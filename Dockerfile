FROM python:3.10-slim

# Install system dependencies and SUMO
RUN apt-get update && apt-get install -y --no-install-recommends \
    sumo \
    sumo-tools \
    sumo-doc \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set SUMO environment variables
ENV SUMO_HOME=/usr/share/sumo
ENV PATH="/usr/share/sumo/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the backend API
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
