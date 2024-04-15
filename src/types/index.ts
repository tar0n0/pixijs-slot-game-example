import { Howl, HowlOptions } from 'howler';
import { Container, DisplayObject, Sprite} from "pixi.js";

export type Reel = {
    symbols: Sprite[];
    current_index: number;
    container: Container<DisplayObject>;
};

export type PixiContainerType<T extends DisplayObject = DisplayObject> = Container<T>;

export type ObjectDictionary<Value = any> = {
    [key: string | number]: Value;
};


export enum SoundType {
    Music = 'music',
    Win = 'win',
}

export type SoundsSource = ObjectDictionary<Howl>

export type SoundSourceIds = ObjectDictionary<number | null>

export type Options = HowlOptions & {
    name: SoundType | string;
    getSrc?: (lang: string) => string;
}
