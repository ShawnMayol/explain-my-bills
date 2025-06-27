# Explain My Bills Backend

This is the backend API for the Explain My Bills project.  
It handles image uploads, OCR processing, and bill summarization.

## Prerequisites

-   Python 3.8 or higher (recommend 3.10+)
-   (Optional but recommended) [virtualenv](https://docs.python.org/3/library/venv.html)

## Setup Instructions

# Clone the repository if you haven't already

git clone <your-repo-url>
cd backend

# (Recommended) Create and activate a virtual environment

python -m venv venv
source venv/bin/activate # On Windows use: venv\Scripts\activate

# Install all required dependencies

pip install -r requirements.txt

# Start the backend server (FastAPI)

uvicorn main:app --reload
