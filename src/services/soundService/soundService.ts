import { Options } from "../../types";
import {BaseSoundService} from "./baseSoundService";

const SoundTypes = {
    win: 'win',
    reelEnd: 'reelEnd'
};

const options = [
    {
        name: SoundTypes.win,
        src: "sounds/reel_stop.wav",
        autoplay: false,
        html5: true,
        loop: false,
    },
    {
        src: "sounds/you_won.mp3",
        name: SoundTypes.reelEnd,
        autoplay: false,
        html5: true,
        loop: false,
    },
];

class SoundService extends BaseSoundService {
    constructor(props: { options: { name: string; src: string; autoplay: boolean; html5: boolean; loop: boolean; }[] | Options[]; }) {
        super(props);
    }
}

const soundService = new SoundService({
    options,
});

export { SoundTypes as soundTypes, soundService };
