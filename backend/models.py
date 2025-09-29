# backend/models.py
from pydantic import BaseModel, Field
from pydantic_core import core_schema
from bson import ObjectId
from typing import Any, Optional

class PyObjectId:
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler) -> core_schema.CoreSchema:
        def validate(v, _):  # <--- THE FIX IS HERE
            """Accept the second 'info' argument, but ignore it."""
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId")
            return ObjectId(v)

        return core_schema.json_or_python_schema(
            python_schema=core_schema.with_info_plain_validator_function(validate),
            json_schema=core_schema.str_schema(),
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )

# Model for data you receive from the user
class LogEntry(BaseModel):
    content: str = Field(...)
    mood: int = Field(..., ge=1, le=5)

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Worked on the new personal system project.",
                "mood": 5,
            }
        }

# Model for data you send back to the user
class LogEntryInDB(LogEntry):
    id: Optional[PyObjectId] = Field(alias="_id")