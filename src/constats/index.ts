
export const RESOURCES_PATHS: Record<string, string> = {
    preload:  'images/backgrounds/slot-preloader-01.jpg',
    background:  'images/backgrounds/slot-area-bg-01.jpg',
    symbol_1:   'images/symbols/default-Icons/durian-dynamite-video-slot-a-symbol.png',
    symbol_2: 'images/symbols/default-Icons/durian-dynamite-video-slot-k-symbol.png',
    symbol_3: 'images/symbols/default-Icons/durian-dynamite-video-slot-q-symbol.png',
}

const { background, symbol_1,symbol_2,symbol_3 } = RESOURCES_PATHS;
export const resourcesToLoad: string[] = [
    background, symbol_1, symbol_2, symbol_3
];

export const canvas_width: number = 700;
export const canvas_height: number = 960;