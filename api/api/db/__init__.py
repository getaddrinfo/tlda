from enum import Enum
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session, relationship
from .dict import Rename, Encode, Flatten, Map, Iterate, Place, BaseEncoder

__all__ = ("Session", "Base")

# Create an engine that has a pool backing it
# meaning that we can reuse connections which
# is cheaper than creating a new one on every
# request.
#
# TODO: move to an env variable
engine = create_engine('postgresql://root:root@localhost:5432/tlda')

def try_get_value(value):
    if isinstance(value, Enum):
        return value.value
    
    return value

class CBase:
    # default to_dict impl
    def to_dict(self, fields=None):
        output = {}

        if fields is not None:
            for field in fields:                
                output = BaseEncoder.run(
                    output,
                    field,
                    self
                )

        else:
            for column in self.__table__.columns:
                output[column.name] = try_get_value(getattr(self, column))

        return output

from threading import get_ident

# Session that is used in requests
Session = scoped_session(sessionmaker(bind=engine), scopefunc=get_ident)

# The base of all models that are used by
# the app.
Base = declarative_base(cls=CBase)


# A handler for tearing down a
# request context.
def teardown_db_session(next):
    # Release the underlying conn
    # back into the pool of conns
    # so it can be used in future.
    Session.remove()

    return next

# add the handler to our app.
def attach_handler(app: Flask):
    # instead of using decorators,
    # we just do the underlying
    # operation ourselves to maintain
    # relatively clean code.

    app.teardown_appcontext_funcs.append(teardown_db_session)

    