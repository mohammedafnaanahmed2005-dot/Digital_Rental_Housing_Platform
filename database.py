import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/my_database")

def get_database():
    try:
        client = MongoClient(MONGO_URI)
        # Verify connection
        client.admin.command('ping')
        print(f"MongoDB Connected: {MONGO_URI}")
        return client.get_database() # Returns default database from URI
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

db = get_database()
