FROM python:3.10

WORKDIR /code

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Hugging Face Spaces requires the app to run on port 7860
# and needs write permissions for local directories if you save files
RUN mkdir -p /code/chroma_db /code/uploads
RUN chmod -R 777 /code/chroma_db /code/uploads /code

# Start the FastAPI server
CMD ["uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "7860"]
