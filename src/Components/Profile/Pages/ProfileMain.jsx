import { Box, Container } from "@mui/material";
import ProfileGrades from "../ProfileGrades";
import ProfileHighlightCollection from "../ProfileHighlightCollection";

function ProfileMain() {
    return (
        <>
            <ProfileGrades />
            <Box sx={{ m: 1 }}>
                <ProfileHighlightCollection />
            </Box>
        </>
    );
}

export default ProfileMain;