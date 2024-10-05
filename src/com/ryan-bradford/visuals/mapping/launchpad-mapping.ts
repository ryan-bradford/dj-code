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
import { HandsRenderer } from "../renderers/gif/hands-renderer";

type Mapping = {
    renderer: Renderer | Filter;
    color: number;
    x: number;
    y: number;
};

export class LaunchpadMapping {
    private launchpadAdapter: LaunchpadAdapter;
    private rendererConfig: Array<Mapping> = [];
    private activeRenderer: [number, number, number, Renderer];
    private loadedRenderers: [number, number, number, Renderer] = null;

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
        await blank.load();
        this.rendererConfig.push({
            renderer: blank,
            color: LaunchpadColor.GREEN,
            x: 0,
            y: 0,
        });

        // Gif Renderers
        const dancingShapeRenderer = new DancingShape(this.p5Instance);
        this.rendererConfig.push({
            renderer: dancingShapeRenderer,
            color: LaunchpadColor.LIGHT_BLUE,
            x: 3,
            y: 0,
        });

        const pumpkinRenderer = new PumpkinRenderer(this.p5Instance);
        this.rendererConfig.push({
            renderer: pumpkinRenderer,
            color: LaunchpadColor.ORANGE,
            x: 4,
            y: 0,
        });

        const goatRnederer = new EvilGoatRenderer(this.p5Instance);
        this.rendererConfig.push({
            renderer: goatRnederer,
            color: LaunchpadColor.RED,
            x: 5,
            y: 0,
        });

        const handsRenderer = new HandsRenderer(this.p5Instance);
        this.rendererConfig.push({
            renderer: handsRenderer,
            color: LaunchpadColor.LIGHT_BLUE,
            x: 6,
            y: 0,
        });


        this.filterConfig.push({
            renderer: null,
            color: LaunchpadColor.WHITE,
            x: 0,
            y: 7,
        })

        this.filterConfig.push({
            renderer: new WhiteBlackStrobeFilter(this.p5Instance),
            color: LaunchpadColor.GREEN,
            x: 1,
            y: 7,
        })

        this.filterConfig.push({
            renderer: new RainbowStrobeFilter(this.p5Instance),
            color: LaunchpadColor.GREEN,
            x: 2,
            y: 7,
        })

        this.filterConfig.push({
            renderer: new RedBlackStrobeFilter(this.p5Instance),
            color: LaunchpadColor.RED,
            x: 3,
            y: 7,
        })

        this.filterConfig.push({
            renderer: new HalloweenStrobeFilter(this.p5Instance),
            color: LaunchpadColor.ORANGE,
            x: 4,
            y: 7,
        })
    }

    watchRendererConfig(config: Mapping) {
        this.launchpadAdapter.changeMidiColor(config.x, config.y, config.color);
        this.launchpadAdapter.subscribeMidiPressed(config.x, config.y, () => {
            if ((config.renderer as Renderer).isLoaded()) {
                this.setRendererActive(config);
            } else {
                this.setLoadedRenderer(config);
            }
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
            this.activeRenderer[3].unload();
        }
        this.launchpadAdapter.changeMidiColor(config.x, config.y, LaunchpadColor.WHITE);
        this.activeRenderer = [config.x, config.y, config.color, config.renderer as Renderer]
        this.setActiveRenderer(config.renderer as Renderer);
    }

    setLoadedRenderer(config: Mapping) {
        if (this.loadedRenderers != null && this.loadedRenderers[3] !== this.activeRenderer[3]) {
            this.launchpadAdapter.changeMidiColor(this.loadedRenderers[0], this.loadedRenderers[1], this.loadedRenderers[2])
            this.loadedRenderers[3].unload();
        }
        this.launchpadAdapter.changeMidiColor(config.x, config.y, LaunchpadColor.LIGHT_BLUE);
        this.loadedRenderers = [config.x, config.y, config.color, config.renderer as Renderer];
        (config.renderer as Renderer).load().then(() => {
            this.launchpadAdapter.changeMidiColor(config.x, config.y, LaunchpadColor.GREEN);
        })
    }

    setFilterActive(config: Mapping) {
        if (this.activeFilter != null) {
            this.launchpadAdapter.changeMidiColor(this.activeFilter[0], this.activeFilter[1], this.activeFilter[2])
        }
        this.launchpadAdapter.changeMidiColor(config.x, config.y, LaunchpadColor.LIGHT_BLUE);
        this.activeFilter = [config.x, config.y, config.color]
        this.setActiveFilter(config.renderer as Filter);
    }

    async touchStarted() {
        await this.launchpadAdapter.init();
        this.rendererConfig.forEach((config) => this.watchRendererConfig(config))
        this.filterConfig.forEach((config) => this.watchFilterConfig(config))
        this.setRendererActive(this.rendererConfig[0]);
        this.setFilterActive(this.filterConfig[0]);
        this.watchReset16();
    }
}
