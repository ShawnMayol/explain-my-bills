from fastapi import APIRouter, HTTPException, File, UploadFile
from dotenv import load_dotenv
from google.genai.types import Part
from google import genai
from pydantic import BaseModel

import os
import enum

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=gemini_api_key)
model="gemini-2.5-flash"

router = APIRouter(
    prefix="/bill",
    responses={404: {"description": "Not found"}},
)

class BillType(enum.Enum):
    utility = "utility"
    telecom = "telecom"
    medical = "medical"
    financial = "financial"
    government = "government"
    subscription = "subscription"
    educational = "educational"
    others = "others"

class BillResponse(BaseModel):
    billType: BillType
    issuer: str
    totalBill: float
    billDate: str
    explanation: str
    highlights: list[str]
    discrepancies: str

class BillTimeSeriesResponse(BaseModel):
    summary: str
    suggestion: str


@router.post("/bill_reading")
async def bill_read(prompt_img: UploadFile = File(...)):
    
    """
    Processes an uploaded bill image to generate a summarized JSON response.

    This endpoint connects to the Gemini AI API and sends an image of a bill
    to obtain a summary using the gemini-2.5-flash model. The API returns a
    JSON response with fields including billType, issuer, totalBill, billDate,
    explanation, highlights, and discrepancies.

    Args:
        prompt_img (UploadFile): The image file of the bill to be summarized.

    Returns:
        dict: A JSON response containing the summarized bill information.

    Raises:
        HTTPException: If there is an error processing the request with the
        Gemini API, returns a 500 error with the error message.
    """

    try:
        
        # insert custom prompt for bill reading and obtaining the summarized data in a JSON format
        dev_prompt = """
            Summarize this bill and provide a JSON response with the following fields: 
            billType, issuer, totalBill, billDate, explanation, highlights, discrepancies.

            Example response:
            {
                "billType": "utility",
                "issuer": "VECO",
                "totalBill": 4470.13,
                "billDate": "2025-06-16",
                "explanation": "For the billing period of May 15 to June 15, 2025, you consumed 
                    a total of 335.64 kWh. Most of your charges came from generation and transmission 
                    (₱2,697.00), followed by distribution charges (₱1,116.42). Additional 
                    taxes and universal charges brought your total to ₱4,470.13. 
                    This is a typical bill amount for your average usage, with no unusual increases detected.",
                "highlights": [
                    "energy_consumed_kWh": 335.64,
                    "generation_and_transmission": 2697.00,
                    "distribution_charges": 1116.42,
                    "taxes_and_others": 657.00,
                    "previous_balance": 0.00
                ],
                "discrepancies": "None"
            }
        """

        response = client.models.generate_content(
            model=model,
            contents=[
                Part.from_bytes(
                    data=prompt_img.file.read(), 
                    mime_type="image/jpeg"
                ),
                dev_prompt
            ],
            config={
                'response_mime_type': 'application/json',
                'response_schema': BillResponse,
            },
        )

        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Error: {e}")
    

@router.post("/analytics")
async def analytics(time_series_data: str):

    """
    Analyzes user time series billing data to generate a summarized JSON response.

    This endpoint connects to the Gemini AI API and processes time series data
    of user expenses or bills to extract key information. It generates a summary
    and suggestions in a structured JSON format with two main fields: summary
    and suggestion.

    Args:
        time_series_data (str): A string containing time series data of user bills.

    Returns:
        dict: A JSON response containing a summary and suggestions based on the
        time series data.

    Raises:
        HTTPException: If there is an error processing the request with the
        Gemini API, returns a 500 error with the error message.
    """

    try:

        dev_prompt = time_series_data + """
            \n
            Context: This time series data are the expenses or bills of a user in a particular type or category.
            Find me the key information from this time series data and summarize it. Format it into two paragraphs:
            one for the summary and the other for the suggestions.

            The formatting will be as follows:

            {
                "summary": "This is the summary of the time series data",
                "suggestion": "This is the suggestion of the time series data"
            }

        """
        
        response = client.models.generate_content(
            model=model,
            contents=dev_prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': BillTimeSeriesResponse
            }
        )

        return {"response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Error: {e}")