import { Dispatcher, Store, ActionTypes } from "./internals";

/*
This store manages the state of user profiles
that we currently have.
*/

const FetchState = {
    Fetching: "FETCHING",
    Success: "SUCCESS",
    Failure: "FAILURE",
    Standby: "STANDBY"
}

let _profiles = {};
let _fetchState = FetchState.Standby;

class UserProfileStore extends Store {
    getProfiles() {
        return Object.entries(_profiles);
    }

    getProfile(id) {
        if(!_profiles[id]) return null;

        return JSON.parse(JSON.stringify(_profiles[id]));
    }

    getFetchState() {
        return _fetchState;
    }
}

export default new UserProfileStore(Dispatcher, {
    [ActionTypes.USER_PROFILE_FETCH_START]: (_) => {
        _fetchState = FetchState.Fetching;
    },
    [ActionTypes.USER_PROFILE_FETCH_SUCCESS]: ({ data }) => {
        _fetchState = FetchState.Success;
        _profiles[data.id] = data;
    },
    [ActionTypes.USER_PROFILE_FETCH_FAILURE]: (_) => {
        _fetchState = FetchState.Failure;
    }
})


