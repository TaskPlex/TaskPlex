"""
JSON data generator API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.json_data_generator import (
    JSONDataGeneratorRequest,
    JSONDataGeneratorResponse,
)
from app.services.json_data_generator_service import generate_json_data

router = APIRouter(prefix="/json-data-generator", tags=["JSON Data Generator"])


@router.post("/generate", response_model=JSONDataGeneratorResponse)
async def generate_json_data_endpoint(request: JSONDataGeneratorRequest):
    """
    Generate multiple JSON objects from a template with regex placeholders

    - **template**: JSON template with {{regex:pattern}} placeholders for random data
    - **iterations**: Number of JSON objects to generate (1-1000)

    Example template:
    ```json
    {
      "id": "{{regex:\\d{1,5}}}",
      "name": "{{regex:[A-Z][a-z]+}}",
      "email": "{{regex:[a-z]+@[a-z]+\\.com}}",
      "age": "{{regex:[2-9][0-9]}}"
    }
    ```

    The {{regex:pattern}} syntax allows you to specify regex patterns that will be
    used to generate random values for each iteration.
    """
    result = generate_json_data(
        template=request.template,
        iterations=request.iterations,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
