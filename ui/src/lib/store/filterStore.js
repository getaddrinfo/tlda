import levenshtein from "js-levenshtein";
import { createParser } from "../search/lexer";
import { Dispatcher, Store, ActionTypes } from "./internals";

/*
This store manages the state of searching for a lesson.
*/

let _filters = [];
let _built = null;
let _rules = [
    {
        type: 'integer',
        target: 'mark',
        description: "The mark the student got"
    }, {
        type: 'string',
        target: 'student.name',
        description: "The name of the student"
    },{
        type: 'string',
        target: 'marker.name',
        description: "The name of the marker"
    }, {
        type: 'enum',
        target: 'student.gender',
        members: ['male', 'female', 'other'],
        description: "The gender of the student"
    }
];
let _instance = createParser(_rules);

/*
l (left) = value from element
r (right) = value provide by user
*/
const ops = {
    integer: {
        "gt": (l, r) => l > r,
        "lt": (l, r) => l < r,
        "eq": (l, r) => l === r,
        "gte": (l, r) => l >= r,
        "lte": (l, r) => l <= r
    },
    string: {
        "eq": (l, r) => l === r,
        "like": (l, r) => levenshtein(l, r) < 5
    },
    enum: {
        "eq": (l, r) => l === r,
        "member": (l, r) => r.includes(l)
    }
}

/** Returns an (almost) guaranteed unique value */
const uniqueRuleKey = () => {
    return Math.random().toString(36) + Date.now().toString()
}


/**
 * Builds a filter that sequentially runs
 * all the filters the user specified
 * @returns {(value: any) => boolean}
 */
const buildFilters = () => {
    const fns = [];
    for(const filter of _filters.filter((f) => f.state === "parsed")) {        
        const { type, op, target } = filter;

        const fn = ((source) => ops[type.type][op](
            getProperty(target, source),
            filter.value
        ));

        fns.push(fn);
    }

    const out = ((original) => {
        for(const fn of fns) {
            original = original.filter(fn);
        }

        return original;
    });
    
    out._uniqueRuleKey = uniqueRuleKey();

    return out;
}


const REGEX_SIMPLE_KEY = /(\w+)\.?(\w+)?/;

/**
 * Gets a value from an object using
 * a key that is not known
 * @param {string} target 
 * @param {any} data 
 * @returns 
 */
const getProperty = (target, data) => {
    const [, a, b] = REGEX_SIMPLE_KEY.exec(target);

    if (a && !b && data.hasOwnProperty(a)) return data[a];
    else if (a && b && data.hasOwnProperty(a) && data[a].hasOwnProperty(b)) return data[a][b];
    
    return null;
}

class FilterAssessmentStore extends Store {
    getRawFilters() {
        return _filters;
    }

    getFilterFunction() {
        return _built ?? null;
    }

    getInstance() {
        return _instance;
    }

    equal(a, b) {
        if(a === null || b === null) return false;
        return a._uniqueRuleKey === b._uniqueRuleKey;
    }

    getFilterableKeys() {
        return _rules.map((rule) => {
            const d = {
                key: rule.target,
                description: rule.description,
                type: rule.type
            };

            if(rule.type === "enum") {
                d.values = rule.members;
            }

            return d;
        });
    }
}

export default new FilterAssessmentStore(Dispatcher, {
    [ActionTypes.FILTER_ASSESSMENT_CHANGE]: ({ filter }) => {
        if(filter === null) return;
        _filters = _instance(filter);
        _built = buildFilters();
    }
})
