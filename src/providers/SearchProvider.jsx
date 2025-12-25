import { createContext, useContext } from "react";

const SearchContext = createContext();

export function SearchProvider({ children }) {
    return (
        <SearchContext.Provider value={{}}>
            {children}
        </SearchContext.Provider>
    )
}

export function useSearch() {
    return useContext(SearchContext);
}