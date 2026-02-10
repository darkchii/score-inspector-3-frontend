import { createContext, useContext, useEffect, useState } from "react";

const ReputationContext = createContext();

export function ReputationProvider({ children }) {
    return (
        <ReputationContext.Provider value={{}}>
            {children}
        </ReputationContext.Provider>
    );
}

export function usePageTitle(title) {
}