import FilterAssessmentStore from "../../../../lib/store/filterStore";
import { useState, useEffect } from "react";
import { useStore } from "../../../../lib/store/internals";
import useDebounce from "../../../../lib/hooks/useDebounce";
import AssessmentCompareActionCreator from "../../../../lib/actions/AssessmentCompareActionCreator";

import styles from "./DropdownFilter.module.scss";


export const DropdownFilter = () => {
    const filterable = useStore(FilterAssessmentStore, (store) => store.getFilterableKeys());
    const [filter, setFilter] = useState("");
    const [show, setShow] = useState(false);
    
    const debouncedFilter = useDebounce(filter, 500);

    useEffect(() => {
        AssessmentCompareActionCreator.changeFilter(debouncedFilter);
    }, [debouncedFilter])


    return (
        <div className={styles.filter}>
            <input
                type='text'
                placeholder="Apply a filter"
                
                onChange={(event) => { setFilter(event.target.value) }}
                onFocus={() => { setShow(true) }}
                onBlur={() => { setShow(false) }}
            />

            {show && <div className={styles.dropdown}>
                <ul>
                    {filterable.map((filter) => <li>
                        <h4>{filter.key} ({filter.type})</h4>
                        <p>
                            {filter.description}
                        </p>
                        {filter.type === "enum" && <div className={styles.values}>
                            One of <span className={styles.valueList}>{filter.values.join(", ")}</span>
                        </div>}
                    </li>)}
                </ul>
            </div>}
        </div>
    )
}