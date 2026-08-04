import { Box } from "@mui/material";
import ModIcon from "./ModIcon";
import { GetModData } from "../util/ModHelper";
import type { IDatabasedMod, IScoreMod } from "../types/types";

function ModDisplay({ ruleset, mods }: { ruleset: string; mods: IScoreMod[] | IDatabasedMod[] }) {
    return (
        <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px',
            fontSize: '22px',
            overflow: 'hidden',
        }}>
            {mods.map((mod) => {
                const isDatabasedMod = (mod as IDatabasedMod).Acronym !== undefined;
                const acronym = isDatabasedMod ? (mod as IDatabasedMod).Acronym : (mod as IScoreMod).acronym;
                const modData = isDatabasedMod ? (mod as IDatabasedMod) : GetModData(ruleset, acronym);
                return (
                    <ModIcon key={acronym} mod={isDatabasedMod ? null : (mod as IScoreMod)} data={modData} ruleset={ruleset} />
                )
            })}
        </Box>
    )
}

export default ModDisplay;