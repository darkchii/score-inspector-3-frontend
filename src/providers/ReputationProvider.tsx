import { createContext, useContext, useEffect, useState } from "react";
import { ReputationContextValue } from "./ContextTypes";

const ReputationContext = createContext<ReputationContextValue | null>(null);

export function ReputationProvider({ children }: { children: React.ReactNode }) {
    return (
        <ReputationContext.Provider value={{}}>
            {children}
        </ReputationContext.Provider>
    );
}

export function usePageTitle(title) {
}