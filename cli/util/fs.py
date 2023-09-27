import pickle

from dataclasses import dataclass
from datetime import datetime
from os import urandom, remove

# represents the token structured
# including the value of the token
# and when it expires (from the api)
@dataclass
class Token:
    value: str
    expires_at: datetime


# tries to read the token
# from the .token file, otherwise
# returns None if it fails
def read():
    try:
        with open(".token", "rb") as f:
            return pickle.load(f)
    except:
        return None        

# represents the arguments for the 
# write function
@dataclass
class WriteArgs:
    token: str
    expires_at: str

# writes the token as the Token dataclass
# to a file via pickle (a raw binary format
# for storing python objects)
def write(raw: WriteArgs):
    token = Token(
        value=raw.token,
        expires_at=datetime.fromisoformat(raw.expires_at)
    )

    with open(".token", "wb") as f:
        pickle.dump(token, f)

# writes a bunch of random bytes to the file
# and then removes it via the os remove function
def destroy():
    rand_bytes = urandom(32)

    with open(".token", "w") as f:
        f.write(str(rand_bytes))
    
    remove(".token")