from datetime import datetime
from enum import IntFlag
import re
from flask import Blueprint, jsonify, abort, request
from sqlalchemy import asc, and_, func

from api.db import Session
from api.db.models import Event
from api.db.resolve import resolve

import api.lib.validate as rules
from api.lib.resolved import Resolved

from api.middleware.authenticate import authenticate, get_user
from api.middleware.validate import validate

blueprint = Blueprint("upcoming", __name__)

class NotificationFlags(IntFlag):
    Acknowledged = 1 << 0
    Notify = 1 << 1

    @staticmethod
    def resolve(
        notify,
        ack
    ):
        flags = NotificationFlags(0)

        if notify:
            flags |= NotificationFlags.Notify

        if ack:
            flags |= NotificationFlags.Acknowledged

        return flags

@blueprint.get("/upcoming-events")
@authenticate()
def get_upcoming_events():
    teacher = get_user()

    upcoming_events = Session.query(Event) \
        .filter(Event.teacher_id == teacher.id) \
        .filter(Event.scheduled_at > datetime.utcnow()) \
        .order_by(asc(Event.scheduled_at)) \
        .limit(50) \
        .all()

    return jsonify(resolve([
        {
            'id': event.id,
            'type': event.type.value,
            'scheduled_at': event.scheduled_at,
            'flags': NotificationFlags.resolve(event.notify, event.ack),
            'data': event.data
        } for event in upcoming_events
    ]))

@blueprint.post("/upcoming-events/<id>/notify")
@authenticate()
@validate(path=rules.object({ 'id': rules.exists(Event) }))
def notify_for_upcoming_event(id):
    event = Resolved.get(id)

    if event.teacher_id != get_user().id:
        abort(403)

    if event.notify:
        abort(409)

    event.notify = True
    Session.commit()

    return "", 204

@blueprint.delete("/upcoming-events/<id>/notify")
@authenticate()
@validate(path=rules.object({ 'id': rules.exists(Event) }))
def delete_notify_for_upcoming_event(id):
    event = Resolved.get(id)
    
    if event.teacher_id != get_user().id:
        abort(403)

    if not event.notify:
        abort(409)

    event.notify = False
    Session.commit()

    return "", 204


"""
PUT /upcoming-events/ack

["evt_abcd", "evt_defg", "evt_hijk", "evt_lmno", ...]

->

HTTP/1.1 204 No Content # implies OK with no data
"""
@blueprint.put("/upcoming-events/ack")
@validate(
    json=rules.array(rules.exists(Event)).max_len(100).required()
)
def ack_upcoming_events():
    data = request.get_json()

    Session.execute(
"""
UPDATE event
SET ack = true
WHERE id in :ids
""",
        { "ids": data }
    )
    Session.commit()

    return "", 204