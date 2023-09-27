/**
 * 
 * @param {{
 *  key: string,
 *  handle: (value: any) => string | undefined,
 *  required?: boolean
 * }[]} rules 
 * @returns 
 */
export const validate = (
    rules
) => {
    return ((values) => {
        const errors = {};

        // filter all the required rules
        // then map rule -> key

        // then reduce it to a set
        // of keys that aren't in values
        // but should be

        const missing = rules
            .filter((rule) => rule.required)
            .map((rule) => rule.key)   
            .reduce((missing, key) => {
                if(!values.hasOwnProperty(key)) {
                    missing.add(key);
                }                

                return missing;
            }, new Set([]));
 
        // init the setting
        for(const key of missing) {
            errors[key] = ["Required"];
        }

        const runnable = rules.filter((rule) => values.hasOwnProperty(rule.key));

        for(const rule of runnable) {
            let output;

            switch(rule.handle.length) {
                // function only expects
                // the value itself as argument
                // to validate
                case 1:
                    output = rule.handle(values[rule.key]);
                    break;
                
                // function expects both the
                // value and all other values
                // to validate
                case 2:
                    output = rule.handle(values[rule.key], values);
                    break;

                default:
                    throw new Error(`unknown case: rule#handle (rule=${rule.key}): arg length = ${rule.handle.length}`);
            }

            if(!output) continue;
            if(!errors[rule.key]) errors[rule.key] = [];

            errors[rule.key].push(output);
        };

        return errors;
    })
}


export const minStrLen = (minLen) => {
    return ((value) => {
        if(value.length < minLen) {
            return `Must be at least ${minLen} characters`
        }
    })
};

export const maxStrLen = (maxLen) => {
    return ((value) => {
        if(value.length > maxLen) {
            return `Must be at most ${maxLen} characters`
        }
    })
}

export const mustBeOneOf = (options) => {
    return ((value) => {
        if(!options.includes(value)) {
            return `Must be one of ${options.join(", ")}`
        }
    })
}

export const mustMatch = (regex, message) => {
    return ((value) => {
        if(!regex.test(value)) {
            return message;
        }
    });
}

export const arrayMustBeSorted = () => {
    return ((value) => {
        const copy = [...value].sort((a, b) => b - a); // sort in ascending order
        for(const elem of copy) {
            if(value.findIndex((value) => value === elem) !== copy.findIndex((value) => value === elem)) {
                return "Not in descending order"
            }
        }
    })
}

export const arrayAllValuesMustBeUnique = () => {
    return ((value) => {
        const set = new Set([...value])

        if(set.size !== value.length) {
            return "All values must be unique"
        }
    })
}

export const arrayValueCannotExceedMaximum = (key) => {
    return ((value, values) => {
        const max = values[key];

        if(value.some((value) => value > max)) {
            return `Value cannot exceed max (${max})`
        }
    })
}

export const integerMinValue = (min) => {
    return ((value) => {
        if(value < min) {
            return `Value must be greater than min (${min})`;
        }
    })
}

export const arrayAll = (fn, message) => {
    return ((value) => {
        if(!value.every(fn)) {
            return message;
        }
    })
}