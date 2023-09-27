export const CONTROL_CHARS = {
    DELIMINATE_FIELD: ":",

    // ordering is important here
    // it determines in which order
    // the tokens are parsed
    // must be shortest -> largest
    OPERATIONS: {
        "gt": ">",
        "lt": "<",
        "eq": "=",
        "like": "~",
        "gte": ">=",
        "lte": "<=",
    },
    OPERATIONS_FOR_TYPE: {
        integer: { 
            "gt": ">",
            "lt": "<",
            "eq": "=",
            "gte": ">=",
            "lte": "<=", 
        },
        string: {
            "eq": "=",
            "like": "~"
        },
        enum: {
            "eq": "=",
            "member": "@"
        }
    }
}

export const MAX_OP_LEN = Object.values(CONTROL_CHARS.OPERATIONS)
    .reduce((acc, val) => {
        if(val.length > acc) {
            return val.length;
        }

        return acc;
    }, 0)