import * as PIXI from 'pixi.js';
import { Howl } from 'howler';

import { getSoundFx } from "./stateManager";
import { PixiContainerType, Reel } from "./types";
import { soundService } from "./services/soundService/soundService";
import { getRandomPositionsReels, mod, newSymbolSprite, setupSoundIcons } from "./helpers";
import { canvas_height, canvas_width, RESOURCES_PATHS, resourcesToLoad } from "./constats";


const app: PIXI.Application = new PIXI.Application({
    width: canvas_width,
    height: canvas_height,
    backgroundColor : 0x33FFC1,
    antialias: true
});

const progressBarContainer: Element | null = document.querySelector('.container');
const progressBar: Element | null = document.querySelector('.fill');

document.body.appendChild(app.view as unknown as Node);


const loadingContainer: PixiContainerType = new PIXI.Container();
const gameContainer: PixiContainerType = new PIXI.Container;


app.stage.addChild(loadingContainer as PIXI.DisplayObject, gameContainer as PIXI.DisplayObject);

const preloaderBG: Promise<PIXI.Texture> =  PIXI.Assets.load(RESOURCES_PATHS.preload);

preloaderBG.then((response: PIXI.Texture<PIXI.Resource>): void => {
    // @ts-ignore
    progressBarContainer.style.display = 'none'
    drawPreloader(response);
})
function drawPreloader(textureData: PIXI.Texture): void {
    let preloaderBGSprite:PIXI.Sprite = new PIXI.Sprite(textureData);
    preloaderBGSprite.anchor.set(0.5, 0);
    preloaderBGSprite.x = app.screen.width / 2;
    preloaderBGSprite.y = 0;

    preloaderBGSprite.height = app.screen.height;
    preloaderBGSprite.width = preloaderBGSprite.height;

    preloaderBGSprite.interactive = true;

    preloaderBGSprite.addListener("pointerdown", function() {
        loadingContainer.visible = false;

        // @ts-ignore
        progressBarContainer.style.display = 'block'
        // @ts-ignore
        progressBar.style.width = '0'
        let count: number = 0;
        soundService.init();
         resourcesToLoad.map((resource: string): void => {
            PIXI.Assets.load(resource).then((): void => {
                ++count
                // @ts-ignore
                progressBar.style.width = `${count * (100 / resourcesToLoad.length)}%`
                if(count === resourcesToLoad.length) {
                    // @ts-ignore
                    progressBarContainer.style.display = 'none'
                    gameContainer.visible = true;
                    setupSoundIcons(gameContainer, backgroundMusic)
                    initGameUi();

                }
            })
        });

    });
    
    loadingContainer.addChild(preloaderBGSprite as PIXI.DisplayObject);
}

(function(): void {
    const wf: HTMLScriptElement = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = true;
    const s: HTMLScriptElement = document.getElementsByTagName('script')[0];
    s.parentNode?.insertBefore(wf, s);
})();


let snd_reel_stop: Howl = new Howl({
    src: ["sounds/reel_stop.wav"],
    preload: true,
    onload: function(): void {
        console.log("Sound READY")
    }
});

let snd_win: Howl = new Howl({
    src: ["sounds/you_won.mp3"],
    preload: true,
    onload: function(): void {
        console.log("Win sound READY");
    }
});

let slot_reels_count: number = 3;
let slot_rows_count: number = 1;

let symbols_index: string[] = ["R1", "R2", "R3"];

let reels_config: string[][] = [];
reels_config[0] = ["R1", "R2", "R3"]; // Reel 1 symbols
reels_config[1] = ["R2", "R3", "R1"]; // Reel 2 symbols
reels_config[2] = ["R3", "R1", "R2"]; // Reel 3 symbols

const slot_symbols_sprites: PIXI.Texture[] = [];

function initializeSymbolTextures(): void {
    slot_symbols_sprites[0] = PIXI.utils.TextureCache[RESOURCES_PATHS.symbol_1];
    slot_symbols_sprites[1] = PIXI.utils.TextureCache[RESOURCES_PATHS.symbol_2];
    slot_symbols_sprites[2] = PIXI.utils.TextureCache[RESOURCES_PATHS.symbol_3];
}

let symbol_size_w: number = 150;
let symbol_size_h: number = 150;
let reels_spacing: number = 20;
let rows_spacing: number = 5;
let spinSpeed: number = 18;


let slot_area_w: number = reels_spacing + (symbol_size_w + reels_spacing) * slot_reels_count;
let slot_area_h: number = rows_spacing + (symbol_size_h + rows_spacing) * slot_rows_count;


let reels_container_bottom_padding: number = 100;

let new_reels_positions: number[] = [];

let uiSlotBg: PIXI.Graphics;


let spinButtonSection: PIXI.Container<PIXI.DisplayObject> = new PIXI.Container();

const backgroundMusic = new Howl({
    src: ["sounds/music.mp3"],
    loop: true,
    preload: true,
    onload: function(): void {
        console.log("Sound READY")
    }
})
function initGameUi(): void {
    // Slot section
    uiSlotBg = new PIXI.Graphics();
    uiSlotBg.beginFill(0x000000);
    uiSlotBg.drawRoundedRect(0, 0, slot_area_w, slot_area_h, 5);
    uiSlotBg.endFill();
    uiSlotBg.alpha = 0.40;
    uiSlotBg.x = app.screen.width / 2 - slot_area_w / 2;
    uiSlotBg.y = app.screen.height - uiSlotBg.height - reels_container_bottom_padding;

    let borderThickness = 7;
    let uiSlotBorder = new PIXI.Graphics();
    uiSlotBorder.lineStyle(borderThickness, 0xffffff, 1, 0);
    uiSlotBorder.drawRoundedRect(0, 0, slot_area_w + 2 * borderThickness, slot_area_h + 2 * borderThickness, 30);
    uiSlotBorder.x = uiSlotBg.x - borderThickness;
    uiSlotBorder.y = uiSlotBg.y - borderThickness;

    let uiSymbolSlots: PIXI.Graphics = new PIXI.Graphics();
    uiSymbolSlots.x = uiSlotBg.x + reels_spacing;
    uiSymbolSlots.y = uiSlotBg.y + rows_spacing;

    if(getSoundFx()) {
        backgroundMusic.play();
    }
    for (let i: number = 0; i < slot_reels_count; i++) {
        let symbolSlotX: number = i * (symbol_size_w + reels_spacing);

        for (let j: number = 0; j < slot_rows_count; j++) {
            let symbolSlotY: number = j * (symbol_size_h + rows_spacing);

            let symbolSlot: PIXI.Graphics = new PIXI.Graphics();
            symbolSlot.beginFill(0x000000);
            symbolSlot.drawRoundedRect(0, 0, symbol_size_w, symbol_size_h, 20);
            symbolSlot.endFill();
            symbolSlot.alpha = 0;
            symbolSlot.position.set(symbolSlotX, symbolSlotY);

            uiSymbolSlots.addChild(symbolSlot as PIXI.DisplayObject);
        }
    }

    let ui_arena_bg: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.from('images/backgrounds/slot-area-bg-01.jpg'));
    ui_arena_bg.anchor.set(0.5, 0);
    ui_arena_bg.x = app.screen.width / 2;
    ui_arena_bg.y = 0;

    let ui_arena_bg_ratio: number = ui_arena_bg.width / ui_arena_bg.height;
    ui_arena_bg.height = app.screen.height;
    ui_arena_bg.width = ui_arena_bg.height * ui_arena_bg_ratio;


    gameContainer.addChild(ui_arena_bg as PIXI.DisplayObject, uiSlotBg as PIXI.DisplayObject, uiSymbolSlots as PIXI.DisplayObject, uiSlotBorder as PIXI.DisplayObject, spinButtonSection as PIXI.DisplayObject);

    initSlot();
}

function initSlot(): void {

    initializeSymbolTextures();

    // Build reels with the symbol sprites
    let initial_reels_positions = getRandomPositionsReels(slot_reels_count, reels_config);

    let reels: Reel[] = [];

    let reelContainer: PIXI.Container<PIXI.DisplayObject> = new PIXI.Container();

    let slot_clipping: PIXI.Graphics = new PIXI.Graphics();
    slot_clipping.beginFill(0xff0066,1);
    slot_clipping.drawRect(0, 0, slot_area_w, slot_area_h);
    slot_clipping.endFill();
    slot_clipping.alpha = 0.25;
    slot_clipping.x = 0;
    slot_clipping.y = symbol_size_h;

    reelContainer.addChild(slot_clipping as PIXI.DisplayObject);
    reelContainer.mask = slot_clipping;

    for( let i: number = 0; i < slot_reels_count; i++)	{
        let rc: PIXI.Container<PIXI.DisplayObject> = new PIXI.Container();

        rc.x = reels_spacing + i * (symbol_size_w + reels_spacing);
        rc.y = 0;


        reelContainer.addChild(rc as PIXI.DisplayObject);

        let reel:{    container: PIXI.Container<PIXI.DisplayObject>;
            symbols: PIXI.Sprite[];
            current_index: number;
            position: number;
            previousPosition: number;
            blur: PIXI.BlurFilter;} = {
            container: rc,
            symbols:[] as PIXI.Sprite[],
            current_index:0,
            position:0,
            previousPosition:0,
            blur: new PIXI.filters.BlurFilter()
        };

        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        let starting_reel_position = initial_reels_positions[i];
        reel.current_index = starting_reel_position;

        let k: number = mod((starting_reel_position - 1), reels_config[i].length);

        let offClip_y: number = 0;// -(symbol_size_h + rows_spacing);

        for(let j: number = 0; j <= slot_rows_count; j++) {

            if (k > reels_config[i].length-1)
                k = mod(k, reels_config[i].length);

            let s_sprite: PIXI.Sprite = newSymbolSprite(i, k, reels_config, symbols_index, slot_symbols_sprites);

            s_sprite.x = 0;
            s_sprite.y = offClip_y + j * (rows_spacing + symbol_size_h);
            s_sprite.width = symbol_size_w;
            s_sprite.height = symbol_size_h;

            reel.symbols.push(s_sprite);

            rc.addChild(s_sprite as PIXI.DisplayObject);

            k++;
        }

        reels.push(reel);
    }

    reelContainer.x = uiSlotBg.x;
    reelContainer.y = uiSlotBg.y - symbol_size_h;

    gameContainer.addChild(reelContainer as PIXI.DisplayObject);

    let running: boolean = false;

    const spinButtonTextStyle: PIXI.TextStyle = new PIXI.TextStyle({
        fontFamily: 'Changa',
        fontSize: 30,
        align: 'center',
        fill: ['#33cc33']
    });


    let buttonCornerRadius: number = 10;
    let spinButton: PIXI.Graphics = new PIXI.Graphics();
    spinButton.beginFill(0x595959); //black: 595959 / red: ff0000
    spinButton.drawRoundedRect(0, 0, 120, 40, buttonCornerRadius);
    spinButton.endFill();
    spinButton.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    spinButton.x = app.screen.width / 2 - spinButton.width/2;
    spinButton.y = app.screen.height - spinButton.height -30;
    spinButton.interactive = true;
    // spinButton.buttonMode = true;

    spinButton
        .on('pointerdown', initiateSpin)
        .on('pointerover', highlightSpinButton)
        .on('pointerout', resetSpinButtonHighlight);

    function initiateSpin(): void {
        if (running) {
            return;
        }

        spinText.style.fill = '#808080';

        spinButtonBorder.clear();
        spinButtonBorder.lineStyle(borderThickness, 0x808080, 1, 1);
        spinButtonBorder.drawRoundedRect(0, 0, spinButton.width, spinButton.height, buttonCornerRadius);

        spinButton.interactive = false;
        startSpin();
    }

    function highlightSpinButton(): void {
        spinText.style.fill = '#85e085';

        spinButtonBorder.clear();
        spinButtonBorder.lineStyle(borderThickness, 0x85e085, 1, 1);
        spinButtonBorder.drawRoundedRect(0, 0, spinButton.width, spinButton.height, buttonCornerRadius);
    }
    function resetSpinButtonHighlight(): void {
        spinText.style.fill = '#33cc33';

        spinButtonBorder.clear();
        spinButtonBorder.lineStyle(borderThickness, 0x33cc33, 1, 1);
        spinButtonBorder.drawRoundedRect(0, 0, spinButton.width, spinButton.height, buttonCornerRadius);
    }

    let spinText:PIXI.Text = new PIXI.Text("SPIN", spinButtonTextStyle);
    spinText.anchor.set(0.5, 0.5);
    spinText.x = spinButton.width/2;
    spinText.y = spinButton.height/2;

    let borderThickness:number = 5;
    let spinButtonBorder: PIXI.Graphics = new PIXI.Graphics();
    spinButtonBorder.lineStyle(borderThickness, 0x33cc33, 1, 1);
    spinButtonBorder.drawRoundedRect(0, 0, spinButton.width, spinButton.height, buttonCornerRadius);
    spinButtonBorder.x = spinButton.x;
    spinButtonBorder.y = spinButton.y;


    spinButton.addChild(spinText as PIXI.DisplayObject);

    spinButtonSection.addChild(spinButton as PIXI.DisplayObject, spinButtonBorder as PIXI.DisplayObject);

    let spin_full_pass_count: number[] = [];
    let continue_spin_reel: any[] = [];

    function startSpin() {
        snd_win.stop()
        if (running) {
            return;
        }


        running = true;

        spin_full_pass_count = [0,0,0];

        continue_spin_reel = [true, true, true];

        new_reels_positions = getRandomPositionsReels(slot_reels_count, reels_config);

        console.log("===== New Spin =====");
        console.log("      new_reels_positions = "+new_reels_positions);
    }

    function reelsComplete(): void {
        running = false;

        spinText.style.fill = '#33cc33';

        spinButtonBorder.clear();
        spinButtonBorder.lineStyle(borderThickness, 0x33cc33, 1, 1);
        spinButtonBorder.drawRoundedRect(0, 0, spinButton.width, spinButton.height, buttonCornerRadius);

        spinButton.interactive = true;

        let reelWindow = generateReelWindow(new_reels_positions);

        resolveSpinPayout(reelWindow);
        function resolveSpinPayout(final_reel_window: number[][]) {
            const flattenedReelWindowData: number[] =   final_reel_window.flat();
            if(flattenedReelWindowData.every(item => item === flattenedReelWindowData[0])) {
                if(getSoundFx()) {
                    snd_win.play();
                }
            }
        }

    }

    function generateReelWindow(spin_result_idxs: number[]) {

        let tmp_reel_window = [];

        for (let i: number = 0; i < slot_reels_count; i++){
            let idx: number = spin_result_idxs[i];
            let tmp_spin_results = new Array();

            for (let j: number = 0; j < slot_rows_count; j++) {

                let final_idx: number = mod(idx, reels_config[i].length)
                tmp_spin_results.push( reels_config[i][final_idx] );
                idx++;
            }

            tmp_reel_window.push(tmp_spin_results.slice());
        }
        return tmp_reel_window;
    }

    app.ticker.add(function(): void {

        if (!running)
            return;


        for (let i: number = 0; i < reels.length; i++) {

            // if the reel has already stopped spinning, skip the spin for that reel
            if (!continue_spin_reel[i])
                continue;

            let target_index = new_reels_positions[i];

            for (let j: number = 0; j < reels[i].symbols.length; j++) {
                reels[i].symbols[j].y += spinSpeed;
            }

            if (reels[i].symbols[reels[i].symbols.length-1].y >= slot_clipping.y + slot_clipping.height ) {
                let new_current_index: number = mod((reels[i].current_index - 1), reels_config[i].length);
                reels[i].current_index = new_current_index;

                let new_symbol_index: number = mod((new_current_index-1), reels_config[i].length);

                let s_sprite: PIXI.Sprite = newSymbolSprite(i, new_symbol_index, reels_config, symbols_index, slot_symbols_sprites);
                s_sprite.x = 0;
                s_sprite.y = 0;
                s_sprite.width = symbol_size_w;
                s_sprite.height = symbol_size_h;


                reels[i].container.removeChild(reels[i].symbols[reels[i].symbols.length-1] as PIXI.DisplayObject);
                (reels[i].symbols[reels[i].symbols.length-1]).destroy();
                reels[i].symbols.pop();

                reels[i].symbols.unshift(s_sprite);

                reels[i].container.addChild(s_sprite as PIXI.DisplayObject);

                if (--spin_full_pass_count[i] <= 0
                    && new_current_index == target_index
                    && !continue_spin_reel[i-1]) {

                    continue_spin_reel[i] = false;

                    if (getSoundFx()) {
                        snd_reel_stop.play();
                    }
                }
            }

        }

        if (!continue_spin_reel[0] && !continue_spin_reel[1] && !continue_spin_reel[2]) {
            reelsComplete();
        }

    });

    // Start the 1st spin automatically
    //startNextRound();

}


