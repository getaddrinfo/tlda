import React, { useEffect, useMemo, useState } from 'react';
import http from '../../lib/http';
import logger from '../../lib/logger';

import styles from './Teachers.module.scss';

import { ActionTypes, Dispatcher, useStore } from '../../lib/store/internals';
import TeacherStore from '../../lib/store/teachers';
import { Button } from '../../components';
import CurrentUserStore from '../../lib/store/currentUser';
import { Link } from 'react-router-dom';

import { getInitials, getColourFromId } from '../../components/dashboard/user/User';
import TeacherActionCreator from '../../lib/actions/TeacherActionCreator';

const toTitle = (str) => {
    if(str == "SLT") return "SLT";

    str = str.toLowerCase().split("");

    return [str[0].toUpperCase(), ...str.slice(1)].join("");
}

const Search = () => {
    const [content, setContent] = useState("");

    useEffect(() => {
        TeacherActionCreator.applyFilter({ content })
    }, [content])

    return <form onSubmit={(event) => { event.preventDefault(); }}>
        <input type="text" className={styles.filter} value={content} placeholder="Filter" onChange={(event) => {
            setContent(event.target.value);
        }} />
    </form>
}

const ProfilePicture = ({
    id,
    name
}) => {
    const initials = getInitials(name);
    const [bg, fg] = getColourFromId(id);

    return <Link to={`/app/teachers/${id}`}>
        <div className={styles.profilePicture} style={{backgroundColor: bg}}>
            <span style={{color: fg}} className={styles.initials}>{initials}</span>
        </div>
    </Link>
}

const Department = ({ name }) => (
    <li>
        {name}
    </li>
)


const Teacher = ({
    id,
    name,
    preferred_name: preferredName,
    role,
    departments
 }) => {
    const renderedName = preferredName ? `${preferredName} (${name})` : name;

    const notCurrentUser = CurrentUserStore.getCurrentUser().id !== id;
    const isSlt = CurrentUserStore.isSlt();

    return <div className={styles.teacher}>
        <div className={styles.header}>
            <div className={styles.name}>
                <ProfilePicture id={id} name={name} />
                <h1 className={styles.nameContent}>
                    {renderedName}
                </h1>
            </div>

            <span className={styles.role}>
                {toTitle(role)}
            </span>
        </div>

        <div className={styles.departments}>
            <h4>Departments</h4>
            <ul>
                {departments.map((name) => <Department name={name} />)}
            </ul>
        </div>

        {notCurrentUser && <div className={styles.footer}>
            <Link to={`/app/teachers/${id}/watch`}>
                <Button design='blurple' size='small'>
                    Request to watch
                </Button>
            </Link>
            {isSlt && <>
                <Link to={`/app/teachers/${id}/assess`}>
                    <Button size='small'>
                        Schedule review
                    </Button>
                </Link>
            </>}
        </div>}
    </div>  
}

const Teachers = () => {
    const teachers = useStore(TeacherStore, (store) => store.getTeachers(), { skip: true });
    const { page, total } = useStore(TeacherStore, (store) => ({
        page: store.getNextPage(),
        total: store.getCount()
    }));

    const [loading, setLoading] = useState(false);
    const disabled = useMemo(() => loading || page === null, [page, loading]);

    useEffect(() => {
        TeacherActionCreator.fetch()
            .finally(() => setLoading(false));
    }, [])

    if(!teachers) {
        return <>Loading...</>
    }

    return (
        <div className={styles.teachers}>
            <div className={styles.header}>
                <span>Showing <b>{teachers.length}</b> of <b>{total}</b> teachers.</span>
                <Search />
            </div>

            <div className={styles.list}>
                {teachers.map((teacher) => <Teacher key={teacher.id} {...teacher} />)}
            </div>

            <div className={styles.paginationNext}>
                <Button design='blurple' shape='pill' disabled={disabled} onClick={() => {
                    setLoading(true);

                    TeacherActionCreator.fetch(page)
                        .finally(() => setLoading(false));
                }}>
                    {page !== null ? "Load more teachers" : "No more"}
                </Button>
            </div>
        </div>
    );
}

export default Teachers;