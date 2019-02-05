import cancerTypeData from './data/krebsarten_df.csv';
import Enums from './enums.js';
import Helpers from './Helpers';
import LayerFormatter from './LayerFormatter';
import Localization from './Localization';
import MoleculeVizualisation from '../node_modules/molecule-vizualisation/dist/MoleculeVizualisation.min';
import MLCV_LAYERS from './mlcvLayers';
import StoryModeTextGenerator from './StoryModeTextGenerator';
import survivalData from './data/ueberleben_df.csv';

/**
 * Complete cancer vizualisation for the world cancer day
 * article 2019 at addendum.
 *
 * This class depends together with the css to work.
 */
export default class cancerVizualisation {
    constructor(document, holder, customSettings, mlcvSettings) {
        /**
         * @type {DOM}
         */
        this.document = document;

        /**
         * @type {MoleculeVizualisation}
         */
        this.mlcv = new MoleculeVizualisation(document, holder, mlcvSettings);

        /**
         * @type {Object}
         */
        this.defaultSettings = {
            // Two languages are supported; EN/DE
            lang: Enums.Lang.DE,

            // Color in numeric hex code.
            cancerMoleculeColor: 0xFF3A29,

            // Color in numeric hex code.
            survivalColor: 0x29ce21
        };

        /**
         * @type {Object}
         */
        this.settings = Helpers.mergeDeep(this.defaultSettings, customSettings);

        /**
         * @type {Localization}
         */
        this.localization = new Localization(this.settings.lang);

        /**
         * @type {LayerFormatter}
         */
        this.layerFormatter = new LayerFormatter(this);

        /**
         * @type {StoryModeTextGenerator}
         */
        this.storyModeTextGenerator = new StoryModeTextGenerator(this);

        /**
         * Reference to all layers.
         * @type {Object}
         */
        this.layers = {
            arrowHolder: null,
            chartHolder: this.document.querySelector(holder),
            cancerNameHolder: null,
            currentStepNr: null,
            interactiveElementsHolder: null,
            filtersHolder: null,
            markersHolder: null,
            markers: {},
            storyModeSlider: null,
            storyModeTextHolder: null
        };

        /**
         * @type {Array.<{
         *       localeToken: String,
         *       value: Enum.Gender
         * }>}
         */
        this.genderFilters = [
            {
                localeToken: 'words.all',
                value: Enums.Gender.ALL
            },

            {
                localeToken: `gender.${Enums.Gender.MALE}`,
                value: Enums.Gender.MALE
            },

            {
                localeToken: `gender.${Enums.Gender.FEMALE}`,
                value: Enums.Gender.FEMALE
            }
        ];

        /**
         * @type {Array.<{
         *       localeToken: String|undefined,
         *       value: Enum.Gender
         * }>}
         */
        this.ageFilters = [
            {
                localeToken: 'words.all',
                value: Enums.AgeGroup.ALL
            },

            {
                value: Enums.AgeGroup['0-44']
            },

            {
                value: Enums.AgeGroup['45-59']
            },

            {
                value: Enums.AgeGroup['60-74']
            },

            {
                value: Enums.AgeGroup['75+']
            }
        ];

        /**
         * Selected gender.
         * @type {Enums.Gender}
         */
        this.gender = Enums.Gender.ALL;

        /**
         * Reference to selected gender btn element.
         * @type {DOM}
         */
        this.selectedGenderFilterBtn = null;

        /**
         * Selected age group.
         * @type {Enums.AgeGroup}
         */
        this.ageGroup = Enums.AgeGroup.ALL;

        /**
         * Reference to selected age group btn element.
         * @type {DOM}
         */
        this.selectedAgeGroupFilterBtn = null;

        /**
         * Most prevalent cancer data based on filters.
         * @type {Object}
         */
        this.mostPrevalentCancerData = null;

        /**
         * Data for the manual selected cancer.
         * @type {Object}
         */
        this.selectedCancerData = null;

        /**
         * Available story modes.
         * @type {Object.<Array>}
         */
        this.storyModes = {
            [Enums.StoryModes.BY_FILTERS]: [],
            [Enums.StoryModes.BY_CANCER_TYPE]: []
        };

        /**
         * Current running story mode type.
         * @type {Enums.StoryModes}
         */
        this.currentStoryModeType = Enums.StoryModes.BY_FILTERS;

        /**
         * Current step in the story mode.
         * @type {Number}
         */
        this.currentStoryModeStep = 0;

        // Choose a number formatter.
        if (this.settings.lang === 'de') {
            this.numberFormatter = new Intl.NumberFormat('de-AT');
        } else {
            this.numberFormatter = new Intl.NumberFormat('en-GB');
        }

        /**
         * @type {Boolean}
         */
        this.initialized = false;
    }

    /**
     * Init.
     */
    init() {
        // Add all the steps first because element creation depends on it.
        // Change the order if you want to change the order of the story.
        this.storyModes[Enums.StoryModes.BY_FILTERS].push(Enums.StoryModeSteps.AMOUNT_OF_PEOPLE_WITH_CANCER);
        this.storyModes[Enums.StoryModes.BY_FILTERS].push(Enums.StoryModeSteps.MOST_PREVALENT_CANCER_TYPE);
        this.storyModes[Enums.StoryModes.BY_FILTERS].push(Enums.StoryModeSteps.SURVIVAL_RATE_5_YEARS);
        this.storyModes[Enums.StoryModes.BY_FILTERS].push(Enums.StoryModeSteps.SURVIVAL_RATE_DEPENDING_ON_SPREAD);
        this.storyModes[Enums.StoryModes.BY_FILTERS].push(Enums.StoryModeSteps.SURVIVAL_RATE_CHANGE);

        // Create the exploration story steps.
        this.storyModes[Enums.StoryModes.BY_CANCER_TYPE].push(Enums.StoryModeSteps.NUMBER_OF_AFFECTED_PEOPLE_BY_CANCER);
        this.storyModes[Enums.StoryModes.BY_CANCER_TYPE].push(Enums.StoryModeSteps.SURVIVAL_RATE_5_YEARS);
        this.storyModes[Enums.StoryModes.BY_CANCER_TYPE].push(Enums.StoryModeSteps.SURVIVAL_RATE_DEPENDING_ON_SPREAD);
        this.storyModes[Enums.StoryModes.BY_CANCER_TYPE].push(Enums.StoryModeSteps.SURVIVAL_RATE_CHANGE);

        this.formatData();

        this.setupLayers();

        this.mlcv.init()
            .importDefaultState(MLCV_LAYERS.default)
            .startRenderLoop();

        // Create markers for all the cancer types.
        // this must happen after the default state has
        // been imported to the mlcv or otherwise
        // I cannot find the positions of the cancers.
        this.initMarkers();

        this.initialized = true;
    }

    /**
     * I setup all the required elements and layers here.
     */
    setupLayers() {
        const interactiveElementsHolder = this.document.createElement('div');
        interactiveElementsHolder.setAttribute('class', 'interactive-elements-holder');

        this.layers.chartHolder.appendChild(interactiveElementsHolder);
        this.layers.interactiveElementsHolder = interactiveElementsHolder;

        const markersHolder = this.document.createElement('div');
        markersHolder.setAttribute('class', 'markers-holder');
        this.layers.chartHolder.appendChild(markersHolder);
        this.layers.markersHolder = markersHolder;

        const cancerNameHolder = this.document.createElement('div');
        cancerNameHolder.classList.add('cancer-name-holder');
        interactiveElementsHolder.appendChild(cancerNameHolder);
        this.layers.cancerNameHolder = cancerNameHolder;

        const arrowHolder = this.document.createElement('div');
        arrowHolder.classList.add('arrow-holder');
        arrowHolder.innerHTML = '<img src="./assets/arrow.svg" />';
        arrowHolder.innerHTML += `<div class="arrow-text">${this.localization.localize('sentences.chooseManually')}</div>`;
        this.layers.chartHolder.appendChild(arrowHolder);
        this.layers.arrowHolder = arrowHolder;

        // Create the filters.
        this.initFilters();

        // Create the slider.
        this.initStoryModeSlider();
    }

    /**
     * Create clickable markers for all the cancer types.
     */
    initMarkers() {
        const screen = this.mlcv.pixiApp.screen;

        Object.keys(MLCV_LAYERS.cancers).forEach(key => {
            const layer = MLCV_LAYERS.cancers[key];
            let zoomTarget = null;

            // Find the zoom target.
            for (let i = 0; i < layer.emitters.length; i++) {
                const emitter = layer.emitters[i];

                if (emitter.id === key) {
                    zoomTarget = emitter;
                    break;
                }
            }

            // Only create a label if we have a target to zoom on.
            if (zoomTarget !== null) {
                const markerHolder = this.document.createElement('div');
                markerHolder.setAttribute('class', 'marker-holder');

                // Create label element.
                const markerLabel = this.document.createElement('div');
                markerLabel.innerHTML = key;
                markerLabel.setAttribute('class', 'marker-label');
                markerLabel.setAttribute('data-cancer', zoomTarget.id);

                // Create dot element.
                const markerDot = this.document.createElement('div');
                markerDot.setAttribute('class', 'marker-dot');
                markerDot.setAttribute('data-cancer', zoomTarget.id);

                // Calculate placement.
                const left = (zoomTarget.settings.x * this.mlcv.defaultScale) + (screen.width / 2) - this.mlcv.pixiApp.stage.width / 2;
                const top = (zoomTarget.settings.y * this.mlcv.defaultScale) + (screen.height / 2) - this.mlcv.pixiApp.stage.height / 2;

                markerHolder.setAttribute('style', [
                    `left: ${left}px`,
                    `top: ${top}px`
                ].join(';'));

                // Set the position of the label.
                markerLabel.setAttribute('style', this.getPositionMarkerLabel(key).join(';'));

                // Add markers to holder.
                markerHolder.appendChild(markerDot);
                markerHolder.appendChild(markerLabel);

                // Bind events.
                markerDot.onclick = this.startStory.bind(this, Enums.StoryModes.BY_CANCER_TYPE, key);
                markerLabel.onclick = this.startStory.bind(this, Enums.StoryModes.BY_CANCER_TYPE, key);

                this.layers.markers[key] = markerHolder;
                this.layers.markersHolder.appendChild(markerHolder);
            }
        });

        // Run the filter after markers have been inited so
        // the correct ones show for the current selected gender.
        this.filterMarkersOnGender(this.gender);

        // Markers are initially hidden.
        this.hideMarkers();
    }

    /**
     * Some labels need to be positioned to the left
     * and others to the right. we decide it here.
     *
     * @param  {Enums.Cancers} cancerType
     * @return {Array}
     */
    getPositionMarkerLabel(cancerType) {
        let pos = [];

        switch (cancerType) {
            case Enums.Cancers.BREASTCANCER:
            case Enums.Cancers.BLADDER:
            case Enums.Cancers.TESTICLE:
                pos = ['right: 10px'];
                break;

            default:
                pos = ['left: 10px'];
                break;
        }

        return pos;
    }

    /**
     * Create the slider elements.
     */
    initStoryModeSlider() {
        // Create the holder.
        const slider = this.document.createElement('div');
        slider.setAttribute('class', 'story-mode-slider');

        // Create the text holder.
        const textHolder = this.document.createElement('div');
        slider.appendChild(textHolder);
        this.layers.storyModeTextHolder = textHolder;

        // Create the counter.
        slider.appendChild(this.createStoryModeCounterElement());

        slider.appendChild(this.createStoryModeControls());

        // Save reference.
        this.layers.storyModeSlider = slider;

        // Must come after the slider is set to the layer.
        this.hideStoryModeSlider();

        // Append after hiding.
        this.layers.interactiveElementsHolder.appendChild(slider);
    }

    /**
     * Create the elements for the counter for the story mode.
     *
     * @return {DOM}
     */
    createStoryModeCounterElement() {
        // Create holder element.
        const holder = this.document.createElement('div');
        holder.setAttribute('class', 'story-mode-counter-holder');

        // Create the current story mode step index element.
        const currentNr = this.document.createElement('span');
        currentNr.setAttribute('class', 'current-story-mode-step');
        currentNr.innerHTML = this.currentStoryModeStep + 1; // +1 to offset 0-based indexing.

        // Create the separator element.
        const separator = this.document.createElement('span');
        separator.innerHTML = '/';

        // Create the total step amount element.
        const totalNr = this.document.createElement('span');
        totalNr.setAttribute('class', 'total-story-steps');

        // Append all to holder.
        holder.appendChild(currentNr);
        holder.appendChild(separator);
        holder.appendChild(totalNr);

        // Save references
        this.layers.currentStepNr = currentNr;
        this.layers.totalStepNr = totalNr;

        return holder;
    }

    /**
     * Create controls for the slider.
     * @return {DOM}
     */
    createStoryModeControls() {
        // Create holder element.
        const holder = this.document.createElement('div');
        holder.setAttribute('class', 'story-mode-controls');

        // Create previous btn element.
        const previousBtn = this.document.createElement('div');
        previousBtn.setAttribute('class', 'slider-btn slider-previous-btn');
        previousBtn.innerHTML = '<';
        previousBtn.onclick = this.previousStoryModeStep.bind(this);

        // Create next btn element.
        const nextBtn = this.document.createElement('div');
        nextBtn.setAttribute('class', 'slider-btn slider-next-btn');
        nextBtn.innerHTML = '>';
        nextBtn.onclick = this.nextStoryModeStep.bind(this);

        // Append all to holder.
        holder.appendChild(previousBtn);
        holder.appendChild(nextBtn);

        return holder;
    }

    /**
     * Hide the slider.
     */
    hideStoryModeSlider() {
        this.layers.storyModeSlider.style.display = 'none';
    }

    /**
     * Show the slider.
     */
    showStoryModeSlider() {
        this.layers.storyModeSlider.style.display = 'block';
    }

    /**
     * Initialize the filter elements.
     */
    initFilters() {
        // Create holder element.
        const holder = this.document.createElement('div');
        holder.setAttribute('class', 'filters-holder');

        // Create the I am... text.
        const iAmText = this.document.createElement('div');
        iAmText.classList.add('filter-intro-text');
        iAmText.innerHTML = this.localization.localize('slider.iAm');
        holder.appendChild(iAmText);

        // Create gender holder and filter buttons.
        const genderHolder = this.document.createElement('div');
        genderHolder.setAttribute('class', 'gender-filters');
        for (let i = 0; i < this.genderFilters.length; i++) {
            const filter = this.genderFilters[i];
            const label = this.localization.localize(filter.localeToken);
            const btn = this.createFilterButtonElement(label, filter.value);

            // Decide if this button needs highlighting.
            if (this.gender === filter.value) {
                this.onClickGenderFilterBtn(btn, filter.value);
            }

            // Add on click event.
            btn.onclick = this.onClickGenderFilterBtn.bind(this, btn, filter.value);

            genderHolder.appendChild(btn);
        }

        // Create age holder and filter buttons.
        const ageHolder = this.document.createElement('div');
        ageHolder.setAttribute('class', 'agegroup-filters');
        for (let i = 0; i < this.ageFilters.length; i++) {
            const filter = this.ageFilters[i];
            let label = filter.value;

            if (filter.localeToken !== undefined) {
                label = this.localization.localize(filter.localeToken);
            }

            const btn = this.createFilterButtonElement(label, filter.value);

            // Decide if this button needs highlighting.
            if (this.ageGroup === filter.value) {
                this.onClickAgeGroupFilterBtn(btn, filter.value);
            }

            // Add on click event.
            btn.onclick = this.onClickAgeGroupFilterBtn.bind(this, btn, filter.value);

            ageHolder.appendChild(btn);
        }

        // Most prevalent button.
        const btn = this.createFilterButtonElement(
            this.localization.localize('slider.startBtn'),
            'start'
        );
        btn.classList.add('show-most-prevalent-cancer-btn');
        btn.onclick = this.startStory.bind(this, Enums.StoryModes.BY_FILTERS);

        // Append everything to master holder.
        holder.appendChild(genderHolder);
        holder.appendChild(ageHolder);
        holder.appendChild(btn);

        // Cache and append master holder to chart view.
        this.layers.filtersHolder = holder;
        this.layers.interactiveElementsHolder.appendChild(holder);
    }

    /**
     * @param  {String}        label
     * @param  {Number|String} value
     * @return {DOM}
     */
    createFilterButtonElement(label, value) {
        const btn = this.document.createElement('button');
        btn.setAttribute('class', 'filter-btn');
        btn.setAttribute('data-value', value);

        btn.innerHTML = label;

        return btn;
    }

    /**
     * Code to run when clicking on a gender filters
     * @param {DOM}   btn    Clicked btm
     * @param {Sring} value
     */
    onClickGenderFilterBtn(btn, value) {
        // If a previous selected btn exist we must unhighlight it.
        if (this.selectedGenderFilterBtn !== null) {
            this.unhighlightFilterButton(this.selectedGenderFilterBtn);
        }

        // This function can run before full initiaization is
        // complete and then the markers will not have been
        // instantiated yet so we need a check here.
        if (this.initialized === true) {
            this.filterMarkersOnGender(value);
        }

        this.highlightFilterButton(btn);
        this.setGenderFilter(value);

        // Remember that this button has been selected.
        this.selectedGenderFilterBtn = btn;
    }

    /**
     * Code to run when clicking on a age group filters
     * @param {DOM}   btn    Clicked btm
     * @param {Sring} value
     */
    onClickAgeGroupFilterBtn(btn, value) {
        // If a previous selected btn exist we must unhighlight it.
        if (this.selectedAgeGroupFilterBtn !== null) {
            this.unhighlightFilterButton(this.selectedAgeGroupFilterBtn);
        }

        this.highlightFilterButton(btn);
        this.setAgeGroupFilter(value);

        // Remember that this button has been selected.
        this.selectedAgeGroupFilterBtn = btn;
    }

    /**
     * We must hide/show certain markers for cancers
     * depending on the selected gender.
     * @param {Enums.Gender} gender
     */
    filterMarkersOnGender(gender) {
        switch (gender) {
            case Enums.Gender.MALE:
                // Hide uterus.
                this.layers.markers[Enums.Cancers.UTERUS].style.display = 'none';

                // Show testicle and prostate.
                this.layers.markers[Enums.Cancers.PROSTATE].style.display = 'block';
                this.layers.markers[Enums.Cancers.TESTICLE].style.display = 'block';
                break;

            case Enums.Gender.FEMALE:
                // Hide unavailable organs.
                this.layers.markers[Enums.Cancers.PROSTATE].style.display = 'none';
                this.layers.markers[Enums.Cancers.TESTICLE].style.display = 'none';

                // Show uterus.
                this.layers.markers[Enums.Cancers.UTERUS].style.display = 'block';
                break;

            case Enums.Gender.ALL:
            default:
                // Show potentially hidden body parts.
                this.layers.markers[Enums.Cancers.PROSTATE].style.display = 'block';
                this.layers.markers[Enums.Cancers.TESTICLE].style.display = 'block';
                this.layers.markers[Enums.Cancers.UTERUS].style.display = 'block';
                break;
        }
    }

    /**
     * Highlights given filter btn.
     * @param {DOM} btn
     */
    highlightFilterButton(btn) {
        btn.style.background = '#FF3A29';
    }

    /**
     * Unhighlights given filter btn.
     * @param {DOM} btn
     */
    unhighlightFilterButton(btn) {
        btn.style.background = '#721817';
    }

    /**
     * Start a story.
     * @param {Enums.StoryModes} storyModeType
     * @param {Enums.Cancer}     cancerType
     */
    startStory(storyModeType, cancerType) {
        this.currentStoryModeType = storyModeType;
        this.hideMarkers();
        this.hideFilters();

        // Add flag for styling.
        this.layers.arrowHolder.classList.remove('show');
        this.layers.interactiveElementsHolder.classList.add('story-mode-on');
        this.layers.interactiveElementsHolder.classList.add(`story-mode-${storyModeType}`);

        // Depending on the storytype we need to retrieve different type of data.
        if (storyModeType === Enums.StoryModes.BY_FILTERS) {
            this.retrievedCancerData = this.retrieveMostPrevalentCancerTypeData(this.gender, this.ageGroup);
        } else {
            this.retrievedCancerData = this.retrieveDataForCancerType(cancerType, this.gender, this.ageGroup);
            this.layers.cancerNameHolder.innerHTML = cancerType;
        }

        // Update how many steps we have in this story.
        this.layers.totalStepNr.innerHTML = this.storyModes[this.currentStoryModeType].length;

        // Reset the step.
        this.currentStoryModeStep = 0;

        // Show the slider.
        this.showStoryModeSlider();

        // Go to the step.
        this.showStoryModeStep(this.currentStoryModeStep);
    }

    /**
     * Hide filters.
     * todo: refactor using classes.
     */
    hideFilters() {
        this.layers.filtersHolder.style.display = 'none';
    }

    /**
     * Show filters.
     * todo: refactor using classes.
     */
    showFilters() {
        this.layers.filtersHolder.style.display = 'block';
    }

    /**
     * Hide markers.
     */
    hideMarkers() {
        this.layers.markersHolder.classList.remove('show');
    }

    /**
     * Show markers.
     */
    showMarkers() {
        this.layers.markersHolder.classList.add('show');
    }

    /**
     * Go to previous step in the story mode.
     */
    previousStoryModeStep() {
        // Remove flag from classlist.
        this.layers.interactiveElementsHolder.classList.remove(`story-mode-step-${this.currentStoryModeStep}`);

        this.currentStoryModeStep--;

        // If we fall under 0 we return back to the start by calling finish.
        if (this.currentStoryModeStep < 0) {
            this.finishStoryMode();
        } else {
            this.showStoryModeStep(this.currentStoryModeStep);
        }
    }

    /**
     * Go to next step in the story mode.
     */
    nextStoryModeStep() {
        // Add flag to classlist.
        this.layers.interactiveElementsHolder.classList.remove(`story-mode-step-${this.currentStoryModeStep}`);

        this.currentStoryModeStep++;
        const lenghOfStoryMode = this.storyModes[this.currentStoryModeType].length;

        if (this.currentStoryModeStep >= lenghOfStoryMode) {
            this.finishStoryMode();
        } else {
            this.showStoryModeStep(this.currentStoryModeStep);
        }
    }

    /**
     * Show a specific step.
     * @param {Number} index
     */
    showStoryModeStep(index) {
        // Add flag to classlist.
        this.layers.interactiveElementsHolder.classList.add(`story-mode-step-${index}`);

        // Get id of the story step.
        const storyStepId = this.storyModes[this.currentStoryModeType][index];

        // Create the text for this step.
        const textEl = this.storyModeTextGenerator.generateTextElement(storyStepId, this.retrievedCancerData);

        // Remove all previous children from the holder first.
        for (let i = 0; i < this.layers.storyModeTextHolder.children.length; i++) {
            const child = this.layers.storyModeTextHolder.children[i];
            this.layers.storyModeTextHolder.removeChild(child);
        }

        // Append text element.
        this.layers.storyModeTextHolder.appendChild(textEl);

        // Generate the state for the vizualisation.
        const layerState = this.layerFormatter.generateLayerState(storyStepId, this.retrievedCancerData);

        // Set the state to the viz.
        this.mlcv.setState(layerState);

        // Update the current step nr.
        this.layers.currentStepNr.innerHTML = index + 1; // offset 0 based indexing.

        // On these specific steps we have to zoom in.
        if (storyStepId === Enums.StoryModeSteps.MOST_PREVALENT_CANCER_TYPE || storyStepId === Enums.StoryModeSteps.NUMBER_OF_AFFECTED_PEOPLE_BY_CANCER) {
            let zoomLevel = 2.5;
            let offsetY = 0;

            if (window.innerWidth < 1024) {
                zoomLevel = 1.5;
                offsetY = -75;
            }

            this.mlcv.zoomOnEmitterWithId(this.retrievedCancerData.cancerType, zoomLevel, 0, offsetY, true);
        } else if (storyStepId === Enums.StoryModeSteps.AMOUNT_OF_PEOPLE_WITH_CANCER) {
            this.mlcv.resetZoom();
        }
    }

    /**
     * End the story mode.
     */
    finishStoryMode() {
        this.showFilters();
        this.hideStoryModeSlider();
        this.mlcv.resetZoom(1000, this.showMarkers.bind(this));

        // Remove flags from class list.
        this.layers.interactiveElementsHolder.classList.remove('story-mode-on');
        Object.keys(this.storyModes).forEach(key => {
            this.layers.interactiveElementsHolder.classList.remove(`story-mode-${key}`);
        });

        // Add flag to arrowholder.
        this.layers.arrowHolder.classList.add('show');

        // Create default viz state and set it.
        const layerState = this.layerFormatter.generateLayerState(null);
        this.mlcv.setState(layerState);
    }

    /**
     * Setters.
     */

    /**
     * @param {Enums.Gender} val
     */
    setGenderFilter(val) {
        this.gender = val;
    }

    /**
     * @param {Enums.AgeGroup} val
     */
    setAgeGroupFilter(val) {
        this.ageGroup = val;
    }

    /**
     * Data functions.
     *
     * These functions can be complicated but are
     * written once and should just work.
     */

    /**
     * While the data has already been preloaded into a JSON.
     * We need to format some columns from string to numbers.
     */
    formatData() {
        const keys = Object.keys(Enums.AgeGroup);

        for (let i = 0; i < cancerTypeData.length; i++) {
            const row = cancerTypeData[i];

            for (let j = 0; j < keys.length; j++) {
                const column = Enums.AgeGroup[keys[j]];

                row[column] = parseFloat(row[column]);
            }
        }

        for (let i = 0; i < survivalData.length; i++) {
            const row = survivalData[i];

            row['cumulative_survival_rate'] = parseFloat(row['cumulative_survival_rate']);
            row['lower95pct'] = parseFloat(row['lower95pct']);
            row['upper95pct'] = parseFloat(row['upper95pct']);
        }
    }

    /**
     * Retrieve data for a specific cancer type.
     *
     * @param  {String} type
     * @return {Object}
     */
    retrieveDataForCancerType(cancerType, gender, ageGroup) {
        const data = {};
        let totalAmountOfCancerRow;
        let foundRowAbsoluteData;
        let foundRowRelativeData;

        for (let i = 0; i < cancerTypeData.length; i++) {
            const row = cancerTypeData[i];

            // Find the absolute and relative rows for this cancer type and gender.
            if (row['lokalisation'] === cancerType && row['geschlecht'] === gender) {
                if (row['typ'] === 'abs') {
                    foundRowAbsoluteData = row;
                } else if (row['typ'] === 'rel') {
                    foundRowRelativeData = row;
                }
            }

            // Search for the row with the total amounts.
            if (row['lokalisation'] === 'alle-Krebsarten' && row['geschlecht'] === gender && row['typ'] === 'abs') {
                totalAmountOfCancerRow = row;
            }
        }

        data['gender'] = gender;
        data['cancerType'] = cancerType;

        // Fallback for missing data.
        if (foundRowAbsoluteData !== undefined) {
            data['amount'] = foundRowAbsoluteData[ageGroup];
        } else {
            data['amount'] = 0;
        }

        if (foundRowRelativeData !== undefined) {
            data['percentage'] = foundRowRelativeData[ageGroup];
        } else {
            data['percentage'] = 0;
        }

        data['ageGroup'] = ageGroup;

        // Calculate how much this is of the total amount of cancer types.
        data['percentageOfTotal'] = Math.round(data['amount'] / totalAmountOfCancerRow[ageGroup] * 100);

        // Get survival rates.
        data['survivalRates'] = this.retrieveSurvivalRatesForCancerType(cancerType);

        return data;
    }

    /**
     * @param  {String} gender
     * @param  {String} ageGroup
     * @return {Object}
     */
    retrieveMostPrevalentCancerTypeData(gender, ageGroup) {
        let result = null;
        const data = {};

        // Save selection.
        data['gender'] = gender;
        data['ageGroup'] = ageGroup;

        for (let i = 0; i < cancerTypeData.length; i++) {
            const row = cancerTypeData[i];

            if (row['lokalisation'] !== 'Insgesamt' && row['lokalisation'] !== 'alle-Krebsarten') {
                if (row['geschlecht'] === gender && row['typ'] === 'abs') {

                    // If we have no result, of a certain age group has more
                    // prevalence we will select this as the result row.
                    if (result === null || result[ageGroup] < row[ageGroup]) {
                        result = row;
                    }
                }
            }

            // When come across the row with the total amounts we will also
            // pick out some data from it that we need.
            if (row['lokalisation'] === 'alle-Krebsarten' && row['geschlecht'] === gender) {
                if (row['typ'] === 'abs') {
                    data['totalAmountOfCancerDiagnoses'] = row[ageGroup];
                } else if (row['typ'] === 'rel') {
                    data['totalAmountOfCancerDiagnosesRelative'] = row[ageGroup];
                }
            }
        }

        // Save cancer type and amount of diagnoses for that cancer type.
        data['cancerType'] = result['lokalisation'];
        data['amount'] = result[ageGroup];

        // Get survival rates.
        data['survivalRates'] = this.retrieveSurvivalRatesForCancerType(data['cancerType']);

        // Calculate how much this type of cancer is of the total diagnoses of all cancers.
        data['percentageOfTotalDiagnoses'] = Math.round(data['amount'] / data['totalAmountOfCancerDiagnoses'] * 100);

        return data;
    }

    /**
     * @param {String} cancerType
     */
    retrieveSurvivalRatesForCancerType(cancerType) {
        const survivalDataForCancerType = {};

        // Find the survival rate.
        for (let i = 0; i < survivalData.length; i++) {
            const row = survivalData[i];

            // Skip rows for survival data of unknown cancers.
            if (row['category'] !== 'unbekannt') {
                if (row['lokalisation'] === cancerType) {
                    // Create object for year range if it does not exist.
                    if (survivalDataForCancerType[row['year_range']] === undefined) {
                        survivalDataForCancerType[row['year_range']] = {
                            ageGroup: {},
                            spread: {}
                        };
                    }

                    let ref;

                    // If the category is an agegroup we will put it in the correct holder.
                    if (Enums.AgeGroup[row['category']] !== undefined) {
                        ref = survivalDataForCancerType[row['year_range']]['ageGroup'];
                    } else {
                        ref = survivalDataForCancerType[row['year_range']]['spread'];
                    }

                    if (ref[row['category']] === undefined) {
                        ref[row['category']] = {};
                    }

                    ref[row['category']]['lower95pct'] = row['lower95pct'];
                    ref[row['category']]['upper95pct'] = row['upper95pct'];
                    ref[row['category']]['category'] = row['category'];
                }
            }
        }

        // There is no data for all the age group survival rates
        // so I have to calculate it myself.
        // Also checking for data integrity because I had some
        // missing data for time to time.
        if (survivalDataForCancerType['1998-2002'] !== undefined) {
            const ref1998 = survivalDataForCancerType['1998-2002']['ageGroup'];

            ref1998[Enums.AgeGroup.ALL] = {
                lower95pct: (ref1998['0-44']['lower95pct'] + ref1998['45-59']['lower95pct'] + ref1998['60-74']['lower95pct'] + ref1998['75+']['lower95pct']) / 400 * 100,
                upper95pct: (ref1998['0-44']['upper95pct'] + ref1998['45-59']['upper95pct'] + ref1998['60-74']['upper95pct'] + ref1998['75+']['upper95pct']) / 400 * 100,
                cateogry: Enums.AgeGroup.ALL
            };
        }

        if (survivalDataForCancerType['2008-2012'] !== undefined) {
            const ref2008 = survivalDataForCancerType['2008-2012']['ageGroup'];
            ref2008[Enums.AgeGroup.ALL] = {
                lower95pct: (ref2008['0-44']['lower95pct'] + ref2008['45-59']['lower95pct'] + ref2008['60-74']['lower95pct'] + ref2008['75+']['lower95pct']) / 400 * 100,
                upper95pct: (ref2008['0-44']['upper95pct'] + ref2008['45-59']['upper95pct'] + ref2008['60-74']['upper95pct'] + ref2008['75+']['upper95pct']) / 400 * 100,
                cateogry: Enums.AgeGroup.ALL
            };
        }

        return survivalDataForCancerType;
    }

    /**
     * Other code.
     */

    /**
     * Helper to create an embedd code for the on
     * the addendum site.
     * @return {String}
     */
    getEmbedCodeForAddendumSite() {
        const ID = 'qvvdata-krebs-molecules';
        return `
            <div id="${ID}"></div>
            <script>
                document.getElementById("${ID}").innerHTML = (function() {
                    var vh = window.innerHeight;
                    var vw = window.innerWidth;

                    var header_height = vw<=520?60:120;
                    var height = vh-header_height;

                    return '<iframe id="'+"${ID}"+'" width="100%" height="'+height+'" src="${document.location}" frameborder="0"></iframe>';
                })();
            <${''}/script>
        `;
    }
}
