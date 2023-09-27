import os

class MissingEnvValueError(Exception):
    missing_key: str

    def __init__(self, missing_key: str):
        super("missing env var: {}".format(missing_key))

        self.missing_key = missing_key

class Config:
    # secrets used for cryptographic purpose, must remain secure
    app_secret: str

    # base url of the api, defaults to '/api/v1'
    base_url: str

    # school acronym
    school_acronym: str

    # initialise the application with information from the environment
    def __init__(self) -> None:
        self.app_secret = load_or_default("APP_SECRET", os.urandom(16).hex()) # Get app_secret from config, or generate random bytes based on OS' secure random generator
        self.base_url = load_or_default("base_url", "/api/v1")
        self.school_acronym = load_or_default("SCHOOL_ACRONYM", "not_set")


    # staticmethod decorator allows us to call the method without having
    # an instance of the class prepared, e.g Config.load()
    # this is useful as it provides more semantic code and allows others
    # to better understand the usage of this code.
    @staticmethod
    def load():
        return Config()

    # Used to allow flask to parse it into config.
    # Flask requires them to be upper case keys (SCREAMING_SNAKE_CASE)
    # or it will ignore the variable as it assumes it is not used within
    # the environment of the application, so this method is used to parse 
    # them to said format.
    def to_dict(self):
        return {
            'APP_SECRET': self.app_secret,
            'BASE_URL': self.base_url,
            'SCHOOL_ACRONYM': self.school_acronym
        }

# loads an environment variable from os.environ
# if not present, raises a MissingEnvValueError
def load_or_raise(key: str) -> str:
    value = os.environ.get(key, None) # get from env variables

    # if the value isn't defined, raise an error
    if value is None:
        raise MissingEnvValueError(key)
    
    return value

# loads an environment variable from os.environ
# if not present, substitutes default
def load_or_default(key: str, default: str) -> str:
    return os.environ.get(key, False) or default