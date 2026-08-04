import { scaleLinear, interpolateRgb } from "d3";

const difficultyColourSpectrum = scaleLinear<string>()
    .domain([0.1, 1.25, 2, 2.5, 3.3, 4.2, 4.9, 5.8, 6.7, 7.7, 9])
    .clamp(true)
    .range(['#4290FB', '#4FC0FF', '#4FFFD5', '#7CFF4F', '#F6F05C', '#FF8068', '#FF4E6F', '#C645B8', '#6563DE', '#18158E', '#000000'])
    .interpolate(interpolateRgb.gamma(2.2));

const difficultyTextColourSpectrum = scaleLinear<string>()
    .domain([9, 9.9, 10.6, 11.5, 12.4])
    .clamp(true)
    .range(['#F6F05C', '#FF8068', '#FF4E6F', '#C645B8', '#6563DE', '#18158E'])
    .interpolate(interpolateRgb.gamma(2.2));

export const getDiffColour = (rating: number | null): string => {
    if (rating === null) return '#AAAAAA';
    if (rating < 0.1) return '#AAAAAA';
    if (rating >= 9) return '#000000';
    return difficultyColourSpectrum(rating);
}

export const getDiffTextColour = (rating: number | null): string => {
    if (rating === null) return '#AAAAAA';
    if (rating < 6.5) return '#000000';
    if (rating < 9) return '#F6F05C';
    return difficultyTextColourSpectrum(rating);
}