from flask import current_app

from secrets import token_urlsafe as _generate
from hashlib import sha1 as _sha1

SECRET_NOT_VERY_SECRET = "Nl-9pjDWz_NyFiTbCnCkT_-Jize-UYjDWjNqfDqixzk"

def _apply_secret(data: str) -> bytes:
    return bytes(f"{SECRET_NOT_VERY_SECRET}:{data}", "utf-8")

def sha1(data: str) -> bytes:
    return _sha1(_apply_secret(data)).digest()

def generate() -> str:
    return f"{current_app.config['SCHOOL_ACRONYM']}_" + _generate(32)



def compare(data: str, expected: str) -> bool:
    return expected == sha1(data)
