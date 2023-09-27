export const COLOUR_PAIRS = [
    ["#D0FFF7", "#95DBF1"],
    ["#E2E5FF", "#959EF1"],
    ["#FFE2F9", "#F195ED"],
];

// from https://gist.github.com/tmcw/7323807
export const hashCode = (str) => {
    let hash = 0x811C9DC5; // init

    for(let i = 0; i < str.length; i++) {
        hash = hash ^ str.charCodeAt(i);

        hash += (hash << 24) + (hash << 8) + (hash << 7) + (hash << 4) + (hash << 1);
    }

    return (hash >>> 0);
}

export const getColourFromId = (id) => {
    return COLOUR_PAIRS[hashCode(id) % COLOUR_PAIRS.length]
}

export const getInitials = (name) => {
    const split = name.split(" ")
    // eslint-disable-next-line
    const [firstName, firstSurname, ..._rest] = split

    return firstName[0] + firstSurname[0]
}