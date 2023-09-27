from ..type import BaseTypeValidator

class AnyValidator(BaseTypeValidator):
    def __init__(self):
        super().__init__("any") # initialise the BaseTypeValidator constructor that we are derived from
        
    def validate(self, _, __):
        return []


        