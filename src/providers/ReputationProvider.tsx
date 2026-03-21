import { createContext, useContext, useEffect, useState } from "react";

type ReputationContextValue = {
    //TODO
};

const ReputationContext = createContext<ReputationContextValue>({} as ReputationContextValue);

export function ReputationProvider({ children }: { children: React.ReactNode }) {
    return (
        <ReputationContext.Provider value={{}}>
            {children}
        </ReputationContext.Provider>
    );
}
