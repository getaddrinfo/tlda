from ctypes import Union
from typing import Tuple, List
from . import Session
from .id import ID_PREFIX_TO_MODEL, ID_REGEX

REF_KEY = "$ref"
FIELDS_KEY = "$fields"

def _extract_ids(data):
    out = []    

    # if data is a list
    if isinstance(data, list):
        # extract ids for each element
        # in the list
        for elem in data:
            out.extend(_extract_ids(elem))

    # if the data is a dictionary (map)
    if isinstance(data, dict):
        # try get a reference
        ref = data.get(REF_KEY, None)

        # if there is one,
        # add its id to the list
        if ref is not None:
            out.append(ref)
        else:   
            # otherwise, for each value,
            # try and find ids
            for value in data.values():
                out.extend(_extract_ids(value))

    # return all the ids found
    return out


def _resolve_ids(data: List[str]):
    resolved = dict()

    # cleanup data into type -> [id]
    for value in data:
        type = value.split("_")[0]
        arr = resolved.get(type, [])
        
        arr.append(value)

        resolved[type] = arr

    res = {}

    # for each type -> [id]
    for (type, ids) in resolved.items():
        model = ID_PREFIX_TO_MODEL.get(type)

        # get all of the results
        result = Session.query(model) \
            .filter(model.id.in_(ids)) \
            .all()

        # for each model in the result
        for mod in result:  
            # id -> model
            res[mod.id] = mod

    # id -> model
    return res


# this entire function mutates
# data from a bunch of references
# to a bunch of models that
# can be interpreted properly by the api
def resolve(original):
    extracted = _extract_ids(original)
    resolved = _resolve_ids(extracted)
    return _put_back_in_place(original, resolved)


def create_ref_from_model(model, fields=None):
    return create_ref_from_id(model.id, fields)

def create_ref_from_id(id, fields=None):
    out = {'$ref': id}

    if fields is not None:
        out['$fields'] = fields

    return out

def _put_back_in_place(original, resolved):
    # original = raw data
    # resolved = id -> model

    if isinstance(original, list):
        for i, elem in enumerate(original):
            original[i] = _put_back_in_place(elem, resolved)

    if isinstance(original, dict):
        if original.get(REF_KEY) != None:
            ref = original[REF_KEY]
            fields = original.get(FIELDS_KEY, None)
            model = resolved[ref]

            return model.to_dict(fields)

        for (key, value) in original.items():
            original[key] = _put_back_in_place(value, resolved)

    return original

