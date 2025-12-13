import { Box } from "@mui/material";
import Mod from "./Mod";
import { GetModData } from "../util/ModHelper";

function ModDisplay({ ruleset, mods }) {
    return (
        <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px',
            fontSize: '22px',
            overflow: 'hidden',
        }}>
            {mods.map((mod) => (
                <Mod key={mod.acronym} mod={mod} data={GetModData(ruleset, mod.acronym)} ruleset={ruleset} />
            ))}
        </Box>
    )
}

export default ModDisplay;