import http from '../http';
import Dispatcher from '../store';
import Logger from '../logger';

import { ActionTypes } from '../store/internals';
import AuthStore from '../store/auth';

const logger = Logger.create("UserActionCreator");

const UserActionCreator = {
    async fetchCurrentUser() {
        if(!AuthStore.getLoggedIn()) return;

        // tell the stores we are fetching
        // the current user
        Dispatcher.dispatch({
            type: ActionTypes.USER_FETCH_START
        })

        try {
            const res = await http.get("/users/@me");

            // dispatch with new data
            Dispatcher.dispatch({
                type: ActionTypes.USER_FETCH_SUCCESS,
                ...res.data
            });
        } catch(err) {
            // log the error
            logger.error(err);

            // dispatch a failure
            Dispatcher.dispatch({
                type: ActionTypes.USER_FETCH_FAILURE
            })
        }
    }
}

export default UserActionCreator;