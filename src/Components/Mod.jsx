import { Box } from "@mui/material";

function Mod({ mod, data }) {
    if(!data) return null;

    return (
        <div className="mod-icon" data-acronym={data.Acronym}>

        </div>
    );
}

export default Mod;