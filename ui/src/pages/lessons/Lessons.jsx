import React, { useEffect, useMemo, useState } from 'react';
import styles from './Lessons.module.scss';

import { useStore } from '../../lib/store/internals';
import LessonStore from '../../lib/store/lessons';
import { Button } from '../../components';

import LessonActionCreator from '../../lib/actions/LessonsActionCreator';
import { Search, Lesson } from '../../components/lessons';

const Lessons = () => {
    const lessons = useStore(LessonStore, (store) => store.getLessons(), { skip: true });
    const { page, total } = useStore(LessonStore, (store) => ({
        page: store.getNextPage(),
        total: store.getCount()
    }));

    // If the next set of data is loading.
    const [loading, setLoading] = useState(false);

    const disabled = useMemo(() => loading || page === null, [page, loading]);

    useEffect(() => {
        setLoading(true);

        LessonActionCreator
            .fetchLessons()
            .finally(() => setLoading(false));
    }, []);

    if(!lessons) {
        return <>Loading...</>
    }

    return (
        <div className={styles.lessons}>
            <div className={styles.header}>
                <span>Showing <b>{lessons.length}</b> of <b>{total}</b></span>
                <Search />
            </div>

            <div className={styles.lessonsList}>
                {lessons.map((lesson) => <Lesson key={lesson.id} {...lesson} />)}
            </div>

            <div className={styles.paginationNext}>
                {/* eslint-disable-next-line */}
                <Button design="blurple" shape="pill" disabled={disabled} onClick={() => {
                    setLoading(true);
                    LessonActionCreator.fetchLessons(page)
                        .finally(() => setLoading(false));
                }}>
                    {page === null ? "No more classes" : "Load more"}
                </Button>
            </div>
        </div>
    )
}

export default Lessons;