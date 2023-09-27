from typing import List
from api.db.models import AssessmentScore
from dataclasses import dataclass
import math

def fixed(val):
    return float(f'{val:.3f}')

@dataclass
class CalculateResult:
    variance: float
    mean: float
    std_dev: float

    def to_dict(self):
        return {
            'variance': fixed(self.variance),
            'mean': fixed(self.mean),
            'std_dev': fixed(self.std_dev)
        }


# calculates population statistical 
# values
#
# this is appropriate, as the population
# are the scores of the assesment
def calculate(models: List[AssessmentScore]) -> CalculateResult:
    scores = [model.mark for model in models]

    # mean is sum of all values divided
    # by the number of values obtained
    mean = sum(scores) / len(scores)

    # variance is a measurement of the spread
    # between numbers in a data set. this is useful
    # as we can use it to compare assessments against
    # each other
    variance = sum([(val - mean)**2 for val in scores]) / len(scores)

    # standard deviation indicates how spread apart 
    # from the mean a data set is:
    # - a low standard deviation => low spread
    # - a high standard deviation => high spread
    #
    # standard deviation is also useful as we can
    # use it to filter statistically insignificant
    # values from the resulting graphics produced
    #
    # this value is likely the most important one
    # that we have calculated in this data set
    stddev = math.sqrt(variance)

    return CalculateResult(
        mean=mean,
        variance=variance,
        std_dev=stddev
    )