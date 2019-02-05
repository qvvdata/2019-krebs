import Enums from './enums.js';
import MLCV_LAYERS from './mlcvLayers';

export default class LayerFormatter {
    /**
     * @param {cancerVizualisation} viz
     */
    constructor(viz) {
        /**
         * @type {cancerVizualisation}
         */
        this.viz = viz;

        /**
         * Cache for states
         * @type {Object}
         */
        this.animateCache = {};
    }

    /**
     * Generate the layer state for a story mode step.
     *
     * @param {Enums.StoryModeSteps|Enums.ExplorationModeSteps} stepId
     * @param {Object}                                          data   Cancer Data.
     */
    generateLayerState(stepId, data) {
        let state;
        let temp;

        switch (stepId) {
            /**
             * Story mode.
             */
            case Enums.StoryModeSteps.AMOUNT_OF_PEOPLE_WITH_CANCER:
                state = this.generateAmountOfPeopleWithCancerLayerState(data);
                break;

            case Enums.StoryModeSteps.MOST_PREVALENT_CANCER_TYPE:
            case Enums.StoryModeSteps.NUMBER_OF_AFFECTED_PEOPLE_BY_CANCER:
                // We can cache this state because if we have to show the same
                // organ again we don't need to do any calculations.
                if (this.animateCache[data['cancerType']]) {
                    state = this.animateCache[data['cancerType']].state;
                } else {
                    const cacheObj = this.generateCancerTypeState(data);
                    state = cacheObj.state;
                    this.animateCache[data['cancerType']] = cacheObj;
                }
                break;

            case Enums.StoryModeSteps.SURVIVAL_RATE_5_YEARS:
            case Enums.StoryModeSteps.SURVIVAL_RATE_DEPENDING_ON_SPREAD:
            case Enums.StoryModeSteps.SURVIVAL_RATE_CHANGE:
                // We have to regenerate this state because we have to modify it.
                temp = this.generateCancerTypeState(data);

                // modify changed molecules.
                this.showSurivalRateOnChangedMolecules(data, temp.changedMolecules);

                state = temp.state;
                break;

            // Return the default layer if we have nothing.
            default:
                state = JSON.parse(JSON.stringify(MLCV_LAYERS.default));

                // Delete rotation or molecules will snap
                // back to their original rotation.
                for (let i = 0; i < state.emitters.length; i++) {
                    const emitter = state.emitters[i];

                    for (let j = 0; j < emitter.molecules.length; j++) {
                        const molecule = emitter.molecules[j];
                        delete molecule.settings.rotation;
                    }
                }
                break;
        }

        return state;
    }

    /**
     * Generates the state that shows how many people
     * have cancer.
     *
     * @param  {Object} data
     * @return {Object}
     */
    generateAmountOfPeopleWithCancerLayerState(data) {
        // Clone states because we need to leave them untouched
        // as we do edits for this particular state.
        const state = JSON.parse(JSON.stringify(MLCV_LAYERS.default));
        const coloringCoordinates = this.calulcateColoringCoordinatesPrevalenceAmount(data['totalAmountOfCancerDiagnosesRelative']);

        for (let i = 0; i < state.emitters.length; i++) {
            const emitter = state.emitters[i];

            for (let j = 0; j < emitter.molecules.length; j++) {
                const molecule = emitter.molecules[j];
                const globalPosY = (emitter.settings.y + molecule.settings.y) * this.viz.mlcv.defaultScale;

                if (globalPosY >= coloringCoordinates.top && globalPosY <= coloringCoordinates.bottom) {
                    molecule.settings.color = this.viz.settings.cancerMoleculeColor;
                } else if (molecule.settings.opacity > 0.5) {
                    molecule.settings.opacity = 0.5;
                }

                // Delete rotation or molecules will snap
                // back to their original rotation.
                delete molecule.settings.rotation;

                // Do not break out of the loop.
                // we must go over all emitters because
                // their spawn radius can be very large.
            }
        }

        return state;
    }

    showSurivalRateOnChangedMolecules(data, molecules) {
        molecules.sort((a, b) => {
            const aY = a.settings.y;
            const bY = b.settings.y;
            if (aY < bY) {
                return 1;
            }

            if (aY > bY) {
                return -1;
            }

            return 0;
        });

        // Calculate how many we have to turn green.
        const amountOfMoleculestToTurnGreen = Math.round(molecules.length / 100 * data['survivalRates']['2008-2012']['ageGroup'][data['ageGroup']]['lower95pct']);
        let greenCounter = 0;

        for (let i = 0; i < molecules.length; i++) {
            const molecule = molecules[i];

            delete molecule.settings.rotation;

            if (greenCounter < amountOfMoleculestToTurnGreen) {
                molecule.settings.color = this.viz.settings.survivalColor;
            }

            greenCounter++;
        }
    }

    /**
     * Generates a state that moves surrounding
     * molecules to the position of the selected organ type.
     *
     * returns the an object with the state and a reference
     * to the molecules that have been moved (changedMolecules).
     *
     * @param  {Object} data
     * @return {{
     *         state: Object,
     *         changedMolecules: Array.<Object>
     * }}
     */
    generateCancerTypeState(data) {
        let counter = 0;
        const baseDelay = 3;
        const changedMolecules = [];
        let cancerCenterEmitter;

        // Clone the layers.
        const state = JSON.parse(JSON.stringify(MLCV_LAYERS.default));
        const cancerLayer = JSON.parse(JSON.stringify(MLCV_LAYERS.cancers[data['cancerType']]));

        // Get all the molecules from the cancer
        const cancerMolecules = [];
        for (let i = 0; i < cancerLayer.emitters.length; i++) {
            const emitter = cancerLayer.emitters[i];

            for (let j = 0; j < emitter.molecules.length; j++) {
                const molecule = emitter.molecules[j];

                molecule.settings.x += emitter.settings.x;
                molecule.settings.y += emitter.settings.y;
                cancerMolecules.push(molecule);
            }

            if (emitter.id === data['cancerType']) {
                emitter.molecules = [];
                emitter.settings.moleculeAmount = 0;
                cancerCenterEmitter = emitter;
            }
        }

        // get all molecules.
        let stateMolecules = [];
        for (let i = 0; i < state.emitters.length; i++) {
            const emitter = state.emitters[i];

            for (let j = 0; j < emitter.molecules.length; j++) {
                const molecule = emitter.molecules[j];
                molecule.emitter = emitter;
            }

            stateMolecules = stateMolecules.concat(emitter.molecules);
        }

        // Sort all molecules from closest to furthest from emitter center.
        stateMolecules.sort((a, b) => {
            const aGlbPosX = a.settings.x + a.emitter.settings.x;
            const aGlbPosY = a.settings.y + a.emitter.settings.y;

            const aDistX = cancerCenterEmitter.settings.x - aGlbPosX;
            const aDistY = cancerCenterEmitter.settings.y - aGlbPosY;

            const bGlbPosX = b.settings.x + b.emitter.settings.x;
            const bGlbPosY = b.settings.y + b.emitter.settings.y;

            const bDistX = cancerCenterEmitter.settings.x - bGlbPosX;
            const bDistY = cancerCenterEmitter.settings.y - bGlbPosY;

            const distA = Math.sqrt(
                (aDistX * aDistX) + (aDistY * aDistY)
            );

            const distB = Math.sqrt(
                (bDistX * bDistX) + (bDistY * bDistY)
            );

            if (distA < distB) return -1;

            if (distA > distB) return 1;

            return 0;
        });

        for (let i = 0; i < stateMolecules.length; i++) {
            const molecule = stateMolecules[i];

            // Skip each second molecule to avoid holes being created around the center.
            if (i % 2 === 0 && counter < cancerMolecules.length) { // Set molecule to cancer state.
                const cancerMolecule = cancerMolecules[counter];

                const disX = cancerMolecule.settings.x - (molecule.settings.x + molecule.emitter.settings.x);
                const disY = cancerMolecule.settings.y - (molecule.settings.y + molecule.emitter.settings.y);

                const newPosX = molecule.settings.x + disX;
                const newPosY = molecule.settings.y + disY;

                molecule.settings = JSON.parse(JSON.stringify(cancerMolecules[counter].settings));

                molecule.settings.x = newPosX;
                molecule.settings.y = newPosY;

                // Add a delay to this molecule for animation purposes.
                molecule.delay = baseDelay * counter;
                counter++;

                changedMolecules.push(molecule);
            } else if (molecule.settings.opacity > 0.5) {
                molecule.settings.opacity = 0.25;
            }

            // Delete rotation or molecules will snap back
            // to their original rotation.
            delete molecule.settings.rotation;
        }

        state.emitters.push(cancerCenterEmitter);

        return {
            state: state,
            changedMolecules: changedMolecules
        };
    }

    /**
     * Calculates the coordinates to know where between
     * we have to colour molecules.
     *
     * @param  {Nunmber} coloringFactor How much of the viz do we need to color in.
     * @return {{
     *         top: Number,
     *         bottom: Number
     * }}
     */
    calulcateColoringCoordinatesPrevalenceAmount(coloringFactor) {
        const coordinates = {};
        const heightAmount = this.viz.mlcv.pixiApp.screen.height * coloringFactor / 100;
        const halfHeightAmount = heightAmount / 2;
        let leftOver = 0;

        // The center is located 23% of the height. It is where the heart is located.
        const center = this.viz.mlcv.pixiApp.screen.height / 100 * 23;

        // If the top falls below 0 we must append
        // the remaining height to the bottom.
        if (center - halfHeightAmount < 0) {
            leftOver = 0 - (center - halfHeightAmount);
            coordinates.top = 0;
        } else {
            coordinates.top = center - halfHeightAmount;
        }

        coordinates.bottom = center + halfHeightAmount + leftOver;

        return coordinates;
    }
}
