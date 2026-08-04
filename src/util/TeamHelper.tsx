import type { ITeam } from "../types/types";

const minColorOffset = 100;
export function GetTeamColor(team: ITeam): string {
    if(team.color){
        //validate that its a #xxxxxx color
        if(/^#([0-9A-F]{3}){1,2}$/i.test(team.color)){
            return team.color;
        }
    }

    const teamId = team.id;
    const teamName = team.name;
    //create a light-colored color based on "{teamId}-{teamName}-extrasalt"
    const hash = `${teamId}-${teamName}-extrasalt`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const r = (hash * 123) % (255 - minColorOffset) + minColorOffset; //ensure it's between minColorOffset and 255
    const g = (hash * 321) % (255 - minColorOffset) + minColorOffset;
    const b = (hash * 213) % (255 - minColorOffset) + minColorOffset;
    return `rgb(${r}, ${g}, ${b})`;
}