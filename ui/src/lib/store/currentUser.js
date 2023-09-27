import { Dispatcher, Store, ActionTypes } from "./internals";
import AuthStore from "./auth";

/*
This store manages most of the state about
the currently logged in user.

It depends on the AuthStore to ensure that
we can tell if the user is logged in or not.

AuthStore is updated first. When we post our
email and password, and get a valid token back,
the store is able to manage that. We then call
to get the current user, and then update this
store, hence the delimitation between the two.
*/

const FetchState = {
    Fetching: "FETCHING",
    Success: "SUCCESS",
    Failure: "FAILURE",
    Standby: "STANDBY"
}

// user
let _user = null;
let _departments = null;

let _stats = {};


let _fetchState = FetchState.Standby;

class CurrentUserStore extends Store {
    initialize() {
        // Make sure the auth store is updated before
        // this store is handled.
        if(!this.hasDependency(AuthStore)) {
            this.addDependency(AuthStore)
        }
    }

    getCurrentUser() {
        // if the user is not logged in
        // return null.
        if(!AuthStore.getLoggedIn()) {
            return null
        }

        // This is a quick way of cloning and returning
        // data that is not a reference. If we returned a
        // reference, then we may risk the caller updating
        // data that we do not want them to update.
        return JSON.parse(JSON.stringify(_user));
    }

    isSlt() {
        if(!AuthStore.getLoggedIn() || !_user?.role) {
            return false;
        }

        return ["slt", "admin"].includes(_user.role.toLowerCase());
    }

    getDepartments() {
        // If the user is not logged in
        // return null.
        if(!AuthStore.getLoggedIn()) {
            return null
        }

        // ditto
        return JSON.parse(JSON.stringify(_departments));
    }

    getStats() {
        if(!_stats || !AuthStore.getLoggedIn()) return null;
        return JSON.parse(JSON.stringify(_stats))
    }

    getFetchState() {
        return _fetchState;
    }
}

export default new CurrentUserStore(Dispatcher, {
    [ActionTypes.USER_UPDATE]: ((action) => {
        _user.id = action.id;
        _user.email = action.email;
        _user.name = action.name;
        _user.preferredName = action.preferredName;
        _user.role = action.role;
        _departments = action.departments;

        if(action.stats) {
            _stats = action.stats;
        }
    }),
    [ActionTypes.USER_FETCH_START]: ((_) => {
        _fetchState = FetchState.Fetching;
    }),
    [ActionTypes.USER_FETCH_SUCCESS]: ((action) => {
        _fetchState = FetchState.Success;

        _user = {};

        _user.id = action.id;
        _user.email = action.email;
        _user.name = action.name;
        _user.preferredName = action.preferred_name;
        _user.role = action.role;
        _departments = action.departments;

        if(action.stats) {
            _stats = action.stats
        }
    }),
    [ActionTypes.USER_FETCH_FAILURE]: ((_) => {
        _fetchState = FetchState.Failure
    })
})