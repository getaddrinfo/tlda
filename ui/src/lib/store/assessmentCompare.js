import currentUser from "./currentUser";
import { Dispatcher, Store, ActionTypes } from "./internals";

/*
This store manages the state for 1-n (limit = two) assessments
and handles applying and ranking two assessments against
each other
*/

const FetchState = {
    Fetching: "FETCHING",
    Success: "SUCCESS",
    Failure: "FAILURE",
    Standby: "STANDBY"
}


export const SYMBOL_UNKNOWN_DEVIATION = Symbol("deviation.unknown");
export const SYMBOL_UNKNOWN_MEAN = Symbol("mean.unknown");
export const SYMBOL_UNKNOWN_VARIANCE = Symbol("variance.unknown");

const inverse = (invert) => (a) => (b) => !invert ? [a, b] : [b, a];

/**
 * Creates a function that can compare the value of the current assessment's statistical
 * information to all other ones, and represent it as a percentage
 * @param {Record<string, Record<"mean" | "standardDeviation" | "variance", number>>} stats 
 * @param {string} currentAssessmentId 
 * @param {string[]} assessmentIds 
 * @param {boolean} shouldInvert 
 * @returns {(key: string, symbol: typeof Symbol) => Record<string, number>}
 */
const createComparitor = (
    stats,
    currentAssessmentId,
    assessmentIds,
    shouldInvert = false
) => {
    // comparitor('standardDeviation', SYMBOL_UNKNOWN_DEVIATION)
    return ((key, symb) => {
        return assessmentIds
            .filter((id) => id !== currentAssessmentId)
            .reduce((acc, value) => {   
                // if we need to invert the keys,
                // do so now
                const [a, b] = inverse(shouldInvert)(currentAssessmentId)(value);

                // if dividing by zero, quickly set to symbol
                // and return
                if (stats[b].standardDeviation === 0) {
                    acc[value] = symb;
                    return acc;
                }

                // the result of comparing them, which can be
                // transformed to a percentage later
                let val = stats[a][key] / stats[b][key];
                
                // convert to percentage difference
                val = (val - 1) * 100;
                
                acc[value] = val;
                return acc;
            }, {})
    })
}

/**
 * Compares assessments against one another,
 * allowing the client to render the outputs
 * @param {any[]} assessments 
 */
const analyseAssessments = (assessments) => {
    // output
    const out = {};
    // map assessment.id -> stats
    const stats = assessments
        .reduce((acc, { id, statistics }) => ({ ...acc, [id]: statistics }), {});

    // all the assessments
    const ids = assessments.map((ass) => ass.id);


    for (const ass of assessments) {
        const comparitor = createComparitor(
            stats,
            ass.id,
            ids
        );

        out[ass.id] = {
            standardDeviation: comparitor('standardDeviation', SYMBOL_UNKNOWN_DEVIATION),
            mean: comparitor('mean', SYMBOL_UNKNOWN_MEAN),
            variance: comparitor('variance', SYMBOL_UNKNOWN_VARIANCE)
        }
    }

    return out;
}

/**
 * 
 * @param {number[]} scores 
 * @returns 
 */
const calculateStatisticalValues = (scores) => {
    // fallback: we cannot physically
    // produce values from this, since
    // dividing by 0 is an unknown operation
    if(scores.length === 0) {
        return {
            mean: 0,
            variance: 0,
            standardDeviation: 0
        }
    }
    
    // mean is sum of all values divided
    // by the number of values obtained
    const mean = scores.reduce((acc, val) => acc + val, 0) / scores.length;
    
    // variance is a measurement of the spread
    // between numbers in a data set. this is useful
    // as we can use it to compare assessments against
    // each other
    const variance = scores.reduce((acc, val) => acc + ((val - mean)**2), 0) / scores.length;

    // standard deviation indicates how spread apart 
    // from the mean a data set is:
    // - a low standard deviation => low spread
    // - a high standard deviation => high spread
    //
    // standard deviation is also useful as we can
    // use it to filter statistically insignificant
    // values from the resulting graphics produced
    //
    // this value is likely the most important one
    // that we have calculated in this data set
    const stddev = Math.sqrt(variance);

    return {
        mean,
        variance,
        standardDeviation: stddev,
    }
}

let _fetchState = FetchState.Standby;
let _data = null;
let _virtualView = null;
let _comments = null;
let _transform = null;

const __childToParentComment = {};


class AssessmentCompareStore extends Store {
    /** Gets the data from the store, or the virtual view if set */
    getData() {
        if(!_data && !_virtualView) return null;
        if(_virtualView) {
            return _virtualView;   
        }

        return _data;
    }

    /** Returns the analysis of the data, or virtual view if set */
    getAnalysedData() {
        if(!_data && !_virtualView) return null;

        if(_virtualView) {
            return analyseAssessments(_virtualView);
        }

        return analyseAssessments(_data);
    }

    /** Returns false if there is only one assessment in the store (not comparing) */
    isComparison() {
        if(!_data && !_virtualView) return null;
        return _data.length > 1;
    }

    /** Returns the fetch state of the sture */
    getFetchState() {
        return _fetchState
    }

    /** Returns the number of assessment in the store */
    getCount() {
        return this.getData().length;
    }

    /** Returns the comments if set */
    getComments() {
        if(!_comments) return null;
        return _comments;
    }

    getParentId(childId) {
        return __childToParentComment[childId] ?? null;
    }

    hasVirtualView() {
        return _virtualView !== null;
    }

    getLastFilter() {
        return _transform ?? null;
    }
}


export default new AssessmentCompareStore(Dispatcher, {
    [ActionTypes.ASSESSMENT_COMPARE_FETCH_START]: (_) => {
        _fetchState = FetchState.Fetching;
    },
    [ActionTypes.ASSESSMENT_COMPARE_FETCH_SUCCESS]: ({ data }) => {
        // map the data to a more client-friendly format
        _data = data   
            .map((data) => ({
                id: data.id,
                name: data.name,
                type: data.type,
                grading: {
                    values: data.data,
                    system: data.grading_system,
                    boundaries: data.grade_boundaries
                },
                statistics: {
                    variance: data.statistics.variance,
                    mean: data.statistics.mean,
                    standardDeviation: data.statistics.std_dev
                }
            }));
    },
    [ActionTypes.ASSESSMENT_COMPARE_FETCH_FAILURE]: (_) => {
        _fetchState = FetchState.Failure;
    },
    [ActionTypes.ASSESSMENT_COMPARE_APPLY_VIRTUAL_VIEW]: ({ transform }) => {
        _transform = transform;

        // apply the transformations for the virtual view
        // and map to same shape as original data
        _virtualView = _data
            .map((data) => {
                const virtualGrades = transform(data.grading.values);

                return {
                    id: data.id,
                    name: data.name,
                    type: data.type,
                    grading: {
                        ...data.grading,
                        values: virtualGrades
                    },
                    statistics: calculateStatisticalValues(
                        virtualGrades
                            .map((grade) => grade.mark)
                    )
                }
            });
    },
    [ActionTypes.ASSESSMENT_COMPARE_CLEAR_VIRTUAL_VIEW]: () => {
        _virtualView = null;
    },
    [ActionTypes.ASSESSMENT_COMPARE_FETCH_COMMENTS_START]: () => {
        _fetchState = FetchState.Fetching;
    },
    [ActionTypes.ASSESSMENT_COMPARE_FETCH_COMMENTS_SUCCESS]: ({ data }) => {
        _comments = data;   

        for(const comment of data) {           
            for(const child of comment.children) {
                __childToParentComment[child.id] = comment.id;
            }
        }
    },
    [ActionTypes.ASSESSMENT_COMPARE_ADD_COMMENT]: ({ id, content, to }) => {
        if(!_comments) return;

        // data to insert to render
        // new comment
        let data = {
            id,
            content,
            author: currentUser.getCurrentUser(),
        }

        // if there is a comment we need to add it under
        if(to) {
            // find the index of the comment it needs to go under
            const idx = _comments.findIndex((data) => data.id === to || data.id === __childToParentComment[data.id]);

            __childToParentComment[id] = _comments[idx].id;

            // merge the comment's children with new data
            _comments[idx].children = [..._comments[idx].children, data]
            return
        }

        // add a new comment, with no children
        _comments.push({
            ...data,
            children: []
        });
    }
})

