import { Dispatcher, Store, ActionTypes } from "./internals";

/*
This store manages the state of searching for a lesson.
*/

let _searchTerm = "";
let _actualSearchTerm = "";

let _timeout = null;
let _results = [];

class LessonSearchStore extends Store {
    getResults() {
        return _results;
    }

    getSearchTerm() {
        return _searchTerm;
    }
}

export default new LessonSearchStore(Dispatcher, {
    [ActionTypes.LESSON_SEARCH_RESULT]: ({ data }) => {
        _results = data;
    },
    [ActionTypes.LESSON_SEARCH_FILTER_CHANGE]: ({ filter, callback }) => {
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
