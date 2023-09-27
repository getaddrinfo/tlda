import http from '../http';
import Dispatcher from '../store';
import { ActionTypes } from '../store/internals';
import { createFetchAction } from '../store/internals/Fetcher';

const LessonActionCreator = {
    async fetchLessons(page = null) {
        if(page) {
            return createFetchAction(
                () => http.get(`/lessons?page=${page}`),
                "LESSONS"
            );
        }

        return createFetchAction(
            () => http.get("/lessons"),
            "LESSONS"
        );
    },

    filter(content) {
        if(content === "") {
            Dispatcher.dispatch({
                type: ActionTypes.LESSONS_CLEAR_FILTER
            });
            
            return;
        }

        Dispatcher.dispatch({
            type: ActionTypes.LESSONS_CLEAR_FILTER
        })
    },
}

export default LessonActionCreator;