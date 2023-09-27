import { Dispatcher, Store, ActionTypes } from "./internals";

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
let _assessments = {}
let _pagination = null;

// state that the store is currently in
let _fetchState = FetchState.Standby;


class AssessmentsStore extends Store {
    getAssessments() {
        return Object.values(_assessments)
    }

    getFetchState() {
        return _fetchState
    }

    getLocalStoredCount() {
        return this.getAssessments().length;
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



export default new AssessmentsStore(Dispatcher, {
    [ActionTypes.ASSESSMENTS_FETCH_START]: (_) => {
        _fetchState = FetchState.Fetching;
    },
    [ActionTypes.ASSESSMENTS_FETCH_SUCCESS]: ({ data }) => {
        _fetchState = FetchState.Standby;

        const { count, pages: { next, total } } = data.pagination;  

        _pagination = {
            nextPage: next,
            totalPages: total,
            count: count
        }

        for(const assessment of data.data) {
            _assessments[assessment.id] = assessment;
        }
    },
    [ActionTypes.ASSESSMENTS_FETCH_FAILURE]: (_) => {
        _fetchState = FetchState.Failure;
    },
});