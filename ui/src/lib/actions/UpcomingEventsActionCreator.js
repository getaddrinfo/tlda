import http from '../http';
import Dispatcher from '../store';
import Logger from '../logger';

import { ActionTypes } from '../store/internals';
const logger = Logger.create("WatchActionCreator");

const WatchActionCreator = {
    async fetchUpcomingWatchEvents() {
        Dispatcher.dispatch({
            type: ActionTypes.UPCOMING_EVENT_FETCH_START
        });

        try {
            const res = await http.get("/upcoming-events");

            Dispatcher.dispatch({
                type: ActionTypes.UPCOMING_EVENT_FETCH_SUCCESS,
                data: res.data
            })
        } catch(err) {
            logger.error(err);

            Dispatcher.dispatch({
                type: ActionTypes.UPCOMING_EVENT_FETCH_FAILURE
            });
        }
    },
    async toggleNotify({
        eventId,
        isScheduled
    }) {
        const method = isScheduled ? "delete" : "post";
        
        return http[method](`/upcoming-events/${eventId}/notify`)
            .then((_) => {
                Dispatcher.dispatch({
                    type: ActionTypes.UPCOMING_EVENT_NOTIFY_TOGGLE,
                    id: eventId
                });
            })
            .catch((err) => {
                logger.error(err);
            })
    }
}

export default WatchActionCreator;