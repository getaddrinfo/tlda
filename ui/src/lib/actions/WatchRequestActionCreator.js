import http from "../http"
import Dispatcher from "../store"
import { ActionTypes } from "../store/internals"
import { createFetchAction } from "../store/internals/Fetcher"

import LessonSearchStore from "../store/lessonSearch";

const WATCH_TO_TYPE = {
    "teachingMethods": 0,
    "behaviourControl": 1,
    "other": 2
}

const payloadForType = (type, data) => {
    const date = (new Date(data.date))
        .toISOString();
    
    switch(type) {
        case "watch": {
            return {
                date: date,
                meta: data.metaText,
                type: "watch",
                length: parseInt(data.len) * 60,
                reason: {
                    type: WATCH_TO_TYPE[data.reason],
                    data: data.reasonOtherText || null
                }
            }
        }

        case "progress":
        case "performance": {
            return {
                date: date,
                type: type,
                meta: data.metaText,
                class_id: data.classId
            }
        }

        default:
            return null;
    }
}

const WatchRequestActionCreator = {
    async fetch(id) {
        return createFetchAction(
            () => http.get(`/users/${id}/profile`),
            "USER_PROFILE"
        );
    },
    async submit(userId, {
        idx,
        type,
        classId,
        reason,
        reasonOtherText,
        metaText,
        date,
        len
    }) {
        const p = payloadForType(idx === "watch" ? "watch" : type, {
            idx,
            type,
            classId,
            reason,
            reasonOtherText,
            metaText,
            date,
            len
        });

        return http.post(`/users/${userId}/watch`, p)
    },

    search(filter) {
        Dispatcher.dispatch({
            type: ActionTypes.LESSON_SEARCH_FILTER_CHANGE,
            filter,
            // callback that is ran by the store
            // after the debounce timeout has occurred.
            // fetches the next set of teachers, and dispatches the result.
            callback: (() => {
                http.get(`/lessons/search?q=${LessonSearchStore.getSearchTerm()}`)
                    .then((res) => {
                        Dispatcher.dispatch({
                            type: ActionTypes.LESSON_SEARCH_RESULT,
                            data: res.data
                        });
                    })
            })
        }) 
    }
}

export default WatchRequestActionCreator;