import { Box } from "@mui/material";
import Mod from "./Mod";
import { GetModData } from "../Misc/ModHelper";

function ModDisplay({ ruleset, mods }) {
    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {mods.map((mod) => (
                <Mod key={mod.acronym} mod={mod} data={GetModData(ruleset, mod.acronym)} />
            ))}
        </Box>
    )
}

export default ModDisplay;