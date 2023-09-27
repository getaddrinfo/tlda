from dataclasses import dataclass
from flask import jsonify
import math

from api.db.models import Teacher
from api.db import Base
from api.middleware.authenticate import nullable_get_user

from typing import Callable, Dict, Union

@dataclass
class PaginationContext:
    user: Teacher

    @staticmethod
    def new():
        return PaginationContext(
            user=nullable_get_user()
        )

# represents the arguments for a 
# pagination result
@dataclass
class PaginationArguments:
    page: int
    per_page: int
    mapper: Union[Callable[[Base, PaginationContext], Dict], None] = None

# produces a pagination result for the client
# from a query and some arguments. Abstracts away
# creating count/page info and handles mapping data
# iteratively
def paginate(
    query,
    args: PaginationArguments
):
    ctx = PaginationContext.new()
    count = query.count()

    # offset, limit for pagination
    # client can specify a custom per_page
    # value between 1 and 100, but adjusting
    # this between requests will lead to skipped
    # information.
    results = query \
        .limit(args.per_page) \
        .offset(args.per_page * args.page) \
        .all()

    # max number of pages
    limit = math.ceil(count / args.per_page)
    
    # if the current page is greater than
    # the limit of pages, then there are
    # no more results
    is_page_full = (args.page + 1) >= limit

    # the index of the next page, if applicable
    next_page_index = (args.page + 1) if (limit != args.page and not is_page_full) else None

    # the resulting data, from the result of the
    # mapper if it is defined, otherwise by calling
    # to_dict on the models.
    data = [
        args.mapper(obj, ctx) 
        for obj in results
    ] if args.mapper is not None else [
        result.to_dict()
        for result in results
    ]


    return jsonify({
        'data': data,
        'pagination': {
            'count': count,
            'pages': {
                'next': next_page_index,
                'total': limit
            }
        }
    })