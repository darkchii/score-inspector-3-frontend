import { Fade, Modal } from "@mui/material";
import { createContext, useContext, useState } from "react";
import ScoreView from "../components/scoreView/ScoreView";
import type { ScoreViewContextValue } from "./ContextTypes";

const ScoreViewContext = createContext<ScoreViewContextValue | null>(null);

export function ScoreViewProvider({ children }: { children: React.ReactNode }) {
    const [scoreData, setScoreData] = useState(null);
    const [enabled, setEnabled] = useState(false);

    const loadScoreView = (score) => {
        console.log("Loading score view for score:", score);
        setScoreData(score);
        setEnabled(true);
    }

    const unloadScoreView = () => {
        setEnabled(false);
    }

    return (
        <ScoreViewContext.Provider value={{ loadScoreView, unloadScoreView, enabled }}>
            <Modal
                open={enabled}
                onClose={unloadScoreView}
                closeAfterTransition
                sx={{
                    //prevent blue outline on focus
                    '&:focus': {
                        outline: 'none',
                    },
                }}
            >
                <Fade in={enabled}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        outline: 0,
                    }}>
                        <ScoreView score={scoreData} />
                    </div>
                </Fade>
            </Modal>
            {children}
        </ScoreViewContext.Provider>
    )
}

export function useScoreView() {
    return useContext(ScoreViewContext);
}