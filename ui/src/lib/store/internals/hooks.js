import {
    useEffect, useReducer, useMemo
} from 'react';

// from https://stackoverflow.com/questions/25456013/javascript-deepequal-comparison

const isDeepEqual = (x, y) => {
    // If either x or y is not an object, then they are deeply equal iff they
    // are the same value. For our purposes, objects exclude functions,
    // primitive values, null, and undefined.
    if (typeof x !== "object" || x === null ||
        typeof y !== "object" || y === null) {
        // We use Object.is() to check for same-value equality. To check for
        // strict equality, we would use x === y instead.
        return x === y;
    }

    // Shortcut, in case x and y are the same object. Every object is
    // deeply equal to itself.
    if (x === y)
        return true;

    // Obtain the own, enumerable, string-keyed properties of x. We ignore
    // properties defined along x's prototype chain, non-enumerable properties,
    // and properties whose keys are symbols.
    const keys = Object.keys(x);
    // If x and y have a different number of properties, then they are not
    // deeply equal.
    if (Object.keys(y).length !== keys.length)
        return false;

    // For each own, enumerable, string property key of x:
    for (const key of keys) {
        // If key is not also an own enumerable property of y, or if x[key] and
        // y[key] are not themselves deeply equal, then x and y are not deeply
        // equal. Note that we don't just call y.propertyIsEnumerable(),
        // because y might not have such a method (for example, if it was
        // created using Object.create(null)), or it might not be the same
        // method that exists on Object.prototype.
        if (!Object.prototype.propertyIsEnumerable.call(y, key) ||
            !isDeepEqual(x[key], y[key])) {
            return false;
        }
    }

    // x and y have the same properties, and all of those properties are deeply
    // equal, so x and y are deeply equal.
    return true;
}


/**
 * Based heavily upon https://github.com/Fieldscope/flux-hooks/blob/master/index.js
 * Replaced lodash dependency on a local function above
 * 
 * @template T
 * @template U
 * @param {T extends import("./Store").Store} store 
 * @param {(store: T) => U} reducer 
 * @param {{ skip: boolean, deps: any[] }} opts
 * @returns {U} 
 */
const useStore = (store, reducer, opts = {}) => {
    const deps = opts.deps || [];
    const skip = opts.skip || false;

    // A utility method to allow calls to be DRY instead of WET.
    const runReducer = (prev) => {
        return reducer.length === 2 ? reducer(prev, store) : reducer(store)
    };

    // A wrapper around the supplied reducer to do deepEqual checks
    // to ensure we only update the value if necessary.
    const withEqualityCheck = (prevState, _store) => {
        const refreshed = runReducer(prevState);
        const equal = isDeepEqual(refreshed, prevState);

        // if equal, return the previous state
        // and cause no update.
        if(equal) return prevState;
        
        // otherwise, return new value
        return refreshed;
    }

    const withoutEqualityCheck = (prevState, _store) => {
        return runReducer(prevState);
    }

    // reducer to support reactivity
    const [out, _dispatch] = useReducer(
        skip ? withoutEqualityCheck : withEqualityCheck, // reducer (wrapped) if skip = false else reducer (raw)
        runReducer(null) // initial state
    );



    // dispatch a change when our dependencies change
    useMemo(() => _dispatch(store), deps);

    // run this code when the hook is initially registered.
    useEffect(() => {
        // whenever the store changes, dispatch a change.
        const listener = () => {
            _dispatch(store) 
        };

        // attach listener, and dispatch in case the store has changed.
        store.addListener(listener);
        _dispatch(store);

        // cleanup fn
        return () => store.removeListener(listener)
    }, [])

    return out;
}

export default useStore;

