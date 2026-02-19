# backend/main.py
import os
import boto3
from fastapi import FastAPI, Body, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime

from .database import get_collection
from .models import LogEntry, LogEntryInDB, TimeLogEntry, TimeLogEntryInDB

app = FastAPI()

def get_mongo_uri():
    if os.environ.get("IS_OFFLINE"): # For local development
        return "mongodb://localhost:27017"
    
    ssm = boto3.client('ssm')
    param_name = os.environ['MONGO_URI_PARAM_NAME']
    response = ssm.get_parameters(Names=[param_name], WithDecryption=True)
    return response['Parameters'][0]['Value']

origins = [
    "http://localhost:9000",
    "http://localhost:5173",
    "https://tools.authenticnerd.com"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if "WEBSITE_CLOUDFRONT_URL" in os.environ:
    origins.append(os.environ["WEBSITE_CLOUDFRONT_URL"])

if "WEBSITE_ALTERNATE_DOMAIN" in os.environ:
    origins.append(os.environ["WEBSITE_ALTERNATE_DOMAIN"])

router = APIRouter()
log_collection = get_collection("logs")

@router.post(
    "/log",
    response_model=LogEntryInDB,
    status_code=status.HTTP_201_CREATED,
    operation_id="create_log",
)
async def create_log_endpoint(log: LogEntry = Body(...)):
    """Create a new log entry in the database."""
    log_dict = log.model_dump()
    new_log = await log_collection.insert_one(log_dict)
    created_log = await log_collection.find_one({"_id": new_log.inserted_id})
    return created_log

@router.get(
    "/log",
    response_model=List[LogEntryInDB], 
    operation_id="list_logs",
)
async def list_logs_endpoint():
    """Retrieve all log entries from the database."""
    logs = await log_collection.find().to_list(100)
    return logs

@router.post(
    "/log/import",
    operation_id="import_logs",
)
async def import_logs_endpoint(logs: List[TimeLogEntry] = Body(...)):
    if not logs:
        return {"status": "no logs provided", "imported_count": 0}
    
    logs_to_insert = []
    for log in logs:
        timestamp = datetime.combine(log.entry_date, log.entry_time)
        log_dict = log.model_dump(exclude={'entry_date', 'entry_time'})
        log_dict['timestamp'] = timestamp
        logs_to_insert.append(log_dict)

    timelog_collection = get_collection("timelogs")
    result = await timelog_collection.insert_many(logs_to_insert)
    
    return {"status": "success", "imported_count": len(result.inserted_ids)}

@router.get(
    "/timelogs",
    response_model=List[TimeLogEntryInDB],
    operation_id="list_timelogs",
)
async def list_timelogs_endpoint():
    timelog_collection = get_collection("timelogs")
    logs = await timelog_collection.find().to_list(1000)
    return logs

app.include_router(router, prefix="/api")
