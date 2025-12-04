import { Box } from "@mui/material";
import { TextureDatabase } from "../Assets/Textures/TextureDatabase";

function Route404() {
    return (
        <Box sx={{p:1}}>
            <div>
                <p>The page you are looking for does not exist.</p>
                <img src={TextureDatabase.PageNotFoundKirino} alt="Page Not Found" />
            </div>
        </Box>
    );
}

export default Route404;