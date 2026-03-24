import { Button, Paper, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, Typography } from "@mui/material";
import Config from "../../data/Config.json";
import { useApi } from "../../providers/ApiProvider";
import { useEffect, useState } from "react";
import LandingCard from "../LandingCard";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { red } from "@mui/material/colors";
import PlayerLink from "../PlayerLink";
import { FormatNumber } from "../../util/Helper";

function IndexTopReputations() {
    const [topUserReputations, setTopUserReputations] = useState<any[]>([]);
    const { getTopReputations } = useApi();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchTopReputations = async () => {
            setIsLoading(true);
            setIsError(false);
            try {
                const response = await getTopReputations('user');
                setTopUserReputations(response?.topReputations || []);
            } catch (error) {
                setIsError(true);
                console.error("Error fetching top reputations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopReputations();
    }, []);
    return (
        <LandingCard
            title="Top Reputation"
            isLoading={isLoading}
            isError={isError}
            icon={<ThumbUpIcon />}
            color={red[500]}
            centerContent
            sx={{ height: '100%', width: '100%' }}
        >
            {topUserReputations.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No reputations yet</Typography>
            ) : (
                <TableContainer>
                    <Table size="small" sx={{
                        [`& .${tableCellClasses.root}`]: {
                            borderBottom: "none",
                            color: 'white !important',
                            padding: '2px'
                        },
                        [`& .${tableRowClasses.root}`]: {
                            borderBottom: "none",
                        },
                    }}>
                        <TableBody>
                            {
                                topUserReputations.map((rep, index) => (
                                    <TableRow key={`toprep_${index}`}>
                                        <TableCell align="right" sx={{ width: '10%' }}><Typography variant="caption">{index + 1}.</Typography></TableCell>
                                        <TableCell><PlayerLink data={rep.user} size={18} /></TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{FormatNumber(rep.rep_count)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </LandingCard>
    )
}

export default IndexTopReputations;