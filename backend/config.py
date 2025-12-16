import os
from dotenv import load_dotenv
load_dotenv()
class config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    MONGO_URI = os.environ.get("MONGODB_URI")
