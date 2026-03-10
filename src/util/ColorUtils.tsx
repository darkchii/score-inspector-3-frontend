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