import React, { useEffect } from "react";
import http from "../../lib/http";
import logger from "../../lib/logger";
import { ActionTypes, Dispatcher, useStore } from "../../lib/store/internals";

import WatchRequestStore from "../../lib/store/requests"
import styles from './Requests.module.scss';

import { Request } from "../../components/requests";

export const Requests = () => {
    const requests = useStore(WatchRequestStore, (store) => store.getRequests(), {
        skip: true
    });

    useEffect(() => {
        Dispatcher.dispatch({ type: ActionTypes.WATCH_REQUEST_FETCH_START });

        http.get("/users/@me/requests")
            .then((res) => {
                Dispatcher.dispatch({
                    type: ActionTypes.WATCH_REQUEST_FETCH_SUCCESS,
                    data: res.data
                });
            })
            .catch((err) => {
                logger.error(err);
                Dispatcher.dispatch({ type: ActionTypes.WATCH_REQUEST_FETCH_FAILURE });
            })
    }, []);

    return (
        <div className={styles.requests}>
            {requests.map((request) => <Request key={request.id} {...request} />)}
        </div>
    )
}

export default Requests;