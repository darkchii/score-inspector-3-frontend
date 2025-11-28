import { Box, Divider, Grid, Paper } from "@mui/material";
import { grey } from "@mui/material/colors";
import React from "react";

function ProfileHighlight({ title, value }) {
    return (
        <Paper elevation={3} sx={{ width: '100%', p: 2 }}>
            <Box>
                <Box sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</Box>
                <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{title}</Box>
            </Box>
        </Paper >
    )
}

export default ProfileHighlight;