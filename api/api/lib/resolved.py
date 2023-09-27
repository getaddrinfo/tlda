import flask

RESOLVED_KEY = "resolved_models"

class Resolved:
    # adds a dictionary of id -> model
    # to the dict of models we have already
    # resolved
    @staticmethod
    def add(new):
        data = flask.g.get(RESOLVED_KEY, dict())

        data = {
            **data,
            **new
        }

        setattr(flask.g, RESOLVED_KEY, data)

    # gets a specific model, or None if it
    # isn't present
    @staticmethod
    def get(id):
        data = flask.g.get(RESOLVED_KEY, dict())

        return data.get(id, None)