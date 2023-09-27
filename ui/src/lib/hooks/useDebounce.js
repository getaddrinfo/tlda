import { useEffect, useState } from "react"

// based on https://usehooks.com/useDebounce/
const useDebounce = (value, delay) => {
    const [slowValue, setSlowValue] = useState(null);

    useEffect(() => {
        const h = setTimeout(() => {
            setSlowValue(value)
        }, delay);

        return (() => clearTimeout(h));
    }, [value, delay]);

    return slowValue
}

export default useDebounce;

