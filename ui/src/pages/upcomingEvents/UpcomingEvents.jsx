import React, { useEffect, useState } from 'react';
import { Button } from '../../components';
import http from '../../lib/http'
import logger from '../../lib/logger';
import Dispatcher from '../../lib/store';
import { ActionTypes, useStore } from '../../lib/store/internals';
import UpcomingWatchEventStore from '../../lib/store/upcomingWatch';
import styles from './UpcomingEvents.module.scss';

import UpcomingEventsActionCreator from "../../lib/actions/UpcomingEventsActionCreator";

const TypeToFriendly = {
    "PROGRESS_REVIEW": "Progress Review",
    "PERFORMANCE_REVIEW": "Performance Review",
    "WATCH": "Teacher sitting in"
}

const DESC_PROGRESS_REVIEW = `
A five minute check-in to see how you are performing. Sampling of student performance via book checks and questions directly from the reviewer. May occur at any point through the lesson.

Measured on 4 non-negotiables, as well as commentary from the reviewer regarding teacher and student performance.
`;

const DESC_PERFORMANCE_REVIEW = `
A longer 30 minute review of your performance. Extensive details and analysis of teacher and student performance.

Begins at start of the lesson and may extend beyond the 30 minutes guideline if desired.
`;

const DESC_WATCH = `
A teacher has requested to watch your lesson. This may be for them to learn how to handle certain situations, collect new teaching methods, or other activities.

This request was accepted by you, and has been scheduled for the time. You can determine how long this would last for, and can cancel as desired.
`

const getFormattedDate = (str) => {
    const date = new Date(str);

    return date.toLocaleDateString()
}

export const secsToTimeString = (secs) => {
    const out = formatSecs(secs);
    return out.filter(Boolean).join(", ")
}

const pluralize = (time, str) => {
    return time == 1 ? str : str + "s";
}

const formatSecs = (secs) => {
    const hours = Math.floor(secs / (60*60));

    if(hours > 0) {
        return [Math.ceil(secs/ (60 * 60)).toString() + pluralize(hours, ' hour'), ...formatSecs(secs - (hours * 60 * 60))]
    }

    const minutes = Math.floor(secs / 60);

    if(minutes > 0) {
        return [Math.ceil(secs / 60).toString() + pluralize(minutes, ' minute'), ...formatSecs(secs - (hours * 60 * 60) - (minutes * 60))]
    }

    secs = secs % 60;

    if(secs === 0) {
        return [];
    }

    const out = secs.toString() + pluralize(secs, ' second');
    return [out];
}


const Section = ({
    name,
    id,
    children
}) => (
    <div className={[styles.section, id].join(" ")}>
        <h1>{name}</h1>
        <div>
            {children}
        </div>
    </div>
)

// Events
const EventFooterPiece = ({
    name,
    svg,
    data
}) => (
    <li>
        <div className={styles.title}>
            <span>{name}</span>
            {svg}
        </div>
        {data}
    </li>
)

const NotifyMeButton = ({
    event,
    isNotifyScheduled
}) => {
    const [sending, setSending] = useState(false);
    const text = isNotifyScheduled ? "Don't notify" : "Notify me";

    return (
        <li className={styles.notifyMe}>
            <Button design="blurple" shape="pill" size="small" disabled={sending} onClick={() => {
                UpcomingEventsActionCreator.toggleNotify({
                    eventId: event,
                    isScheduled: isNotifyScheduled
                })
                    .finally(() => setSending(false));
            }}>
                {text}
            </Button>
        </li>
    )
}

const EventDetails = ({ type, data }) => {
    const withTilda = (value) => `~${secsToTimeString(value)}`;

    switch(type) {
        case "PROGRESS_REVIEW":
        case "PERFORMANCE_REVIEW":
            return (
                <>
                    <EventFooterPiece name="Length" data={withTilda(data.time_taken)} svg={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fillRule="evenodd" d="M10.25 0a.75.75 0 000 1.5h1v1.278a9.955 9.955 0 00-5.635 2.276L4.28 3.72a.75.75 0 00-1.06 1.06l1.315 1.316A9.962 9.962 0 002 12.75c0 5.523 4.477 10 10 10s10-4.477 10-10a9.962 9.962 0 00-2.535-6.654L20.78 4.78a.75.75 0 00-1.06-1.06l-1.334 1.334a9.955 9.955 0 00-5.636-2.276V1.5h1a.75.75 0 000-1.5h-3.5zM12 21.25a8.5 8.5 0 100-17 8.5 8.5 0 000 17zm4.03-12.53a.75.75 0 010 1.06l-2.381 2.382a1.75 1.75 0 11-1.06-1.06l2.38-2.382a.75.75 0 011.061 0z"></path></svg>} />
                    <EventFooterPiece name="Reviewer" data={data.teacher.name} svg={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fillRule="evenodd" d="M12 2.5a5.5 5.5 0 00-3.096 10.047 9.005 9.005 0 00-5.9 8.18.75.75 0 001.5.045 7.5 7.5 0 0114.993 0 .75.75 0 101.499-.044 9.005 9.005 0 00-5.9-8.181A5.5 5.5 0 0012 2.5zM8 8a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>} />
                    <EventFooterPiece name="Viewable after" data={withTilda(data.viewable_after)} svg={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M15.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"></path><path fillRule="evenodd" d="M12 3.5c-3.432 0-6.125 1.534-8.054 3.24C2.02 8.445.814 10.352.33 11.202a1.6 1.6 0 000 1.598c.484.85 1.69 2.758 3.616 4.46C5.876 18.966 8.568 20.5 12 20.5c3.432 0 6.125-1.534 8.054-3.24 1.926-1.704 3.132-3.611 3.616-4.461a1.6 1.6 0 000-1.598c-.484-.85-1.69-2.757-3.616-4.46C18.124 5.034 15.432 3.5 12 3.5zM1.633 11.945c.441-.774 1.551-2.528 3.307-4.08C6.69 6.314 9.045 5 12 5c2.955 0 5.309 1.315 7.06 2.864 1.756 1.553 2.866 3.307 3.307 4.08a.111.111 0 01.017.056.111.111 0 01-.017.056c-.441.774-1.551 2.527-3.307 4.08C17.31 17.685 14.955 19 12 19c-2.955 0-5.309-1.315-7.06-2.864-1.756-1.553-2.866-3.306-3.307-4.08A.11.11 0 011.616 12a.11.11 0 01.017-.055z"></path></svg>} />
                </>
            );
        case "WATCH":
            return (
                <>
                    <EventFooterPiece name="Teacher" data={data.teacher.name}  svg={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fillRule="evenodd" d="M12 2.5a5.5 5.5 0 00-3.096 10.047 9.005 9.005 0 00-5.9 8.18.75.75 0 001.5.045 7.5 7.5 0 0114.993 0 .75.75 0 101.499-.044 9.005 9.005 0 00-5.9-8.181A5.5 5.5 0 0012 2.5zM8 8a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>} /> 
                </>
            )
    }
}

const Event = ({
    id,
    type,
    data,
    notification_scheduled: isNotifyScheduled,
    scheduled_at: scheduledAt
}) => {
    return (
        <li className={styles.event}>
            <div className={styles.header}>
                <h2>{TypeToFriendly[type]}</h2>
                <span>{getFormattedDate(scheduledAt)}</span>
            </div>

            <ul className={styles.footer}>
                <EventDetails type={type} data={data} />
                <NotifyMeButton event={id} isNotifyScheduled={isNotifyScheduled} />
            </ul>
        </li>
    )
}

// End Events

// Key

const KeyItem = ({
    name,
    length,
    description
}) => {
    return ( 
        <li className={styles.keyItem}>
            <u>
                <h1>
                    {name} <span>({length})</span>
                </h1>
            </u>
            <p>
                {description}
            </p>
        </li>
    )
}

const UpcomingEvents = () => {
    const events = useStore(UpcomingWatchEventStore, (store) => store.getEvents(), { skip: true });

    useEffect(() => {
        UpcomingEventsActionCreator.fetchUpcomingWatchEvents();
    }, []);

    return (
        <div className={styles.upcomingEvents}>
            <Section name="Upcoming Events" id={styles.evt}>
                <ul className={styles.eventList}>
                    {events.map((event) => <Event {...event} key={event.id}/>)}
                </ul>
            </Section>
            <Section name="Key" id={styles.key}>
                <ul className={styles.keyList}>
                    <KeyItem name="Progress Review" length="~5 minutes" description={DESC_PROGRESS_REVIEW} />
                    <KeyItem name="Performance Review" length="~30 minutes" description={DESC_PERFORMANCE_REVIEW} />
                    <KeyItem name="Watch" length="As desired" description={DESC_WATCH} />
                </ul>
            </Section>
        </div>
    )
}

export default UpcomingEvents;