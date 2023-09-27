const toTitle = (str) => {
    str = str.toString().toLowerCase().split("");
    return [str[0].toUpperCase(), ...str.slice(1)].join("")
}

export default toTitle;