import { useState } from "react";
import styles from "./PostComment.module.scss";
import { Button } from "../../../../button/Button";
import AssessmentCompareActionCreator from "../../../../../lib/actions/AssessmentCompareActionCreator";


export const PostComment = ({ assessmentId, replyingTo, setReplyingTo }) => {
    const [createComment, setCreateComment] = useState("");
    const [error, setError] = useState(null);
    const [showCancelReplyingTo, setShowCancelReplyingTo] = useState(false);

    return <div className={styles.postComment}>
        <div className={styles.meta}>
            {replyingTo && <span 
                className={styles.replyingTo}
                onMouseEnter={() => setShowCancelReplyingTo(true)}
                onMouseLeave={() => setShowCancelReplyingTo(false)}
            >
                Replying to {replyingTo.name}

                {showCancelReplyingTo && <span className={styles.cancelReplyingTo} onClick={() => {
                    setShowCancelReplyingTo(false);
                    setReplyingTo(null);
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12"><path fill-rule="evenodd" d="M1.757 10.243a6 6 0 118.486-8.486 6 6 0 01-8.486 8.486zM6 4.763l-2-2L2.763 4l2 2-2 2L4 9.237l2-2 2 2L9.237 8l-2-2 2-2L8 2.763l-2 2z"></path></svg>
                </span>}
            </span>}
            {error && <span className={styles.validationError}>{error}</span>}
        </div>
        <div className={styles.inputSection}>
            <input
                type='textarea'
                placeholder="Type here..."
                value={createComment}
                onChange={(event) => {
                    setError(null);
                    setCreateComment(event.target.value);
                }}
            />
            <Button onClick={() => {
                if(createComment === "") {
                    setError("Must be specified");
                    return;
                }

                AssessmentCompareActionCreator.postComment(assessmentId, {
                    content: createComment,
                    parentId: replyingTo?.id ?? undefined
                })
                    .then(() => {
                        setReplyingTo(null);
                        setCreateComment("")
                    });
            }}>
                Post
            </Button>
        </div>
    </div>
}