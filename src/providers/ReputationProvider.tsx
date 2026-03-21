import { createContext, useContext, useEffect, useState } from "react";
import type { ReputationContextValue } from "./ContextTypes";

const ReputationContext = createContext<ReputationContextValue>({} as ReputationContextValue);

export function ReputationProvider({ children }: { children: React.ReactNode }) {
    return (
        <ReputationContext.Provider value={{}}>
            {children}
        </ReputationContext.Provider>
    );
}
