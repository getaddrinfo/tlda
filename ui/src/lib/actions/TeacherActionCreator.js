import Dispatcher from "../store";
import { ActionTypes } from "../store/internals";
import { createFetchAction } from "../store/internals/Fetcher";
import http from "../http";

const TeacherActionCreator = {
    clearFilter() {
        Dispatcher.dispatch({
            type: ActionTypes.TEACHERS_CLEAR_FILTER
        })
    },
    applyFilter({ content }) {
        if(content === "") {
            this.clearFilter();
            return;
        }

        Dispatcher.dispatch({
            type: ActionTypes.TEACHERS_FILTER,
            filter: content
        })
    },
    fetch(page = null) {
        if(page) {
            return createFetchAction(
                () => http.get(`/users?page=${page}`),
                "TEACHERS"
            )
        }

        return createFetchAction(
            () => http.get("/users"),
            "TEACHERS"
        )
    },
}

export default TeacherActionCreator;