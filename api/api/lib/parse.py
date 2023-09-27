from datetime import datetime


def parse_date(data: str):
    # TODO(15): don't slice and throw error
    data = data[:-1]

    return datetime.fromisoformat(data)