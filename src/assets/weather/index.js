/**
 * Olé FUT — Weather Overlay Registry
 * 4 tileable weather overlays for match atmosphere
 */

import rain from './rain.webp';
import snow from './snow.webp';
import fog from './fog.webp';
import heat from './heat.webp';

export const WEATHER_OVERLAYS = {
    'rain': rain,
    'snow': snow,
    'fog': fog,
    'heat': heat,
    'clear': null,
};

export default WEATHER_OVERLAYS;
