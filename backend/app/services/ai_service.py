import json

from groq import Groq

from app.core.config import settings


client = Groq(
    api_key=settings.groq_api_key
)


MODEL_NAME = "openai/gpt-oss-120b"


def analyze_document(text: str) -> dict:
    """
    Analyze a civic/public-service document using Groq.

    Returns structured information that CivicLens can display
    and ground against the original document.
    """

    prompt = f"""
You are CivicLens AI, an AI assistant that helps people
understand civic, government, public-service, administrative,
and legal documents.

Your job is to extract information accurately from the supplied
document.

IMPORTANT RULES:

1. Do not invent information.
2. Only use information explicitly supported by the document.
3. If information is missing, return an empty array or
   "Not available".
4. Keep summaries simple and understandable.
5. Preserve dates, amounts, names, reference numbers and
   locations accurately.
6. Do not provide legal advice.
7. Do not make assumptions about what a person should legally do.
8. Required actions must be actions explicitly stated or clearly
   requested in the document.
9. Warnings must identify potentially important items explicitly
   present in the document, such as deadlines, missing documents,
   penalties, notices, or urgent instructions.
10. Return ONLY valid JSON.

Return exactly this structure:

{{
    "document_type": "",
    "summary": "",

    "key_facts": [
        {{
            "fact": "",
            "value": ""
        }}
    ],

    "important_dates": [
        {{
            "date": "",
            "description": ""
        }}
    ],

    "amounts": [
        {{
            "amount": "",
            "description": ""
        }}
    ],

    "people": [
        {{
            "name": "",
            "role": ""
        }}
    ],

    "organizations": [
        {{
            "name": "",
            "role": ""
        }}
    ],

    "locations": [
        {{
            "location": "",
            "description": ""
        }}
    ],

    "reference_numbers": [
        {{
            "type": "",
            "value": ""
        }}
    ],

    "required_actions": [
        {{
            "action": "",
            "deadline": ""
        }}
    ],

    "warnings": [
        {{
            "warning": "",
            "reason": ""
        }}
    ],

    "missing_information": [
        ""
    ],

    "simple_explanation": ""
}}

DOCUMENT:

{text}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError(
            "AI returned an empty response"
        )

    # ---------------------------------------------------------
    # Remove accidental Markdown JSON fences
    # ---------------------------------------------------------

    content = content.strip()

    if content.startswith("```"):
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    # ---------------------------------------------------------
    # Parse JSON
    # ---------------------------------------------------------

    try:
        return json.loads(content)

    except json.JSONDecodeError as exc:
        raise ValueError(
            f"AI returned invalid JSON: {content}"
        ) from exc