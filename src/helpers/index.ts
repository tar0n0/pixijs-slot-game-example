import * as PIXI from "pixi.js";
import { DisplayObject, Sprite, Texture } from 'pixi.js'
import {getSoundFx, setSoundFx} from "../stateManager";

// export function resize(): void {
//     const ratio: number = canvas_width / canvas_height;
//     let w: number;
//     let h: number;
//
//     if (window.innerWidth / window.innerHeight >= ratio) {
//         w = window.innerHeight * ratio;
//         h = window.innerHeight;
//     } else {
//         w = window.innerWidth;
//         h = window.innerWidth / ratio;
//     }
//
//     app.view.style.width = w + 'px';
//     app.view.style.height = h + 'px';
// }
//
// window.onresize = (): void => {
//     resize();
// };

export function getRandomPositionsReels(slot_reels_count: number, reels_config: string[][]): number[] {
    let positions: number[] = new Array<number>(slot_reels_count);

    for (let i: number = 0; i < positions.length; i++) {
        positions[i] = getRandomInt(0, reels_config[i].length - 1);
    }
    return positions;
}


export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function newSymbolSprite(reel_index: number, row_index: number, reels_config: string[][], symbols_index: string[],slot_symbols_sprites: Texture[] ): Sprite {
    let symbol_code: string = reels_config[reel_index][row_index];
    let index_symbol = symbols_index.indexOf(symbol_code);
    return new Sprite(slot_symbols_sprites[index_symbol]);
}


export function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

export function setupSoundIcons(container: PIXI.Container, musicData: Howl): void {
    const playIconPath: string = 'images/play-button.png';
    const pauseIconPath: string = 'images/pause.png';

    let playIconTexture: PIXI.Texture;
    let pauseIconTexture: PIXI.Texture;

    const loadPlayIcon: Promise<void> = PIXI.Assets.load(playIconPath).then(texture => {
        playIconTexture = texture;
    });

    const loadPauseIcon: Promise<void> = PIXI.Assets.load(pauseIconPath).then(texture => {
        pauseIconTexture = texture;
    });

    Promise.all([loadPlayIcon, loadPauseIcon]).then((): void => {
        const playSprite: PIXI.Sprite = new PIXI.Sprite(playIconTexture);
        const pauseSprite: PIXI.Sprite = new PIXI.Sprite(pauseIconTexture);

        playSprite.position.set(50, 50);
        pauseSprite.position.set(50, 50);

        container.addChild(pauseSprite as DisplayObject);
        playSprite.width = 100;
        playSprite.height = 100;
        pauseSprite.width = 100;
        pauseSprite.height = 100;

        playSprite.interactive = true;
        playSprite.on("pointerdown", (): void => {
            if (!getSoundFx()) {
                musicData.play()
                container.removeChild(playSprite as DisplayObject);
                container.addChild(pauseSprite as DisplayObject);
            } else {
                musicData.stop()
                container.removeChild(pauseSprite as DisplayObject);
                container.addChild(playSprite as DisplayObject);
            }
            setSoundFx(!getSoundFx())
        });

        pauseSprite.interactive = true;
        pauseSprite.on("pointerdown", (): void => {
            if (getSoundFx()) {
                musicData.stop()
                container.removeChild(pauseSprite as DisplayObject);
                container.addChild(playSprite as DisplayObject);
            } else {
                musicData.play()
                container.removeChild(playSprite as DisplayObject);
                container.addChild(pauseSprite as DisplayObject);
            }
            setSoundFx(!getSoundFx())
        });
    });
}

