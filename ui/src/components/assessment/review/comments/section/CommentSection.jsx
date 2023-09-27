import { useState } from "react";
import styles from "./CommentSection.module.scss";
import { SpecificComment } from "../specific/SpecificComment";
import { PostComment } from "../post/PostComment";

export const CommentSection = ({
    assessmentId,
    comments
}) => {
    const [replyingTo, setReplyingTo] = useState(null);
    if (!comments) return <>Loading...</>

    return (
        <div className={styles.commentSection}>
            <h3>Comments</h3>
            <ul className={styles.comments}>
                {comments.map((comment) => <SpecificComment {...comment} setReplyingTo={setReplyingTo} />)}
            </ul>
            <PostComment assessmentId={assessmentId} replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
        </div>
    )
}