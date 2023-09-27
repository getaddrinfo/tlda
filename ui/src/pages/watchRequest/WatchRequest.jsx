import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components';
import { useStore } from '../../lib/store/internals';
import UserProfileStore from '../../lib/store/userProfile';
import { useNavigate } from 'react-router-dom';

import styles from "./WatchRequest.module.scss";
import { mustBeOneOf, validate } from '../../lib/formValidator';
import LessonSearchStore from '../../lib/store/lessonSearch';

import WatchRequestActionCreator from '../../lib/actions/WatchRequestActionCreator';

// client type -> api type
const WATCH_TO_TYPE = {
    "teachingMethods": 0,
    "behaviourControl": 1,
    "other": 2
}

// represents the options that
// the user can click:
//   * = all but watch request
//   watch = watch request
const OPTION_LIST = {
    "*": [
        {
            value: "progress",
            content: "Progress Review"
        },
        {
            value: "performance",
            content: "Performance Review"
        }
    ],
    "watch": [
        {
            value: "teachingMethods",
            content: "Teaching Methods"
        },
        {
            value: "behaviourControl",
            content: "See how a teacher handles certain behaviours"
        },
        {
            value: "other",
            content: "Other",
            allowRawInput: true
        }
    ]
}

// possible times that the user can choose
// for how long a watch request is
const TIMES = ["5", "10", "15", "30"];


const payloadForType = (type, data) => {
    const date = (new Date(data.date))
        .toISOString();
    
    switch(type) {
        case "watch": {
            return {
                date: date,
                meta: data.metaText,
                type: "watch",
                length: parseInt(data.len) * 60,
                reason: {
                    type: WATCH_TO_TYPE[data.reason],
                    data: data.reasonOtherText || null
                }
            }
        }

        case "progress":
        case "performance": {
            return {
                date: date,
                type: type,
                meta: data.metaText,
                class_id: data.classId
            }
        }

        default:
            return null;
    }
}

export const Error = ({
    item: key, 
    touched,
    errors
}) => (
    errors[key] && touched[key] ? <span className={styles.validationError}>{errors[key]}</span> : <></>
)

const WatchRequest = ({
    type
}) => {
    // /app/teachers/:userId/{watch,assess}
    const { userId } = useParams();
    const classes = useStore(LessonSearchStore, (store) => store.getResults(), { skip: true });

    // what key to use to index options
    const index = type === "watch" ? "watch" : "*";
    // the list of options
    const list = OPTION_LIST[index];

    // what title to show
    const title = index === "watch" ? "Request to watch" : "Schedule review";

    // used to navigate user back (cancel)
    const navigate = useNavigate();

    // user profile
    const user = useStore(UserProfileStore, (store) => store.getProfile(userId), {
        deps: [userId]
    });

    // state
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);

    const [selectedClassId, setSelectedClassId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchContent, setSearchContent] = useState(null);
    const [validationErrorClassId, setValidationErrorClassId] = useState(false);

    // removes magic values
    const allowInputForOther = list.some((d) => d.allowRawInput);

    useEffect(() => {
        // if we already have them locally cached
        // we likely do not need to re-fetch
        // since they are not likely
        // to change their name between viewing profile
        // and viewing this, nor will it make a difference.
        if(user) return;
        WatchRequestActionCreator.fetch(userId);
    }, [user, userId])

    return (
        <div className={styles.container}>
            {(!sent && !error) && <>
                <div className={styles.header}>
                    <h1>{title}</h1>
                </div>
                <Formik
                    initialValues={{
                        /*
                        for watch: why they want to watch the content
                        for review: what type of review
                        */
                        reason: null, 

                        /*
                        for watch: reason for specifying "other"
                        for review: unused
                        */
                        reasonOtherText: "",
                        
                        // extra info to teacher receiving
                        metaText: "",

                        // when
                        date: "",

                        // length
                        len: ""
                    }}
                    validate={validate([
                        {
                            key: 'reason',
                            handle: mustBeOneOf(list.map((item) => item.value))
                        },
                        {
                            key: 'date',
                            handle: (value) => {
                                if(value === "") return "Must be specified";

                                const date = new Date(value);
                                const curr = new Date();
                                const eq = (a) => curr[a]() === date[a]();

                                const isExactSameDay =
                                    eq('getFullYear') &&
                                    eq('getMonth') &&
                                    eq('getDate');

                                if(date < curr && !isExactSameDay) return "Must be in the future"
                            }
                        }
                    ])}abcd
                    onSubmit={(values, { setSubmitting }) => {
                        if(!selectedClassId && index !== "watch") {
                            setValidationErrorClassId(true);
                            setSubmitting(false);
                            return;
                        }

                        WatchRequestActionCreator.submit(userId, {
                            ...values,
                            classId: selectedClassId,
                            idx: index === "watch" ? "watch" : values.reason
                        })
                            .then((_) => setSent(true))
                            .catch((err) => setError(err));
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        isSubmitting,
                        handleSubmit,
                        handleChange,
                        handleBlur
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.reasoning}>
                                <h3>Why do you want to watch this lesson?</h3>
                                <ul>
                                        {list.map((opt) => (
                                            <li>
                                                <input
                                                    type="radio"
                                                    id={opt.value}
                                                    name="reason"
                                                    value={opt.value}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                />
                                                <label for={opt.value}>
                                                    {opt.content}
                                                </label>
                                            </li>
                                        ))}
                                </ul>

                                {(allowInputForOther && values.reason === "other") && <>
                                    <input 
                                        name="reasonOtherText"
                                        placeholder="Reason"
                                        value={values.reasonOtherText}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                    />
                                </>}
                            </div>  

                            <div className={styles.when}>
                                <h3>When should this happen?</h3>

                                <input 
                                    type="datetime-local" 
                                    name="date" 
                                    value={values.date} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                    min={(new Date()).toISOString().slice(0, -8)}
                                />

                                <br />

                                <Error item='date' touched={touched} errors={errors} />
                                <Error item='time' touched={touched} errors={errors} />
                            </div>

                            {index === "watch" && <div className={styles.howLong}>
                                <h3>How long for?</h3>
                                <ul>
                                    {TIMES.map((time) => (
                                        <li>
                                            <input
                                                type="radio"
                                                id={time}
                                                name="len"
                                                value={time}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                            />
                                            <label for={time}>
                                                {time} minutes
                                            </label>
                                        </li>  
                                    ))}
                                </ul>
                            </div>}

                            {index === "*" && <div className={styles.lesson}>
                                <h3>What class are you watching?</h3>

                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownContent}>
                                        <input type="text" name="selectedClass" id="selectedClass" placeholder='Type to search' value={searchContent} onChange={(event) => {
                                            setSearchContent(event.currentTarget.value);
                                            setValidationErrorClassId(false);

                                            WatchRequestActionCreator.search(event.target.value);
                                        }}/>
                                    </div>

                                    {validationErrorClassId && <span className={styles.validationError}>Value must be set</span>}

                                    <ul className={[styles.dropdownList, dropdownOpen ? styles.open : null].filter(Boolean).join(" ")}>
                                        {classes.map((result) => (
                                            <li key={result.id} onClick={() => { 
                                                setSelectedClassId(result.id);
                                                setDropdownOpen(false);
                                                setSearchContent(result.code);
                                            }}>
                                                {result.code}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>}


                            <div className={styles.metaText}>
                                <h3>Anything else {user?.name ?? "they"} should know?</h3>
                                <textarea 
                                    name="metaText"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.metaText}
                                    placeholder="Some more information about your visit. Leave blank for none."
                                />
                            </div>
                                
                            <div className={styles.buttons}>
                                <Button design="grey" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                                <Button design="filled" type="submit" disabled={isSubmitting}>
                                    Send
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </>}

            {sent && <div className={styles.sent}>
                <h1>Sent</h1>
                <p>
                    The teacher will be notified with an email. If they accept your request, you'll receive an email from us telling you!
                </p>
                <Button design="filled" onClick={() => navigate(-1)}>
                    Go back
                </Button> 
            </div>}

            {error && <div className={styles.error}>
                <h1>An error occurred</h1>
                <p>
                    If the error persists, try again later.
                </p>
                <Button design="filled" onClick={() => navigate(-1)}>
                    Go back
                </Button> 
            </div>}
        </div>
    )
}

export default WatchRequest;