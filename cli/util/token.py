import click
import pickle

from dataclasses import dataclass
from datetime import datetime
from os import urandom, remove

from . import fs

TOKEN = None

# loads the token from memory
def init():
    store(fs.read())

    if get() is not None and get().expires_at < datetime.now():
        store(None)
        
        click.echo("[credentials] outdated, please login again")

# stores the token state in the system
def store(token):
    if not isinstance(token, fs.Token) and token is not None:
        raise Exception("token is not instanceof Token")

    global TOKEN
    TOKEN = token

# getter for the global token state
def get() -> fs.Token:
    return TOKEN

def remove() -> None:
    fs.destroy()