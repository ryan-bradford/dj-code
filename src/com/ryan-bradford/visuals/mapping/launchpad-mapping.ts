import p5 from "p5";
import { LaunchpadAdapter, LaunchpadColor } from "../midi/launchpad-adapter";
import { HypercolorRenderer } from "../renderers/shaders/hypercolor-renderer";
import { SquiggleRenderer } from "../renderers/shaders/squiggle-renderer";
import { CloudsRenderer } from "../renderers/shaders/clouds-renderer";
import { ShapesRenderer } from "../renderers/shaders/shapes-renderer";
import { DancingShape } from "../renderers/gif/dancing-shape-gif";
import { Renderer } from "../renderers/renderer";
import { PumpkinRenderer } from "../renderers/gif/pumpkin-renderer";
import { BeatAwareStack } from "../beats/beat-aware-stack";
import { EvilGoatRenderer } from "../renderers/gif/evil-goat-renderer";
import { RainbowStrobeFilter } from "../filter/strobe/rainbow-strobe-renderer";
import { Filter } from "../filter/filter";
import { BlankRenderer } from "../renderers/blank-renderer";
import { HalloweenStrobeFilter } from "../filter/strobe/halloween-strobe-renderer";
import { RedBlackStrobeFilter } from "../filter/strobe/red-black-strobe-renderer";
import { WhiteBlackStrobeFilter } from "../filter/strobe/white-black-strobe-renderer";

type Mapping = {
    renderer: Renderer | Filter;
    color: number;
    x: number;
    y: number;
};

export class LaunchpadMapping {
    private launchpadAdapter: LaunchpadAdapter;
    private rendererConfig: Array<Mapping> = [];
    private activeRenderer: [number, number, number];

    private filterConfig: Array<Mapping> = [];
    private activeFilter: [number, number, number];


    constructor(
        navigator: Navigator,
        private p5Instance: p5,
        private p5Constructors: any,
        private setActiveRenderer: (renderer: Renderer) => void,
        private setActiveFilter: (renderer: Filter) => void,
        private stack: BeatAwareStack
    ) {
        this.launchpadAdapter = new LaunchpadAdapter(navigator);
    }

    async init() {
        const blank = new BlankRenderer(this.p5Instance);
        await blank.initialize();
        this.rendererConfig.push({
            renderer: blank,
            color: LaunchpadColor.GREEN,
            x: 5,
            y: 0,
        });

        const couldRenderer = new CloudsRenderer(
            this.p5Instance,
            this.p5Constructors
        );
        await couldRenderer.initialize();
        this.rendererConfig.push({
            renderer: couldRenderer,
            color: LaunchpadColor.GREEN,
            x: 0,
            y: 0,
        });
        const hypercolorRenderer = new HypercolorRenderer(
            this.p5Instance,
            this.p5Constructors
        );
        await hypercolorRenderer.initialize();
        this.rendererConfig.push({
            renderer: hypercolorRenderer,
            color: LaunchpadColor.RED,
            x: 1,
            y: 0,
        });

        // Gif Renderers
        const dancingShapeRenderer = new DancingShape(this.p5Instance);
        await dancingShapeRenderer.initialize();
        this.rendererConfig.push({
            renderer: dancingShapeRenderer,
            color: LaunchpadColor.LIGHT_BLUE,
            x: 2,
            y: 0,
        });

        const pumpkinRenderer = new PumpkinRenderer(this.p5Instance);
        await pumpkinRenderer.initialize();
        this.rendererConfig.push({
            renderer: pumpkinRenderer,
            color: LaunchpadColor.ORANGE,
            x: 3,
            y: 0,
        });

        const goatRnederer = new EvilGoatRenderer(this.p5Instance);
        await goatRnederer.initialize();
        this.rendererConfig.push({
            renderer: goatRnederer,
            color: LaunchpadColor.RED,
            x: 4,
            y: 0,
        });


        this.filterConfig.push({
            renderer: null,
            color: LaunchpadColor.RED,
            x: 0,
            y: 1,
        })

        this.filterConfig.push({
            renderer: new WhiteBlackStrobeFilter(this.p5Instance),
            color: LaunchpadColor.RED,
            x: 0,
            y: 2,
        })

        this.filterConfig.push({
            renderer: new RedBlackStrobeFilter(this.p5Instance),
            color: LaunchpadColor.RED,
            x: 0,
            y: 3,
        })

        this.filterConfig.push({
            renderer: new HalloweenStrobeFilter(this.p5Instance),
            color: LaunchpadColor.RED,
            x: 0,
            y: 4,
        })

        this.filterConfig.push({
            renderer: new RainbowStrobeFilter(this.p5Instance),
            color: LaunchpadColor.RED,
            x: 0,
            y: 5,
        })
    }

    watchRendererConfig(config: Mapping) {
        this.launchpadAdapter.changeMidiColor(config.x, config.y, config.color);
        this.launchpadAdapter.subscribeMidiPressed(config.x, config.y, () => {
            this.setRendererActive(config);
        });
    }

    watchFilterConfig(config: Mapping) {
        this.launchpadAdapter.changeMidiColor(config.x, config.y, config.color);
        this.launchpadAdapter.subscribeMidiPressed(config.x, config.y, () => {
            this.setFilterActive(config);
        });
    }

    watchReset16() {
        this.launchpadAdapter.changeMidiColor(8, 0, LaunchpadColor.WHITE);
        this.launchpadAdapter.subscribeMidiPressed(8, 0, () => {
            this.stack.registerSixteenMarker(this.p5Instance.millis());
        });
    }

    setRendererActive(config: Mapping) {
        if (this.activeRenderer != null) {
            this.launchpadAdapter.changeMidiColor(this.activeRenderer[0], this.activeRenderer[1], this.activeRenderer[2])
        }
        this.launchpadAdapter.changeMidiColor(config.x, config.y, LaunchpadColor.WHITE);
        this.activeRenderer = [config.x, config.y, config.color]
        this.setActiveRenderer(config.renderer);
    }

    setFilterActive(config: Mapping) {
        if (this.activeFilter != null) {
            this.launchpadAdapter.changeMidiColor(this.activeFilter[0], this.activeFilter[1], this.activeFilter[2])
        }
        this.launchpadAdapter.changeMidiColor(config.x, config.y, LaunchpadColor.LIGHT_BLUE);
        this.activeFilter = [config.x, config.y, config.color]
        this.setActiveFilter(config.renderer);
    }

    async touchStarted() {
        await this.launchpadAdapter.init();
        this.rendererConfig.forEach((config) => this.watchRendererConfig(config))
        this.filterConfig.forEach((config) => this.watchFilterConfig(config))
        this.setRendererActive(this.rendererConfig[0]);
        // TOOD: Remove
        this.setFilterActive(this.filterConfig[0]);
        this.watchReset16();
    }
}
