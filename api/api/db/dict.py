from enum import Enum
from typing import List, Union
from typing_extensions import Self

def try_get_value(value):
    if isinstance(value, Enum):
        return value.value
    
    return value

# represents what the encode encoder
# should do when it encounters a null
# value
class NullEncodeOption(Enum):
    RaiseException = 0,
    AsNull = 1,
    Skip = 2


class BaseEncoder:
    source: str

    def __init__(self, source: str) -> None:
        self.source = source

    # represents the build method that is 
    # called when building the result into
    # a dictionary that can be interpreted as
    # json
    def build(self, model): ...

    # returns the location to set the data at
    @property
    def location(self):
        if (value := getattr(self, 'target', None)) is not None:
            return value

        if isinstance(self.source, BaseEncoder):
            return self.source.location

        return self.source


    @staticmethod
    def run(current, param, model = None):
        if isinstance(param, tuple) and len(param) == 2:
            (source, target) = param
            current[target] = try_get_value(getattr(model, source))

        if isinstance(param, Encode):
            value = getattr(model, param.source, None)
            on_null = param.on_null

            # if the caller wants to raise an exception on none,
            # and the value is none, raise an exception
            if on_null == NullEncodeOption.RaiseException:
                if value is None:
                    raise Exception("tried to encode a None value")

                current = { **current, **param.build(value) }

            # if the caller wants to skip the key on none, but the 
            # value isn't none, encode it
            if on_null == NullEncodeOption.Skip and value is not None:
                current = { **current, **param.build(value) }

            # if the caller wants to encode the value as none
            # and the value is none, encode None at the location
            # otherwise call the build method on the param
            if on_null == NullEncodeOption.AsNull:
                if value is None:
                    current = { **current, param.location: None }
                else:
                    current = {
                        **current,
                        **param.build(value)
                    }

        if isinstance(param, (Rename, Flatten, Map, Iterate)):
            current = { **current, **param.build(model) }

        if isinstance(param, Place):
            current = { **current, **param.build() }



        # fallback
        if isinstance(param, str):
            current[param] = try_get_value(getattr(model, param))

        return current

        

class Rename(BaseEncoder):
    target: str

    def __init__(self, source: Union[str, BaseEncoder], target: str) -> None:
        super().__init__(source)

        self.target = target

    def build(self, model):
        # if the source is an encoder
        # run the encoder, then get the location
        # that the value is placed at

        if isinstance(self.source, BaseEncoder):
            key = self.source.location

            return {
                self.location: self.source.build(model)[key]
            }

        return {
            self.location: try_get_value(getattr(model, self.source))
        }

class Encode(BaseEncoder):
    target: str
    args: List[Union[str, BaseEncoder]]
    source: str

    def __init__(self, source: str, args: List[Union[str, BaseEncoder]], *, target: str = None, on_null: NullEncodeOption = NullEncodeOption.RaiseException) -> None:
        super().__init__(source)
        
        self.target = target
        self.args = args
        self.on_null = on_null

    def build(self, model):
        out = {}

        for param in self.args:
            out = BaseEncoder.run(
                out,
                param,
                model
            )

        return {
            self.location: out
        }

class Flatten(BaseEncoder):
    target: str
    args: List[str]

    def __init__(self, args: List[str], *, target) -> None:
        super().__init__(None)

        self.target = target
        self.args = args

    def build(self, model):
        def traverse(model, args: List[str]):
            p = args.pop(0)

            if len(args) == 0:
                return try_get_value(getattr(model, p))
            else:
                return traverse(getattr(model, p), args)

        out = traverse(model, self.args)

        return { self.location: out }

class Map(BaseEncoder):
    def __init__(self, source, fn) -> None:
        # falls back to source as the location,
        # so acceptable to do this
        super().__init__(source)
        self.fn = fn

    def build(self, model):
        if isinstance(self.source, str):
            return {
                self.location: self.fn(getattr(model, self.source))
            }

        return {
            self.location: self.fn(self.source.build(model))
        }

class Iterate(BaseEncoder):
    source: str
    args: List[Union[str, BaseEncoder]]

    def __init__(self, source: str, args: List[Union[str, BaseEncoder]], *, target: str = None):
        super().__init__(source)

        self.target = target
        self.args = args

    def build(self, model):
        ret = []

        # gets the source to iterate values
        # from
        iter_src = getattr(model, self.source)

        # if the value is callable, call it (e.g., in the case
        # we are calling a method on a model that relies on values
        # from the model to run)
        iter_upon = iter_src() if callable(iter_src) else iter_src

        for value in iter_upon:
            out = {}

            # for each encoder, run it
            # and merge it with the current
            # output value
            for param in self.args:
                out = BaseEncoder.run(
                    out,
                    param,
                    value
                )

            ret.append(out)

        return {
            self.location: ret
        }        

class Place(BaseEncoder):
    def __init__(self, data):
        # we do not use the source for this encoder
        # so we can set it to none safely
        super().__init__(None)
        self.data = data

    def build(self):
        return self.data