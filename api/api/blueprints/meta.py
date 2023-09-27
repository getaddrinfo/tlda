from flask import Blueprint, jsonify, current_app as app
from api.lib.git import get_version

blueprint = Blueprint("meta", __name__)

@blueprint.get("/health")
def get_health():
    return jsonify({
        "ok": True
    })

@blueprint.get("/instance")
def get_instance_data():
    return jsonify({
        "version": get_version(),
        "git": {
            "revision": app.config['GIT_REVISION']
        }
    }) 