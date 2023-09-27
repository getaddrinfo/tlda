import logging # logging library
from flask import Flask, send_from_directory # http server
import os

from api.config import Config
from api.lib.error.register import register_exception_handlers
from api.lib.git import get_git_revision_hash
from api import db
from api.middleware.validate import validate
import api.lib.validate as rules

from api.db.models.teacher import Teacher

from api.blueprints.meta import blueprint as meta_blueprint
from api.blueprints.auth import blueprint as auth_blueprint
from api.blueprints.user import blueprint as user_blueprint
from api.blueprints.upcoming import blueprint as upcoming_blueprint
from api.blueprints.lessons import blueprint as lessons_blueprint
from api.blueprints.review import blueprint as review_blueprint
from api.blueprints.assessment import blueprint as assessment_blueprint
from api.blueprints.assessment_scores import blueprint as assessment_scores_blueprint
from api.blueprints.grading_system import blueprint as grading_system_blueprint
from api.blueprints.department import blueprint as department_blueprint

logging.basicConfig(level=logging.DEBUG) # init the logger to write to console with a minimum level of INFO (logger.info(args))

logger = logging.getLogger(__name__)
root = os.path.join(os.path.abspath(__file__), "static")

app = Flask(__name__)
app.config.from_object(Config.load().to_dict()) # Add the config from env to flask's dictionary of config keys.
app.config['JSON_SORT_KEYS'] = False
app.config['GIT_REVISION'] = get_git_revision_hash()

db.attach_handler(app) # attach db handlers to our app
register_exception_handlers(app) # register all the exception handlers

app.register_blueprint(meta_blueprint)
app.register_blueprint(auth_blueprint)
app.register_blueprint(user_blueprint)
app.register_blueprint(upcoming_blueprint)
app.register_blueprint(lessons_blueprint)
app.register_blueprint(review_blueprint)
app.register_blueprint(assessment_blueprint)
app.register_blueprint(assessment_scores_blueprint)
app.register_blueprint(grading_system_blueprint)
app.register_blueprint(department_blueprint)

# in production we need a more rigid system
# but for development, this is fine.
@app.after_request
def cors(response):
    headers = [
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Headers",
        "Access-Control-Max-Age"
    ]

    for key in headers:
        response.headers[key] = "*"

    return response

@app.route('/static/<path:path>', methods=['GET'])
def static_proxy(path):
    return send_from_directory(root, path)

# Only run this specific code if it is the file that is being ran by 
# the python interpreter. If this file is being imported elsewhere, 
# let it decide whether or not to run the code.
if __name__ == "__main__":
    logger.info("binding http server")

    app.run(
        "0.0.0.0", # The host that the http server should bind to, this should be moved to an env var or constant
        4000, # The port that the http server will listen on, this should be moved to an env var or constant
        debug=True # Provides extra information that is used in development
    )