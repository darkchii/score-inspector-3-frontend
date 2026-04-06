import { useState } from "react";
import type { IRouteBeatmapResult, IScoreMod } from "../../types/types";
import { Typography } from "@mui/material";

function BeatmapPerformanceTool({ data }: { data: IRouteBeatmapResult | null }) {
    const [selectedMods, setSelectedMods] = useState<IScoreMod[]>([]);
    return (
        <>
            <Typography variant="h6">Performance Tool (WIP)</Typography>
        </>
    )
}

export default BeatmapPerformanceTool;