from fastapi import APIRouter, HTTPException, File, UploadFile
from dotenv import load_dotenv
import google.generativeai as genai
from pydantic import BaseModel
import logging
import json

import os
import enum

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=gemini_api_key)
model_name = "gemini-2.5-flash"

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
    isValidBill: bool


class BillTimeSeriesResponse(BaseModel):
    summary: str
    suggestion: str


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AnalyticsRequest(BaseModel):
    time_series_data: str


@router.post("/bill_reading")
async def bill_read(prompt_img: UploadFile = File(...)):
    """
    Processes an uploaded bill image to generate a summarized JSON response.
    """
    try:
        dev_prompt = """
            Summarize this bill and provide a JSON response with the following fields: 
            billType, issuer, totalBill, billDate, explanation, highlights, discrepancies.

            If the bill is not valid, set isValidBill to false.

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
                "isValidBill": true
            }
        """

        model = genai.GenerativeModel(model_name)
        img_bytes = await prompt_img.read()

        # Compose the multi-modal prompt (text + image)
        response = model.generate_content(
            [
                {
                    "role": "user",
                    "parts": [
                        {"text": dev_prompt},
                        {
                            "inline_data": {
                                "mime_type": prompt_img.content_type or "image/png",
                                "data": img_bytes,
                            }
                        },
                    ],
                }
            ],
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": BillResponse,
            },
        )

        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Error: {e}")


@router.post("/analytics")
async def analytics(request: AnalyticsRequest):
    """
    Analyzes user time series billing data to generate a summarized JSON response.
    Expects a JSON body: {"time_series_data": "<string>"}
    """
    try:
        # Validate input
        if not request.time_series_data:
            raise HTTPException(
                status_code=400, detail="time_series_data cannot be empty"
            )

        dev_prompt = (
            request.time_series_data
            + """
            \n
            Context: This time series data are the expenses or bills of a user in a particular type or category.
            Find me the key information from this time series data and summarize it. Format it into two paragraphs:
            one for the summary and the other for the suggestions.

            The formatting MUST be valid JSON as follows:

            {
                "summary": "This is the summary of the time series data",
                "suggestion": "This is the suggestion of the time series data"
            }

            Ensure all strings are properly escaped and the output is valid JSON.
        """
        )

        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            dev_prompt,
            generation_config={
                "response_mime_type": "application/json",
                # Remove response_schema to avoid potential enforcement issues
            },
        )

        # Log the raw response for debugging
        logger.info(f"Gemini response: {response.text}")

        # Attempt to parse and validate JSON
        try:
            json.loads(response.text)
            return {"response": response.text}  # Valid JSON, return as-is
        except json.JSONDecodeError as parse_err:
            logger.error(
                f"Invalid JSON from Gemini: {parse_err}, Response: {response.text}"
            )
            # Fallback response to ensure frontend receives valid JSON
            return {
                "response": json.dumps(
                    {
                        "summary": "Unable to generate summary due to invalid response from AI.",
                        "suggestion": "Please try again or contact support.",
                    }
                )
            }

    except Exception as e:
        logger.error(f"Gemini Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gemini Error: {str(e)}")


@router.post("/bill_reading_v2")
async def bill_read_v2(prompt_imgs: list[UploadFile] = File(...)):
    try:
        dev_prompt = """
            Summarize this bill and provide a JSON response with the following fields: 
            billType, issuer, totalBill, billDate, explanation, highlights, discrepancies.
            If there are multiple bills, make sure that the images are of the same type, issuer, date,
            and most importantly, its the next page of the same bill. Else, set the isValidBill to false.

            The billType is the type of bill.
            The issuer is the name of the company that issued the bill.
            The totalBill is the total amount of the bill.
            The billDate is the date of the bill.
            The explanation is the explanation of the bill.
            The highlights are the highlights of the bill.
            The discrepancies are the discrepancies of the bill.
            If the bill is not valid, set isValidBill to false.

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
                "isValidBill": true
            }
        """

        model = genai.GenerativeModel(model_name)
        
        # Prepare parts for the request - start with text prompt
        parts = [{"text": dev_prompt}]
        
        # Add each image as a separate part
        for prompt_img in prompt_imgs:
            img_bytes = await prompt_img.read()
            parts.append({
                "inline_data": {
                    "mime_type": prompt_img.content_type or "image/png",
                    "data": img_bytes,
                }
            })

        response = model.generate_content(
            [
                {
                    "role": "user",
                    "parts": parts,
                }
            ],
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": BillResponse,
            },
        )

        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Error: {e}")