import { Dispatcher, Store, ActionTypes } from "./internals";

/*
This store manages the current state of all of the
Upcoming Events we have for the current user.
*/

const FetchState = {
    Fetching: "FETCHING",
    Success: "SUCCESS",
    Failure: "FAILURE",
    Standby: "STANDBY"
}

const EventFlags = {
    Ackowledged: 1 << 0,
    Notify: 1 << 1
}

// the events
let _events = {};
let _fetchState = FetchState.Standby;

class UpcomingWatchEventStore extends Store {
    getEvents() {
       return Object.values(_events); 
    }

    getFetchState() {
        return _fetchState
    }

    getCount() {
        return this.getEvents().length;
    }
}



export default new UpcomingWatchEventStore(Dispatcher, {
    [ActionTypes.UPCOMING_EVENT_FETCH_START]: (_) => {
        _fetchState = FetchState.Fetching;
    },
    [ActionTypes.UPCOMING_EVENT_FETCH_SUCCESS]: (action) => {
        _fetchState = FetchState.Success;
        // reset current events state
        _events = {};

        for(const event of action.data) {
            _events[event.id] = event;
            _events[event.id].notification_scheduled = (event.flags & EventFlags.Notify) != 0;
            _events[event.id].acknowledged = (event.flags & EventFlags.Ackowledged) != 0;
        }
    },
    [ActionTypes.UPCOMING_EVENT_FETCH_FAILURE]: (_) => {
        _fetchState = FetchState.Failure;
    },

    [ActionTypes.UPCOMING_EVENT_NOTIFY_TOGGLE]: ({ id }) => {
        if(!_events[id]) return;

        const { notification_scheduled, flags } = _events[id];
        _events[id].notification_scheduled = !notification_scheduled;
        _events[id].flags = notification_scheduled ? flags & ~EventFlags.Notify : flags | EventFlags.Notify
    }
})

