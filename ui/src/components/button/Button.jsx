import React from "react";

import styles from './Button.module.scss';

const STYLES = [
    "filled",
    "outline",
    "grey",
    "blurple"
];

const SHAPES = [
    "regular",
    "pill"
]

const SIZES = [
    "small",
    "medium",
    "large"
]

export const Button = ({children, design = "filled", size = "medium", shape = "regular", ...props}) => {
    if(!STYLES.includes(design)) {
        return "Invalid Style: " + design;
    }

    if(!SIZES.includes(size)) {
        return "Invalid Size: " + size;
    }

    if(!SHAPES.includes(shape)) {
        return "Invalid Shape: " + shape
    }

    const cls = [styles.button, styles[design], styles[size], styles[shape], props.className]
        .filter(Boolean)
        .join(" ");

    return (
        <button {...props} className={cls}>
            {children}
        </button>
    )
}