from enum import Enum
import re
from typing import List, Optional, Union
from typing_extensions import Self

from api.lib.validate.error import Path, ValidationError

from ..type import BaseTypeValidator

class CaseType(Enum):
    UPPER = "upper"
    LOWER = "lower"

class RuleType(Enum):
    MinLen = "min_len"
    MaxLen = "max_len"
    Case = "case"
    
    CharsInList = "chars_permitted"
    CharsNotInList = "chars_blocked"

    RegexMustMatch = "regex_must_match"
    RegexMustNotMatch = "regex_must_not_match"

class StringValidator(BaseTypeValidator):
    def __init__(self):
        super().__init__("string") # initialise the BaseTypeValidator constructor that we are derived from.

    # sets the minimum length for this StringValidator
    def min_len(self, len: int) -> Self:
        self._rules[RuleType.MinLen] = len
        return self

    # sets the maximum length for this StringValidator
    def max_len(self, len: int) -> Self:
        self._rules[RuleType.MaxLen] = len
        return self

    # sets the case expected for this string to UPPER
    def upper_case(self) -> Self:
        self._rules[RuleType.Case] = CaseType.UPPER
        return self

    # sets the case expected for this string to LOWER
    def lower_case(self) -> Self:
        self._rules[RuleType.Case] = CaseType.LOWER
        return self

    # sets the chars that are permitted for this string
    def chars(self, data: Union[str, List[str]]) -> Self:
        if isinstance(data, str):
            data = list(data)

        self._rules[RuleType.CharsInList] = data
        return self

    # sets the chars that aren't permitted for this string
    def blocked(self, data: Union[str, List[str]]) -> Self:
        if isinstance(data, str):
            data = list(data)

        self._rules[RuleType.CharsNotInList] = data
        return self

    # requires the data to match a regex
    def matches(self, data: re.Pattern) -> Self:
        self._rules[RuleType.RegexMustMatch] = data
        return self

    # requires the data to __not__ match a regex
    def doesnt_match(self, data: re.Pattern) -> Self:
        self._rules[RuleType.RegexMustNotMatch] = data
        return self
    

    def validate(self, data, path: Optional[Path]):
        errors = []
        make_error = ValidationError.creator(path)

        # If the data is not even an instance of str
        # we can just return straight away.
        #
        # No point in running extra checks which may
        # produce undefined behaviour
        if not isinstance(data, str):
            errors.append(make_error(
                "Value is not a valid string",
                "COERCE_TYPE_STRING"
            ))

            return errors
        
        # validator.min_len(int)
        if self.defined_rule(RuleType.MinLen):
            min_len = self.get_rule_value(RuleType.MinLen)

            # if the length is too short
            if len(data) < min_len:
                errors.append(make_error(
                    "Value less than minimum length ({})".format(min_len),
                    "STRING_TOO_SHORT"
                ))

        # validator.max_len(int)
        if self.defined_rule(RuleType.MaxLen):
            max_len = self.get_rule_value(RuleType.MaxLen)

            # if the length is too long
            if len(data) > max_len:
                errors.append(make_error(
                    "Value exceeds maximum length ({})".format(max_len),
                    "STRING_TOO_LONG"
                ))

        # validator.lower_case() and validator.upper_case()
        if self.defined_rule(RuleType.Case):
            case = self.get_rule_value(RuleType.Case)

            # if rule is for lowercase
            if case == CaseType.LOWER:
                if not data.islower():
                    errors.append(make_error(
                        "Value is not lowercase",
                        "STRING_NOT_LOWERCASE"
                    ))
            else: # otherwise, the rule is for uppercase
                if not data.isupper():
                    errors.append(make_error(
                        "Value is not uppercase",
                        "STRING_NOT_UPPERCASE"
                    ))

        # validator.chars(acceptable)
        if self.defined_rule(RuleType.CharsInList):
            chars_permitted = set(self.get_rule_value(RuleType.CharsInList)) # ensure only unique chars for performance overhead
            chars_in_text = set(list(data)) # ditto

            ERROR_CODE = "STRING_CONTAINS_DISALLOWED_CHARS" # reduce repetition
            ERROR_MESSAGE = "Value contains characters that are not permitted (allowed: {})".format("".join(chars_permitted)) # ditto

            # more optimal check
            # we know if there are more characters in the text
            # than are permitted, then there must be 
            # non-permitted characters
            if len(chars_in_text) > len(chars_permitted):
                errors.append(make_error(
                    ERROR_MESSAGE,
                    ERROR_CODE
                ))
            else:
                found = False

                # max time complexity: O(n) where n = len(chars_in_text)
                # checks each char in text against those in permitted
                # lookup time for `in` on `chars_permitted` is O(1)
                # set in python is just a dict where the key 
                # is an entry and the value is a boolean
                for char in chars_in_text:
                    if not char in chars_permitted:
                        found = True
                        break
                        
                # was there a match?
                if found:
                    errors.append(make_error(
                        ERROR_MESSAGE,
                        ERROR_CODE
                    ))

        # validator.blocked(unacceptable)
        if self.defined_rule(RuleType.CharsNotInList):
            chars_blocked = set(self.get_rule_value(RuleType.CharsNotInList)) # ensure only unique chars for performance overhead
            chars_in_text = set(list(data)) # ditto

            ERROR_CODE = "STRING_CONTAINS_DISALLOWED_CHARS"
            ERROR_MESSAGE = "Value contains characters that are not permitted"
            
            found = False

            # max time complexity: O(n) where n = len(chars_in_text)
            for char in chars_in_text:
                if char in chars_blocked:
                    found = True
                    break

            # was there a blocked char?
            if found:
                errors.append(make_error(
                    ERROR_MESSAGE,
                    ERROR_CODE
                ))
        
        # validator.matches(regex)
        if self.defined_rule(RuleType.RegexMustMatch):
            regex: re.Pattern = self.get_rule_value(RuleType.RegexMustMatch)

            # match against the regex
            result = re.match(regex, data)

            # if there wasn't a match
            if result is None:
                errors.append(make_error(
                    "Value did not match required regex ({})".format(regex.pattern),
                    "STRING_FAILED_MATCH_REGEX"
                ))
        
        # validator.doesnt_match(regex)
        if self.defined_rule(RuleType.RegexMustNotMatch):
            regex: re.Pattern = self.get_rule_value(RuleType.RegexMustNotMatch)

            # match against text
            result = re.match(regex, data)

            # if there was a match
            if result is not None:
                errors.append(make_error(
                    "Value matched regex where it should not hagve ({})".format(regex.pattern),
                    "STRING_MATCHED_REGEX_ILLEGAL"
                ))

        return errors
