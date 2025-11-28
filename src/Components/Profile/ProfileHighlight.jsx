import { Box, Paper } from "@mui/material";
import { grey } from "@mui/material/colors";
import React from "react";

function ProfileHighlight({ icon, title, value }) {
    return (
        <Paper elevation={3} sx={{ overflow: 'hidden', width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5, p: 0.5, width: '100%' }}>
                {
                    React.cloneElement(icon, {
                        sx: { 
                            //use paper background color
                            color: grey[700],
                            //another paper color but lighter
                            backgroundColor: grey[900],
                            borderRadius: '50%',
                            p: 1,
                        },
                        fontSize: 'large'
                    })
                }
                <Box>
                    <Box sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</Box>
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{title}</Box>
                </Box>
            </Box>
        </Paper>
    )
}

export default ProfileHighlight;