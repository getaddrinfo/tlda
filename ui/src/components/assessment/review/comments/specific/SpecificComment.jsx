import { useState } from "react";
import { ProfilePicture } from "../profilePicture/ProfilePicture";
import styles from "./SpecificComment.module.scss";


export const SpecificComment = ({
    id,
    content,
    author,
    children,
    isChild = false,
    parentId = null,
    setReplyingTo
}) => {
    const [showReply, setShowReply] = useState(false);

    return <li key={id} className={[
        styles.comment,
        isChild ? styles.child : null
    ].filter(Boolean).join(" ")} 
        onMouseEnter={() => {setShowReply(true)}} 
        onMouseLeave={() => setShowReply(false)}
    >
        <div className={styles.author}>
            <ProfilePicture {...author} />
            <h4>{author.name}</h4>

            {showReply && <span onClick={() => setReplyingTo({ id: parentId ?? id, name: author.name })} className={styles.reply}>reply</span>}
        </div>
        <p>
            {content}
        </p>

        {children?.length > 0 ? <br /> : <></>}

        {!isChild && <ul className={styles.comments}>
            {children.map((child) => <SpecificComment {...child} isChild={true} parentId={id} setReplyingTo={setReplyingTo} />)}
        </ul>}
    </li>
}