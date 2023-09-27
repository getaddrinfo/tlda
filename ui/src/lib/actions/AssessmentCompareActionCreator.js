import http from '../http';

import { Dispatcher, ActionTypes } from '../store/internals';
import { createFetchAction } from '../store/internals/Fetcher';


const AssessmentCompareActionCreator = {
    async fetch({
        sourceId,
        compareTo = null
    }) {
        const query = compareTo !== null ? `?compare_to=${compareTo}` : "";

        return createFetchAction(
            () => http.get(`/assessments/${sourceId}/results${query}`),
            "ASSESSMENT_COMPARE"
        )
    },
    async getComments(sourceId) {
        return createFetchAction(
            () => http.get(`/assessments/${sourceId}/comments`),
            {
                start: ActionTypes.ASSESSMENT_COMPARE_FETCH_COMMENTS_START,
                success: ActionTypes.ASSESSMENT_COMPARE_FETCH_COMMENTS_SUCCESS,
                failure: ActionTypes.ASSESSMENT_COMPARE_FETCH_COMMENTS_FAILURE
            }
        )
    },
    changeFilter(filter) {
        Dispatcher.dispatch({
            type: ActionTypes.FILTER_ASSESSMENT_CHANGE,
            filter
        });
    },
    async postComment(assessmentId, {
        content,
        parentId
    }) {
        http.post(`/assessments/${assessmentId}/comments`, {
            content: content,
            parent_id: parentId ?? undefined
        })
            .then((res) => {
                Dispatcher.dispatch({
                    type: ActionTypes.ASSESSMENT_COMPARE_ADD_COMMENT,
                    id: res.data.id,
                    content,
                    to: parentId ?? null
                })
            })
    },
}

export default AssessmentCompareActionCreator;