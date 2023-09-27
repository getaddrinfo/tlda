# tlda/ui

The user interface for the TLDA application. Written in react.

## Structure

- components: React components that are used within pages - directories denote their purpose.
- lib: Internal library code
    - actions: Wrappers around actions dispatched to the store(s).
    - auth: A component to wrap pages that require authorization.
    - hooks: React hooks that are used within the application.
    - search: A (very simple) search language used within the application for applying filters.
    - store: The stores that contain application state - using dispatched.
        - internals: The underlying implementation of the stores, wrapping around dispatched.
    - utils: Repeated code extracted into their own files
- pages: Routes within the application
- styles: Global styles that are used for components and pages.

## Dependencies
- React 
- Axios
- Dispatched (reimpl of facebook's Flux)
- Sass compiler
- Levenshtein function
- Form handler

## Known Pitfalls

### Statistical Value Calculation

The calculations for statistical values when using a filter should use sample-based formulae, not population based formulae: Once you have applied a filter, you are looking at a subset (sample) of all of the original scores (population) - The actual effect on outcomes are minimal.