import { useNavigate, useParams } from "react-router";
import PageLoader from "../components/PageLoader";
import { useEffect } from "react";
import { useApi } from "../providers/ApiProvider";
import { routeData, GenerateUrl } from "../util/RouteHelper";

function RouteBeatmaps() {
    const { beatmapId } = useParams<{ beatmapId: string }>();
    const { getBeatmap } = useApi();
    const navigate = useNavigate();

    useEffect(() => {
        if(beatmapId) {
            (async () => {
                const map = await getBeatmap(beatmapId);
                if(map && map.beatmapset_id){
                    const url = GenerateUrl(routeData.routeBeatmapsets.path, {
                        beatmapsetId: map.beatmapset_id,
                        beatmapId: map.id,
                        ruleset: map.mode
                    });
                    navigate(url);
                }
            })();
        }
    }, [beatmapId])

    //if beatmapId is provided, find the beatmap in the api, and redirect to that set
    if (beatmapId) {
        return <PageLoader />
    }

    return (
        <></>
    )
}

export default RouteBeatmaps;