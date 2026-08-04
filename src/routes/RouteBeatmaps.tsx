import { useNavigate, useParams } from "react-router";
import PageLoader from "../components/PageLoader";
import { useEffect, useState } from "react";
import { useApi } from "../providers/ApiProvider";
import { routeData, GenerateUrl } from "../util/RouteHelper";
import type { IUserTag } from "../types/types";
import { Alert, Box } from "@mui/material";

function RouteBeatmaps() {
    const { beatmapId } = useParams<{ beatmapId: string }>();
    const { getBeatmap, getBeatmapUserTags } = useApi();
    const [beatmapError, setBeatmapError] = useState<string | null>(null);
    const navigate = useNavigate();

    // const [userTagData, setUserTagData] = useState<IUserTag[] | null>(null);
    // const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);

    // const isLoading = isLoadingInitialData;
    //const isWorking = null; This is when searching for maps

    useEffect(() => {
        if(beatmapId) {
            (async () => {
                try{
                    const map = await getBeatmap(beatmapId);
                    if(map && map.beatmapset_id){
                        const url = GenerateUrl(routeData.routeBeatmapsets.path, {
                            beatmapsetId: map.beatmapset_id,
                            beatmapId: map.id,
                            ruleset: map.mode
                        });
                        navigate(url);
                    }
                }catch(error){
                    console.error("Error fetching beatmap:", error);
                    setBeatmapError("Beatmap not found.");
                }
            })();
        }else{
            setBeatmapError("No beatmap ID provided.");
            // (async () => {
            //     setIsLoadingInitialData(false);
            //     try {
            //         const tags = await getBeatmapUserTags();
            //         console.log(tags);
            //         setUserTagData(tags);
            //     } catch (error) {
            //         console.error("Error fetching user tags:", error);
            //     } finally {
            //         setIsLoadingInitialData(false);
            //     }
            // })();
        }
    }, [beatmapId])

    //if beatmapId is provided, find the beatmap in the api, and redirect to that set
    if (beatmapId) {
        return <PageLoader />
    }

    if(beatmapError){
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "20vh",
            }}>
                <Alert severity="error">{beatmapError}</Alert>
            </Box>
        )
    }

    return (
        <></>
    )
}

export default RouteBeatmaps;