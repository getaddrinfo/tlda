import http from '../http';
import Dispatcher from '../store';
import { ActionTypes } from '../store/internals';
import { createFetchAction } from '../store/internals/Fetcher';

import AssessmentScoreStore from '../store/assessmentScore';
import TeacherSearchStore from '../store/teacherSearch';


const AssessmentScoreActionCreator = {
    async fetchAssessment(id) {
        if(AssessmentScoreStore.alreadyFetched(id)) return;

        return createFetchAction(
            () => http.get(`/assessments/${id}`),
            "ASSESSMENT_SCORE"
        )
    },

    dismissWarning() {
        Dispatcher.dispatch({ type: ActionTypes.ASSESSMENT_SCORE_DISMISS_WARNING });
    },

    clearScore(studentId) {
        Dispatcher.dispatch({
            type: ActionTypes.ASSESSMENT_SCORE_CLEAR_STUDENT_SCORE,
            id: studentId
        });
    },
    
    setScore({ 
        studentId,
        score
    }) {
        Dispatcher.dispatch({
            type: ActionTypes.ASSESSMENT_SCORE_SET_STUDENT_SCORE,
            id: studentId,
            score: score
        });
    },
    openTeacherDropdown(id) {
        Dispatcher.dispatch({
            type: ActionTypes.ASSESSMENT_SCORE_OPEN_TEACHER_DROPDOWN,
            id: id
        });
    },

    openFlagDropdown(id) {
        Dispatcher.dispatch({
            type: ActionTypes.ASSESSMENT_SCORE_OPEN_FLAG_DROPDOWN,
            id: id
        })
    },

    addFlag({ id, flag }) {
        Dispatcher.dispatch({
            type: ActionTypes.ASSESSMENT_SCORE_ADD_STUDENT_SCORE_FLAG,
            id: id,
            flag: flag
        })
    },

    removeFlag({ id, flag }) {
        Dispatcher.dispatch({
            type: ActionTypes.ASSESSMENT_SCORE_REMOVE_STUDENT_SCORE_FLAG,
            flag,
            id,
        });
    },

    setMarker({
        all = false,
        studentId,
        markerId
    }) {
        Dispatcher.dispatch({
            type: ActionTypes[
                all 
                ? "ASSESSMENT_SCORE_SET_MARKER_ALL"
                : "ASSESSMENT_SCORE_SET_MARKER"
            ],
            studentId,
            markerId
        });
    },
    
    changeTeacherSearchFilter({
        filter
    }) {
        Dispatcher.dispatch({
            type: ActionTypes.TEACHER_SEARCH_FILTER_CHANGE,
            filter,
            // callback that is ran by the store
            // after the debounce timeout has occurred.
            // fetches the next set of teachers, and dispatches the result.
            callback: (() => {
                http.get(`/users/search?q=${TeacherSearchStore.getSearchTerm()}`)
                    .then((res) => {
                        Dispatcher.dispatch({
                            type: ActionTypes.TEACHER_SEARCH_RESULT,
                            data: res.data
                        });
                    })
            })
        })
    },

    async submit(assessmentId) {
        return await http.post(`/assessments/${assessmentId}/results`, AssessmentScoreStore.getSerializedResult())
    }
}

export default AssessmentScoreActionCreator;