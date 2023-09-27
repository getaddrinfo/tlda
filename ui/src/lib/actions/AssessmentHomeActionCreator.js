import http from '../http';

import { createFetchAction } from '../store/internals/Fetcher';

const AssessmentHomeActionCreator = {
    async fetch(page = null) {
        if(page) {
            return createFetchAction(
                () => http.get(`/assessments?page=${page}`),
                "ASSESSMENTS"
            )
        }

        return createFetchAction(
            () => http.get(`/assessments`),
            "ASSESSMENTS"
        )
    }
}

export default AssessmentHomeActionCreator;