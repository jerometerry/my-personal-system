# backend/database.py
import os
import boto3
from pymongo import AsyncMongoClient
from .config import settings

def get_mongo_client():
    """
    Determines the environment and returns the appropriate MongoDB client.
    - In AWS, fetches the secure URI from SSM Parameter Store.
    - Locally, connects to the Docker container.
    """

    if 'MONGO_URI_PARAM_NAME' in os.environ:
        print("Connecting to MongoDB via AWS SSM Parameter Store...")
        ssm = boto3.client('ssm')
        param_name = os.environ['MONGO_URI_PARAM_NAME']
        try:
            response = ssm.get_parameter(Name=param_name, WithDecryption=True)
            mongo_uri = response['Parameter']['Value']
            return AsyncMongoClient(mongo_uri)
        except Exception as e:
            print(f"Error fetching MongoDB URI from SSM: {e}")
            raise
    else:
        print("Connecting to local MongoDB...")
        return AsyncMongoClient(settings.MONGO_URI)

client = get_mongo_client()
db = client[settings.DATABASE_NAME]

def get_collection(name: str):
    return db.get_collection(name)