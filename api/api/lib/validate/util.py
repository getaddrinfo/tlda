from typing import Optional

from .error import Path

def make_local_path(prefix: Optional[Path], local: str) -> Path:
    if prefix is None:
        return (local,)

    return prefix + (local,)