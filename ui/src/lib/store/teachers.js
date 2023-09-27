import { Dispatcher, Store, ActionTypes } from "./internals";
import lvDistance from 'js-levenshtein';

/*
This store manages the current state of all of the
Teachers in the Teachers view.
*/

const FetchState = {
    Fetching: "FETCHING",
    Success: "SUCCESS",
    Failure: "FAILURE",
    Standby: "STANDBY"
}
// the events
let _teachers = {};
let _pagination = null;
let _filter = null;

let _fetchState = FetchState.Standby;

const filteredWithDistance = () => {
    const out = [];

    // For every value of our teachers (get a list of
    // teachers to iterate over)
    for(const value of Object.values(_teachers)) {
        // distance from the filter to the teacher's prefferedName, 
        // or if not set, full name.
        const distance = lvDistance(_filter, value.preferredName ?? value.name);

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
        .map(({ value }) => value)
        .slice(0, 10);
}

class TeacherStore extends Store {
    getTeachers() {
       return _filter ? filteredWithDistance() : Object.values(_teachers); 
    }

    getFetchState() {
        return _fetchState
    }

    getLocalCount() {
        return this.getTeachers().length;
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



export default new TeacherStore(Dispatcher, {
    [ActionTypes.TEACHERS_FETCH_START]: (_) => {
        _fetchState = FetchState.Fetching;
    },
    [ActionTypes.TEACHERS_FETCH_SUCCESS]: ({ data }) => {
        _fetchState = FetchState.Success;

        const { count, pages: { next, total }} = data.pagination;

        _pagination = {
            nextPage: next,
            totalPages: total,
            count: count
        }

        for(const teacher of data.data) {
            _teachers[teacher.id] = teacher
        }
    },
    [ActionTypes.TEACHERS_FETCH_FAILURE]: (_) => {
        _fetchState = FetchState.Failure;
    },
    [ActionTypes.TEACHERS_FILTER]: ({ filter }) => {
        _filter = filter;
    },
    [ActionTypes.TEACHERS_CLEAR_FILTER]: (_) => {
        _filter = null;
    }
})

