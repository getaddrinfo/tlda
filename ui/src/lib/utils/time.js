export const getFormattedDate = (str) => {
    const date = new Date(str);

    return date.toLocaleDateString()
}

export const secsToTimeString = (secs) => {
    const out = formatSecs(secs);
    return out.filter(Boolean).join(", ")
}

const pluralize = (time, str) => {
    return time === 1 ? str : str + "s";
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