import Dispatcher from '../store';
import { ActionTypes } from '../store/internals';
import http from '../http';
import Logger from '../logger';
import { createFetchAction } from '../store/internals/Fetcher';

const logger = Logger.create("RequestsActionCreator");

const RequestsActionCreator = {
    async fetchRequests() {
        return createFetchAction(
            () => http.get("/users/@me/requests"),
            "WATCH_REQUEST"
        )
    },
    async deleteRequest(requestId) {
        http.delete("/users/@me/requests/" + requestId)
            .then((_) => {
                Dispatcher.dispatch({
                    type: ActionTypes.WATCH_REQUEST_REMOVE,
                    id: requestId
                });
            })
            .catch((res) => {
                logger.error(res);
            });
    },
    async acceptRequest(requestId, {
        location
    }) {
        http.post("/users/@me/requests/" + requestId, { location: location })
            .then((_) => {
                Dispatcher.dispatch({
                    type: ActionTypes.WATCH_REQUEST_REMOVE,
                    id: requestId
                })
            })
            .catch((err) => {
                logger.error(err)
            })
    }
}

export default RequestsActionCreator;