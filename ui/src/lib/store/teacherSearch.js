import { Dispatcher, Store, ActionTypes } from "./internals";

/*
This store manages the state of searching for a teacher.
*/

let _searchTerm = "";
let _actualSearchTerm = "";

let _timeout = null;
let _results = [];
let _cached = [];

class TeacherSearchStore extends Store {
    getResults() {
        // merge cached and results, 
        // then ensure unique values
        // then return back to a list
        const mapped = [..._cached, ..._results]
            .map((result, pos) => ({
                ...result,
                pos
            }))
            .reduce((acc, curr) => {
                if(acc[curr.id]) return acc;
                acc[curr.id] = curr;
                return acc;
            }, {});

        const out = [];

        for(const elem of Object.values(mapped)) {
            out[elem.pos] = {
                id: elem.id,
                name: elem.name
            }
        }

        return out;
    }

    getTeacher(id) {
        return [..._cached, ..._results]
            .find((data) => data.id === id) ?? null;
    }

    getSearchTerm() {
        return _searchTerm;
    }
}

export default new TeacherSearchStore(Dispatcher, {
    [ActionTypes.TEACHER_SEARCH_RESULT]: ({ data }) => {
        _results = data.map((elem) => ({
            id: elem.id,
            name: `${elem.first_name} ${elem.last_name}`
        }));

        _cached.push(..._results);
    },
    [ActionTypes.TEACHER_SEARCH_FILTER_CHANGE]: ({ filter, callback }) => {
        _actualSearchTerm = filter;

        // clear the old timeout if it exists
        if(_timeout) {
            clearTimeout(_timeout)
        }

        // try run the callback after 500ms
        // will be canceled if a new FILTER_CHANGE
        // event is dispatched, providing the
        // debounced feature
        _timeout = setTimeout(() => {
            _searchTerm = _actualSearchTerm;
            callback();
        }, 500)
    }
})
