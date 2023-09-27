import { Dispatcher, Store, ActionTypes } from "./internals";

/*
This store manages the current state of all of the
Requests to watch lessons from other teachers.
*/

const FetchState = {
    Fetching: "FETCHING",
    Success: "SUCCESS",
    Failure: "FAILURE",
    Standby: "STANDBY"
}

// the events
let _requests = {};
let _fetchState = FetchState.Standby;

class WatchRequestStore extends Store {
    getRequests() {
       return Object.values(_requests); 
    }

    getFetchState() {
        return _fetchState
    }

    getCount() {
        return this.getEvents().length;
    }
}


export default new WatchRequestStore(Dispatcher, {
    [ActionTypes.WATCH_REQUEST_FETCH_START]: (_) => {
        _fetchState = FetchState.Fetching;
    },
    [ActionTypes.WATCH_REQUEST_FETCH_SUCCESS]: ({ data }) => {
        _fetchState = FetchState.Success;
        // reset current events state
        _requests = {};

        for(const request of data.data) {
            _requests[request.id] = request;
        }
    },
    [ActionTypes.WATCH_REQUEST_FETCH_FAILURE]: (_) => {
        _fetchState = FetchState.Failure;
    },
    [ActionTypes.WATCH_REQUEST_REMOVE]: ({ id }) => {
        delete _requests[id];
    }
})

