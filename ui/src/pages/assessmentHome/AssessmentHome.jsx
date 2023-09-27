import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../lib/store/internals';
import AssessmentsStore from '../../lib/store/assessments';

import styles from './AssessmentHome.module.scss';
import { Button } from '../../components';
import { Link } from 'react-router-dom';

import AssessmentHomeActionCreator from '../../lib/actions/AssessmentHomeActionCreator';
import { Assessment } from '../../components/assessment/home/assessment/Assessment';

const AssessmentHome = () => {
    const assessments = useStore(AssessmentsStore, (store) => store.getAssessments());
    const { page, total, visible } = useStore(AssessmentsStore, (store) => ({
        page: store.getNextPage(),
        total: store.getCount(),
        visible: store.getLocalStoredCount()
    }));

    const [loading, setLoading] = useState(false);
    const disabled = useMemo(() => loading || page === null, [page, loading]);

    useEffect(() => {
        AssessmentHomeActionCreator.fetch();
    }, []);

    return (
        <div className={styles.assPage}>
            <div className={styles.header}>
                <h1>Assessments</h1>
                <div>
                    <h3>{total} assessments (showing {visible})</h3>
                    <Link to='/app/assessments/create'>
                        <Button shape='pill' design='blurple' size='small'>Create assessment</Button>
                    </Link>
                </div>
            </div>
            <ul className={styles.assessments}>
                {assessments.map((assessment) => <Assessment {...assessment} key={assessment.id} />)}
            </ul>
            <div className={styles.paginationNext}>
                <Button design='blurple' shape='pill' disabled={disabled} onClick={() => {
                    setLoading(true);
                    AssessmentHomeActionCreator.fetch(page)
                        .finally(() => setLoading(false));
                }}>
                    {page !== null ? "Load more teachers" : "No more"}
                </Button>
            </div>
        </div>
    )
}

export default AssessmentHome;