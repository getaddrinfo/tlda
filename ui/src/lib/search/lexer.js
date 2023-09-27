import Filter from "./tokenize";
import { CONTROL_CHARS } from "./common";

/**
 * Creates a parser for filters based on the rules provided.
 * Returns a function that can be called to produce a list of
 * Filters.
 * 
 * @param {({
 *  type: "integer",
 * } | {
 *  type: "string",
 * } | {
 *  type: "enum",
 *  members: string[]
 * } & { allowNull?: boolean, target: string })[]} fields 
 * @returns {(raw: string) => Filter[]}
 */
export const createParser = (fields) => {
    return ((raw) => {
        const split = raw.split(" ");
        const filters = [];
        const fieldsAsMap = fields
            .reduce((acc, field) => ({ ...acc, [field.target]: field }), {});


        for(const raw of split) {
            const res = raw.split(CONTROL_CHARS.DELIMINATE_FIELD);

            // no argument found, continue
            if(res.length !== 2) {
                const filter = new Filter(raw);   
                filter.setUnknown();
                res.push(filter);
                continue;
            }

            let [target, query] = res;
            const filter = new Filter(target);

            // no command associated with this
            if(!fieldsAsMap[target]) {
                filter.setUnknown();
                filters.push(filter);
                continue;
            };

            try {
                query = decodeURIComponent(query)
            } catch {}

            filter.run(query, fieldsAsMap[target]);
            filters.push(filter);
        }

        return filters;
    })
}