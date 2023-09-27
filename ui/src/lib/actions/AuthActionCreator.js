import http from '../http';
import Dispatcher from '../store';
import Logger from '../logger';

import { ActionTypes } from '../store/internals';
import AuthStore from '../store/auth';

export const ExpireAfterOptions = {
    HOUR: 3600,
    DAY: 86400,
    WEEK: 86400 * 7
}

const _badAccontCodeSet = new Set([1001, 401]);
const logger = Logger.create("AuthActionCreator");

const AuthActionCreator = {
    login(email, password, expiresAfter = ExpireAfterOptions.DAY) {
        return new Promise((resolve, reject) => {
            http.post("/auth/login", {
                email,
                password,
                expires_after: expiresAfter
            })
                // success
                .then((res) => {
                    // Update stores with the relavant 
                    // data.
                    Dispatcher.dispatch({
                        type: ActionTypes.AUTH_LOGIN,
                        ...res.data
                    })

                    resolve();
                })
                // error
                .catch((err) => {
                    const res = err.response;

                    // if there wasn't even a response,
                    // something has gone horribly wrong.
                    // log it and reject with unknown error occurred.
                    if (!res) {
                        logger.error(err);
                        reject("Unknown Error occurred");
                        return
                    }

                    const isWrongDetails = _badAccontCodeSet.has(res.data?.code || res.status);

                    // if the code is not one relating to invalid
                    // details, log and reject.
                    if (!isWrongDetails) {
                        logger.error(err);
                        reject("Unknown Error occurred");
                        return
                    }

                    // now must be invalid email/password
                    reject("Invalid Email or Password");
                })
        });
    },

    async logout() {
        // If there is no token, do not
        // try and hit the route.
        const token = AuthStore.getToken();
        if(!token) return;

        return await http.delete("/auth/session");
    }
}

export default AuthActionCreator;