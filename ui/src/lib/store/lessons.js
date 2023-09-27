import { Dispatcher, Store, ActionTypes } from "./internals";
import lvDistance from 'js-levenshtein';

/*
This store manages the current state of all of the
Lessons we have fetched for the current user.

It also includes some pagination info and a fetch state.
*/

const FetchState = {
    Fetching: "FETCHING",
    Success: "SUCCESS",
    Failure: "FAILURE",
    Standby: "STANDBY"
}

// lessons data + pagination data
let _lessons = {}
let _pagination = null;
let _filter = null;

// state that the store is currently in
let _fetchState = FetchState.Standby;


const filteredWithDistance = () => {
    const out = [];

    // For every value of our lessons (get a list of
    // lessons to iterate over)
    for(const value of Object.values(_lessons)) {
        // distance from the filter to the class code
        const distance = lvDistance(_filter, value.code);

        // add it to out
        out.push({
            distance,
            value
        });
    }

    // sort by distance,
    // then map to raw value.
    return out
        .sort((a, b) => a.distance - b.distance)
        .map(({ value }) => value);
}


class LessonsStore extends Store {
    getLessons() {
        if(!_filter) {
            return Object.values(_lessons);
        }

        return filteredWithDistance();
    }

    getFetchState() {
        return _fetchState
    }

    getLocalStoredCount() {
        return this.getLessons().length;
    }

    getNextPage() {
        return _pagination?.nextPage ?? null;
    }
    
    getTotalPages() {
        return _pagination?.totalPages ?? null;
    }

    getCount() {
        return _pagination?.count ?? null;
    }
}



export default new LessonsStore(Dispatcher, {
    [ActionTypes.LESSONS_FETCH_START]: (_) => {
        _fetchState = FetchState.Fetching;
    },
    [ActionTypes.LESSONS_FETCH_SUCCESS]: ({ data }) => {
        _fetchState = FetchState.Standby;

        const { count, pages: { next, total } } = data.pagination;  

        _pagination = {
            nextPage: next,
            totalPages: total,
            count: count
        }

        for(const lesson of data.data) {
            _lessons[lesson.id] = lesson;
        }
    },
    [ActionTypes.LESSONS_FETCH_FAILURE]: (_) => {
        _fetchState = FetchState.Failure;
    },

    [ActionTypes.LESSONS_FILTER]: ({ filter }) => {
        _filter = filter;
    },

    [ActionTypes.LESSONS_CLEAR_FILTER]: (_) => {
        _filter = null;
    }
});