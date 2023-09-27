import { Dispatcher } from ".";
import Logger from "../../logger";

/**
 * Builds the start, success and failure
 * keys based on the base provided
 * @param {string} base 
 * @returns 
 */
const getKeys = (base) => ({
    start: `${base}_FETCH_START`,
    success: `${base}_FETCH_SUCCESS`,
    failure: `${base}_FETCH_FAILURE`
})

/**
 * Builds a FETCH dispatch action
 * flow by taking a builder for a request
 * and a set of keys to dispatch
 * 
 * @param {() => axios.Response} httpRequestBuilder 
 * @param {(string | {
 *  start: string,
 *  success: string,
 *  failure: string
 * })} dispatchKeys 
 * @returns 
 */
export const createFetchAction = (
    httpRequestBuilder,
    dispatchKeys
) => {
    // produces the keys we need to use for dispatches
    const types = typeof dispatchKeys === "string" ? getKeys(dispatchKeys) : dispatchKeys;
    const logger = Logger.create(`FetchBuilder(${types.start.replace("_FETCH_START", "")})`);

    // start event
    Dispatcher.dispatch({ type: types.start });

    // runs the request
    return httpRequestBuilder()
        .then((res) => {
            // dispatch a success event
            Dispatcher.dispatch({
                type: types.success,
                data: res.data
            })
        })
        .catch((err) => {
            // log the error
            logger.error(err);

            // dispatch the error action
            Dispatcher.dispatch({ type: types.failure })
        })
}