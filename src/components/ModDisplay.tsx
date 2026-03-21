import { Box } from "@mui/material";
import ModIcon from "./ModIcon";
import { GetModData } from "../util/ModHelper";
import type { IScoreMod } from "../types/types";

function ModDisplay({ ruleset, mods }: { ruleset: string; mods: IScoreMod[] }) {
    return (
        <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px',
            fontSize: '22px',
            overflow: 'hidden',
        }}>
            {mods.map((mod) => (
                <ModIcon key={mod.acronym} mod={mod} data={GetModData(ruleset, mod.acronym)} ruleset={ruleset} />
            ))}
        </Box>
    )
}

export default ModDisplay;