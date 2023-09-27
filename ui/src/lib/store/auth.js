import { Dispatcher, Store, ActionTypes } from "./internals";

let _isLoggedIn = false;
let _token = null;
let _expiresAt = null;
let __tickRef = null;

const TOKEN_KEY = "tlda.authToken"
const EXPIRES_AT = "tlda.sessionExpiresAt";

const isExpired = (expiresAt) => {
    if(!expiresAt) return true;
    if(Date.now() > expiresAt) return true;

    return false;
}

class AuthStore extends Store {
    initialize() {
        const token = localStorage.getItem(TOKEN_KEY);
        const expiresAt = localStorage.getItem(EXPIRES_AT);

        if(isExpired(expiresAt)) {
            this.logger.info("token expired")
            return
        }

        if(token) {
            this.logger.info("found cached token")
            _token = token;
            _isLoggedIn = true
            _expiresAt = parseInt(expiresAt)
        }
    }

    getLoggedIn() {
        return _isLoggedIn;
    }

    getExpiresAt() {
        return _expiresAt;
    }

    getToken() {
        if(!_isLoggedIn) {
            return null;
        }

        if(_token) {
            return _token;
        }

        _token = localStorage.getItem(TOKEN_KEY) || null;
        return _token;
    }
}


export default new AuthStore(Dispatcher, {
    [ActionTypes.AUTH_LOGIN]: ((action) => {
        _isLoggedIn = true;
        _token = action.token;
        _expiresAt = (new Date(action.expires)).getTime()

        // If the session is expired
        // Dispatch an AUTH_LOGOUT
        __tickRef = setInterval(() => {
            if(Date.now() > _expiresAt) {
                clearInterval(__tickRef);
                __tickRef = null;

                Dispatcher.dispatch({
                    type: ActionTypes.AUTH_LOGOUT
                });
            }
        }, 1000)

        // Try to set the token into localStorage,
        // or do nothing.
        try {
            localStorage.setItem(TOKEN_KEY, action.token);
            localStorage.setItem(EXPIRES_AT, _expiresAt)
        } catch {}
    }),
    [ActionTypes.AUTH_LOGOUT]: ((_) => {
        _isLoggedIn = false;
        _expiresAt = null;
        _token = null;

        if(__tickRef) {
            clearInterval(__tickRef)
            __tickRef = null;
        }

        // Try to remove the token from localStorage,
        // or do nothing.
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(EXPIRES_AT);
        } catch {}
    })
});
