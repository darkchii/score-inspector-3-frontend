export function GetColorInterpolation(value: number, min: number, max: number, rgbMin: number[] | { r: number, g: number, b: number }, rgbMax: number[] | { r: number, g: number, b: number }, alpha: number = 1.0): string {
    //rgb is basically [r, g, b] (or convert from { r: , g: , b: } if needed )
    const ratio = (value - min) / (max - min);
    let rMin = Array.isArray(rgbMin) ? rgbMin[0] : rgbMin.r;
    let gMin = Array.isArray(rgbMin) ? rgbMin[1] : rgbMin.g;
    let bMin = Array.isArray(rgbMin) ? rgbMin[2] : rgbMin.b;

    let rMax = Array.isArray(rgbMax) ? rgbMax[0] : rgbMax.r;
    let gMax = Array.isArray(rgbMax) ? rgbMax[1] : rgbMax.g;
    let bMax = Array.isArray(rgbMax) ? rgbMax[2] : rgbMax.b;

    const r = Math.round(rMin + (rMax - rMin) * ratio);
    const g = Math.round(gMin + (gMax - gMin) * ratio);
    const b = Math.round(bMin + (bMax - bMin) * ratio);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const minColorOffset = 100;
export function TeamColorGenerator(teamId: number | string, teamName: string): string {
    //create a light-colored color based on "{teamId}-{teamName}-extrasalt"
    const hash = `${teamId}-${teamName}-extrasalt`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const r = (hash * 123) % (255 - minColorOffset) + minColorOffset; //ensure it's between minColorOffset and 255
    const g = (hash * 321) % (255 - minColorOffset) + minColorOffset;
    const b = (hash * 213) % (255 - minColorOffset) + minColorOffset;
    return `rgb(${r}, ${g}, ${b})`;
}