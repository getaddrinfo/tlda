import React, { useEffect } from 'react';
import styles from './UserProfile.module.scss';

import { ActionTypes, Dispatcher, useStore } from '../../lib/store/internals';
import UserProfileStore from '../../lib/store/userProfile';
import CurrentUserStore from '../../lib/store/currentUser';

import { Link, useParams } from 'react-router-dom';
import http from '../../lib/http';
import logger from '../../lib/logger';
import { Button } from '../../components';

import { getInitials, getColourFromId } from '../../components/dashboard/user/User';

import UserProfileActionCreator from '../../lib/actions/UserProfileActionCreator';

const toTitle = (str) => {
    if(str == "SLT") return "SLT";

    str = str.toLowerCase().split("");

    return [str[0].toUpperCase(), ...str.slice(1)].join("");
}

const Statistic = ({ name, value }) => (
    <div className={styles.stat}>
        <h2>{name}</h2>
        <span>{value}</span>
    </div>
)

const Department = ({ name, lead }) => {
    const classKey = lead ? "lead" : "member";
    const text = lead ? "Lead" : "Teacher";
    
    return <li>
        <h2>{name}</h2>
        <span className={[styles[classKey], styles.badge].join(" ")}>
            {text}
        </span>
    </li>
}

const ProfilePicture = ({
    id,
    name
}) => {
    const initials = getInitials(name);
    const [bg, fg] = getColourFromId(id);

    return (
        <div className={styles.profilePicture} style={{backgroundColor: bg}}>
            <span style={{color: fg}} className={styles.initials}>{initials}</span>
        </div>
    )
}

export const UserProfile = () => {
    const { userId } = useParams();

    const profile = useStore(UserProfileStore, (store) => store.getProfile(userId), {
        deps: [userId]
    });

    useEffect(() => {
        UserProfileActionCreator.fetch(userId);
    }, [userId]);

    if(!profile) {
        return <>Loading...</>
    }

    return (
        <div className={styles.profile}>
            <div className={styles.header}>
                <div className={styles.user}>
                    <ProfilePicture id={profile.id} name={profile.name} />
                    
                    <div>
                        <h1>{profile.name}</h1>
                        <span className={styles.role}>{toTitle(profile.role)}</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link to={`/app/teachers/${userId}/watch`}>
                        <Button size='small' shape='pill' design='blurple'>
                            Schedule watch
                        </Button>
                    </Link>
                    {CurrentUserStore.isSlt() && <Link to={`/app/teachers/${userId}/assess`}>
                        <Button size='small' shape='pill'>
                            Schedule review    
                        </Button>
                    </Link>}
                </div>
            </div>
            <div className={styles.stats}>
                <Statistic name="Classes taught" value={profile.stats.classes} />
                <Statistic name="Students taught" value={profile.stats.students} />
            </div>
            <div className={styles.departments}>
                <h2 className={styles.title}>Departments</h2>
                <ul>
                    {profile.departments.map((department) => <Department key={department.id} {...department} />)}
                </ul>
            </div>
        </div>
    )
}

export default UserProfile;