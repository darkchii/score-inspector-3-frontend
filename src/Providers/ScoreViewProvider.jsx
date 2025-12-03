import { Fade, Modal } from "@mui/material";
import { createContext, useContext, useState } from "react";
import modalStyles from '../Style/modal.module.less';
import ScoreView from "../Components/ScoreView";

const ScoreViewContext = createContext();

export function ScoreViewProvider({ children }) {
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
            >
                <Fade in={enabled}>
                    <div className={modalStyles.modal}>
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