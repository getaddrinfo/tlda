from functools import wraps
from .token import get
import click


def logged_in(f):
    # this wrapper helps python understand
    # that what we are defining is a wrapper
    # (decorator) around the function f
    #
    # we can then use similar syntax as below
    # to attach the decorator
    @wraps(f)
    def wrapped(*args, **kwargs):
        # if there is no token
        # return early
        if get() is None:
            click.echo("[auth] no auth, please log in using 'tlda login <email>'", err=True)
            return

        # run the next function without
        # modifying the arguments passed
        # by the caller
        return f(*args, **kwargs)

    return wrapped

