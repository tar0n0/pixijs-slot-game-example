import { Howl } from 'howler';
import { Options, SoundSourceIds, SoundsSource, SoundType } from "../../types";

export type SoundServiceConfig = {
    options: Options[];
};

export class BaseSoundService {

    private readonly sounds: SoundsSource = {};

    private readonly soundSourceIds: SoundSourceIds = {};

    private readonly options: Options[];

    private readonly musicOptions: Options[] = [];

    private readonly soundOptions: Options[] = [];

    constructor({ options }: SoundServiceConfig) {
        this.options = [...options];

        this.options.forEach((option) => {
                this.soundOptions.push(option);
        });
    }

    public async loadResourceVersion2(): Promise<void> {
        const max = this.options.length;
        let count = 1;
        return new Promise((resolve) => {
            this.options.forEach(({ name, getSrc, src, ...option }) => {
                    this.sounds[name] = new Howl({
                        ...option,
                        src,
                    });

                    this.sounds[name].once('load', () => {
                        count++;
                        if (count === max) {
                            resolve();
                        }
                    });
            });
        });
    }

    public async loadResource(): Promise<void> {
        const max = this.options.length;
        let count = 1;
        return new Promise((resolve) => {
            this.options.forEach(({ name, getSrc, src, ...option }) => {
                    this.sounds[name] = new Howl({
                        ...option,
                        src,
                        onload: () => {
                            count++;
                            if (count === max) {
                                resolve();
                            }
                        },
                    });
            });
        });
    }

    public async init(): Promise<void> {
        await this.loadResource();
    }

    public async playWithoutStop(name: SoundType | string, startTime: number = 0): Promise<void> {
        this.sounds[name].seek(startTime);
        this.soundSourceIds[name] = this.sounds[name].play();
    }

    public async play(name: SoundType | string, startTime: number = 0): Promise<void> {
        await this.stop(name);
        if (!this.soundSourceIds[name]) {
            if (this.sounds[name]) {
                this.sounds[name].seek(startTime);
                this.soundSourceIds[name] = this.sounds[name].play();
            }
        }
    }

    public async stop(name: SoundType | string): Promise<void> {
        const id = this.soundSourceIds[name];
        if (id) {
            return new Promise((resolve) => {
                this.sounds[name].on('stop', () => resolve());
                this.sounds[name].stop(id);
                this.soundSourceIds[name] = null;
            });
        }
    }

    public mute(name: SoundType | string): void {
        if (this.sounds[name]) {
            this.sounds[name].mute(true);
        }
    }

    public unMute(name: SoundType | string): void {
        if (this.sounds[name]) {
            this.sounds[name].mute(false);
        }
    }

    public async stopAll(): Promise<void> {
        await Promise.all(this.options.map(({ name }) => this.stop(name)));
    }

    public muteAll(): void {
        this.options.forEach(({ name }) => this.mute(name));
    }

    public unMuteAll(): void {
        this.options.forEach(({ name }) => this.unMute(name));
    }

    public muteMusic(isMute: boolean): void {
        this.musicOptions.forEach(({ name }) => {
            if (this.sounds[name]) {
                this.sounds[name].mute(isMute);
            }
        });
    }

    public muteSounds(isMute: boolean): void {
        this.soundOptions.forEach(({ name }) => {
            if (this.sounds[name as SoundType]) {
                this.sounds[name as SoundType].mute(isMute);
            }
        });
    }

    public changeMusicVolume(volume: number): void {
        this.musicOptions.forEach(({ name }) => {
            if (this.sounds[name]) {
                this.sounds[name].volume(volume);
            }
        });
    }

    public changeSoundsVolume(volume: number): void {
        this.soundOptions.forEach(({ name }) => {
            if (this.sounds[name as SoundType]) {
                this.sounds[name as SoundType].volume(volume);
            }
        });
    }
}
