import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import AssessmentCompareStore from "../../lib/store/assessmentCompare";
import FilterAssessmentStore from "../../lib/store/filterStore";
import { ActionTypes, Dispatcher, useStore } from "../../lib/store/internals";
import styles from "./ReviewAssessment.module.scss";

import AssessmentCompareActionCreator from "../../lib/actions/AssessmentCompareActionCreator";

import { DropdownFilter, Assessment, CommentSection } from "../../components/assessment/review";

const ReviewAssessment = () => {
    const [params,] = useSearchParams()

    const { assessmentId } = useParams()
    const { data, analysed, isComparison, comments } = useStore(AssessmentCompareStore, (store) => ({
        data: store.getData(),
        isComparison: store.isComparison(),
        analysed: store.getAnalysedData(),
        comments: store.getComments()
    }), { skip: true });

    useEffect(() => {
        const compareTo = params.get("compareTo");

        AssessmentCompareActionCreator.fetch({
            sourceId: assessmentId,
            compareTo
        });
    }, [assessmentId, params]);

    useEffect(() => {
        AssessmentCompareActionCreator.getComments(assessmentId);
    }, [assessmentId]);

    useEffect(() => {
        // WARNING: it is very easy to cause
        // an infinite recursion by messing up 
        // the conditionals. Change them 
        // carefully
        const { remove } = Dispatcher.onFinish(() => {
            const transform = FilterAssessmentStore.getFilterFunction();

            if(!transform) {
                if(AssessmentCompareStore.hasVirtualView()) {
                    Dispatcher.dispatch({ type: ActionTypes.ASSESSMENT_COMPARE_CLEAR_VIRTUAL_VIEW });
                }

                return;
            }

            if(!AssessmentCompareStore.hasVirtualView() || !FilterAssessmentStore.equal(
                AssessmentCompareStore.getLastFilter(),
                transform
            )) {
                Dispatcher.dispatch({
                    type: ActionTypes.ASSESSMENT_COMPARE_APPLY_VIRTUAL_VIEW,
                    transform
                })
            }
        });

        return (() => remove());
    }, [])

    if (!data) {
        return <>Loading ...</>
    }

    // maps assessments to a map of id -> name
    const names = data.reduce((acc, val) => ({ ...acc, [val.id]: val.name }), {});

    return (
        <div className={styles.reviewCompare}>
            {isComparison && <div className={styles.header}>
                <h2>Comparing {data.length} assessments</h2>
            </div>}

            <DropdownFilter />

            <ul className={styles.assessments}>
                {data.map((entry) => (
                    <Assessment assessment={entry} analysed={analysed[entry.id]} names={names} />
                ))}
            </ul>

            {!isComparison && <CommentSection assessmentId={assessmentId} comments={comments} />}
        </div>
    )

}

export default ReviewAssessment;