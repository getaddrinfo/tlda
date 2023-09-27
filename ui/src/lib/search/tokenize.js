import { CONTROL_CHARS, MAX_OP_LEN } from "./common";

const REGEX_MATCH_CHILDREN = /([\w+]+)/gm;
const handlers = {
    "integer": ({ value }) => {
        const val = parseInt(value);
        if(isNaN(val)) throw new Error("value is not a valid number: " + value);
        return val;
    },
    "string": ({ value }) => value,
    "enum": ({ value, rule, opcode }) => {
        let matches = value.match(REGEX_MATCH_CHILDREN);
        if(matches === null || matches.length === 0) {
            // handle
            return null;
        }

        if(matches.length !== 1 && opcode === "eq") {
            throw new Error("value matched more than one:  " + value)
        }

        matches = new Set(matches);
        for(const match of matches) {
            // raise an error
            // if one of the values is not 
            // a member of the allowed enum values
            if(!rule.members.includes(match)) {
                throw new Error("invalid enum value " + match + ", expected one of " + rule.members.join(", "))
            }
        }

        switch(opcode) {
            case "eq":
                return [...matches][0]
            case "member":
                return [...matches]
            default:
                throw new Error("unknown op " + opcode);
        }
    }
}

/**
 * Represents a filter that may or may not be properly parsed,
 * which can be identified based on the state value
 */
class Filter {
    constructor(target) {
        this.state = "init";
        this.target = target;

    }

    run(
        query,
        type
    ) {       
        try {
            const [op, value] = Filter.parse(query, type);

            this.op = op;
            this.value = value;
            this.type = type;
            this.state = "parsed";
        } catch(ex) {
            this.error = ex;
            console.error(ex);
            this.state = "invalid";
        }
    }

    /**
     * Parses a raw string into a value that can be used
     * to construct the rest of a filter.
     * 
     * It is important that OPERATIONS_FOR_TYPE is sorted from smallest to 
     * largest in length, or it may cause issues parsing.
     * 
     * @param {string} query 
     * @param {any} filter
     */
    static parse(
        query,
        filter
    ) {
        let opcode = null;
        let symbol = null;
        let sub = query.substring(0, MAX_OP_LEN);

        const { type, ...rule } = filter;


        for(const [name, op] of Object.entries(CONTROL_CHARS.OPERATIONS_FOR_TYPE[type])) {
            if(sub.indexOf(op) !== -1) {
                opcode = name;
                symbol = op;
            }
        }

        if(!rule.allowNull && opcode === null) {
            throw new Error("failed to parse " + query);
        }

        const value = query.substring(symbol.length);
        const out = handlers[type]({
            value,
            rule,
            opcode
        });
        
        return [
            opcode,
            out
        ];
    }

    /**
     * Sets the state when the key is unknown
     */
    setUnknown() {
        this.state = "forbidden";
    }
}

export default Filter;