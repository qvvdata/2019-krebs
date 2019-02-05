import Enums from './enums.js';

/**
 * Class that creates the text for the story modes.
 */
export default class StoryModeTextGenerator {
    /**
     * @param  cancerVizualisation} viz.
     */
    constructor(viz) {
        /**
         * @type {cancerVizualisation}
         */
        this.viz = viz;
    }

    /**
     * Get the entire text for a story mode step
     * in an element.
     *
     * @param  {Enum.StoryModeSteps} id   Of step.
     * @param  {Object}              data cancer data.
     * @return {DOM}
     */
    generateTextElement(id, data) {
        const textHolder = this.viz.document.createElement('div');
        textHolder.setAttribute('class', 'story-mode-text');

        const tokens = this.createTranslationTokens(id, data);

        const text = this.viz.document.createElement('p');
        text.setAttribute('class', 'story-text-title');
        text.innerHTML = this.viz.localization.localize(`storyMode.${id}`, tokens);
        textHolder.appendChild(text);

        // Create any additional elements for this step's text.
        const additionalElements = this.createVizualisationElements(id, data);

        for (let i = 0; i < additionalElements.length; i++) {
            textHolder.appendChild(additionalElements[i]);
        }

        return textHolder;
    }

    /**
     * Construct an object with the tokens that need
     * to be filled in the localized step for a step.
     *
     * @param  {Enum.StoryModeSteps} id
     * @param  {Object}              data Cancer data.
     * @return {Object}
     */
    createTranslationTokens(id, data) {
        const numberFormatter = this.viz.numberFormatter;
        const tokens = {};
        const loc = this.viz.localization;

        switch (id) {
            /**
             * Story mode.
             */
            case Enums.StoryModeSteps.AMOUNT_OF_PEOPLE_WITH_CANCER:
                tokens['peopleAmountRelative'] = Math.round(100 / data['totalAmountOfCancerDiagnosesRelative']);
                tokens['pronoun'] = 'Einer';
                if (data['gender'] === Enums.Gender.ALL) {
                    tokens['peopleType'] = loc.localize('words.people');
                } else if (data['gender'] === Enums.Gender.MALE) {
                    tokens['peopleType'] = loc.localize('words.men');
                } else if (data['gender'] === Enums.Gender.FEMALE) {
                    tokens['pronoun'] = 'Eine';
                    tokens['peopleType'] = loc.localize('words.women');
                }

                tokens['ageGroup'] = loc.localize(`storyMode.${data['ageGroup']}`);


                tokens['peopleAmountAbsolute'] = numberFormatter.format(data['totalAmountOfCancerDiagnoses']);
                break;

            case Enums.StoryModeSteps.MOST_PREVALENT_CANCER_TYPE:
                tokens['cancerType'] = data['cancerType'];
                tokens['percentageOfTotal'] = data['percentageOfTotalDiagnoses'];
                break;

            case Enums.StoryModeSteps.SURVIVAL_RATE_5_YEARS:
                tokens['lowerSurvivalPercentile'] = Math.round(data['survivalRates']['2008-2012']['ageGroup'][data.ageGroup].lower95pct);
                tokens['upperSurvivalPercentile'] = Math.round(data['survivalRates']['2008-2012']['ageGroup'][data.ageGroup].upper95pct);

                tokens['highlightColor'] = 'green';

                if (tokens['lowerSurvivalPercentile'] < 60) {
                    tokens['highlightColor'] = 'red';
                }
                break;

            case Enums.StoryModeSteps.SURVIVAL_RATE_DEPENDING_ON_SPREAD:
                break;

            case Enums.StoryModeSteps.SURVIVAL_RATE_CHANGE:
                if (data['gender'] === Enums.Gender.ALL) {
                    tokens['peopleType'] = loc.localize('words.people');
                } else if (data['gender'] === Enums.Gender.MALE) {
                    tokens['peopleType'] = loc.localize('words.men');
                } else if (data['gender'] === Enums.Gender.FEMALE) {
                    tokens['peopleType'] = loc.localize('words.women');
                }

                if (data['survivalRates']['2008-2012']['ageGroup'][data.ageGroup].lower95pct > data['survivalRates']['1998-2002']['ageGroup'][data.ageGroup].lower95pct) {
                    tokens['improvedOrWorsened'] = loc.localize('words.improved');
                    tokens['highlightColor'] = 'green';
                } else {
                    tokens['improvedOrWorsened'] = loc.localize('words.worsened');
                    tokens['highlightColor'] = 'red';
                }
                break;

            /**
             * Exploration Mode.
             */
            case Enums.StoryModeSteps.NUMBER_OF_AFFECTED_PEOPLE_BY_CANCER:
                tokens['peopleAmountRelative'] = Math.round(100 / data['percentage']);
                tokens['pronoun'] = 'Einer';

                if (data['gender'] === Enums.Gender.ALL) {
                    tokens['peopleType'] = loc.localize('words.people');
                } else if (data['gender'] === Enums.Gender.MALE) {
                    tokens['peopleType'] = loc.localize('words.men');
                } else if (data['gender'] === Enums.Gender.FEMALE) {
                    tokens['pronoun'] = 'Eine';
                    tokens['peopleType'] = loc.localize('words.women');
                }

                tokens['ageGroup'] = loc.localize(`storyMode.${data['ageGroup']}`);
                tokens['peopleAmountAbsolute'] = numberFormatter.format(data['amount']);

                tokens['cancerType'] = data['cancerType'];
                tokens['percentageOfTotal'] = data['percentageOfTotal'];
                break;

            default:
                break;
        }

        return tokens;
    }

    /**
     * Some story stepds have special vizualisation elements.
     * We create them here.
     *
     * @param  {Enums.StoryModeSteps} id
     * @param  {Object}               data
     * @return {Array.<DOM>}
     */
    createVizualisationElements(id, data) {
        const elements = [];
        let keys;
        let lowestPercent = null;
        let highestPercent = null;

        switch (id) {
            // Create the spread chart elements.
            case Enums.StoryModeSteps.SURVIVAL_RATE_DEPENDING_ON_SPREAD:
                keys = Object.keys(data['survivalRates']['2008-2012']['spread']);

                // Get the lowest and highest percentage for the scale.
                keys.forEach(key => {
                    const spread = data['survivalRates']['2008-2012']['spread'][key];

                    if (lowestPercent === null || spread['lower95pct'] < lowestPercent) {
                        lowestPercent = Math.round(spread['lower95pct']);
                    }

                    if (highestPercent === null || spread['upper95pct'] > highestPercent) {
                        highestPercent = Math.round(spread['upper95pct']);
                    }
                });

                for (let i = 0; i < keys.length; i++) {
                    const spread = data['survivalRates']['2008-2012']['spread'][keys[i]];

                    const rangePlot = this.createRangePlotWithTitle(
                        this.viz.localization.localize(`cancerPhases.${keys[i]}`),
                        spread['lower95pct'],
                        spread['upper95pct'],
                        this.scaleRangePlotNumber(spread['lower95pct'], lowestPercent, highestPercent),
                        this.scaleRangePlotNumber(spread['upper95pct'], lowestPercent, highestPercent)
                    );

                    elements.push(rangePlot);
                }
                break;

            // Create the spread chart elements.
            case Enums.StoryModeSteps.SURVIVAL_RATE_CHANGE:
                keys = Object.keys(data['survivalRates']);

                // Get the lowest and highest percentage for the scale.
                keys.forEach(key => {
                    const survivalData = data['survivalRates'][key]['ageGroup'][data.ageGroup];

                    if (lowestPercent === null || survivalData['lower95pct'] < lowestPercent) {
                        lowestPercent = Math.round(survivalData['lower95pct']);
                    }

                    if (highestPercent === null || survivalData['upper95pct'] > highestPercent) {
                        highestPercent = Math.round(survivalData['upper95pct']);
                    }
                });

                for (let i = 0; i < keys.length; i++) {
                    const survivalData = data['survivalRates'][keys[i]]['ageGroup'][data.ageGroup];

                    const rangePlot = this.createRangePlotWithTitle(
                        keys[i],
                        survivalData['lower95pct'],
                        survivalData['upper95pct'],
                        this.scaleRangePlotNumber(survivalData['lower95pct'], lowestPercent, highestPercent),
                        this.scaleRangePlotNumber(survivalData['upper95pct'], lowestPercent, highestPercent)
                    );

                    elements.push(rangePlot);
                }
                break;

            default:
                break;
        }

        return elements;
    }

    /**
     * For the range plot we will scale the numbers
     * to start and end on the lowest and highest number.
     *
     * @param  {Number} numberToScale
     * @param  {Number} numberScaleStart
     * @param  {Number} numberScaleEnd
     * @return {Number}
     */
    scaleRangePlotNumber(numberToScale, numberScaleStart, numberScaleEnd) {
        const numberScaleLength = Math.round(numberScaleEnd) - Math.round(numberScaleStart);
        const normalizedNumberToScale = Math.round(numberToScale) - numberScaleStart;

        const relativeNumberToScale = normalizedNumberToScale / numberScaleLength;

        return (100 * relativeNumberToScale);
    }

    /**
     * Create a range plot with title.
     *
     * @param  {String} title
     * @param  {Number} lower
     * @param  {Number} upper
     * @param  {Number} lowerScaled
     * @param  {Number} upperScaled
     * @return {DOM}
     */
    createRangePlotWithTitle(title, lower, upper, lowerScaled, upperScaled) {
        const holder = this.viz.document.createElement('div');
        holder.classList.add('range-plot-outer');

        // Title element.
        const titleEl = this.viz.document.createElement('span');
        titleEl.classList.add('title');
        titleEl.innerHTML = `${title}:`;

        // Inner holder.
        const rangePlotInner = this.viz.document.createElement('div');
        rangePlotInner.classList.add('range-plot-inner');

        // Background range plot.
        const bgRangePlot = this.createRangePlot(0, 100);
        bgRangePlot.classList.add('bg-range-plot');

        // Round off upper percentage and check
        // it doesn't go out of bounds. Some data
        // has percentages over 100...
        let upperLabel = Math.round(upper);
        if (upperLabel > 100) {
            upperLabel = 100;
        }

        // floor the lower bounds so there is variation
        // between the two numbers. Sometimes they are
        // exactly the same because of rounding.
        let lowerLabel = Math.floor(lower);
        if (lowerLabel < 0) {
            lowerLabel = 0;
        }

        // The actual statistics range plot.
        const statisticsRangePlot = this.createRangePlot(
            lowerScaled,
            upperScaled,
            `${lowerLabel}%`,
            `${upperLabel}%`
        );

        // Depending on the upper range we will colour the
        // elements differently.
        if (upper < 50) {
            statisticsRangePlot.classList.add('range-plot-red');
        } else if (upper < 75) {
            statisticsRangePlot.classList.add('range-plot-orange');
        } else {
            statisticsRangePlot.classList.add('range-plot-green');
        }

        // Append range plots to their inner holder.
        rangePlotInner.appendChild(bgRangePlot);
        rangePlotInner.appendChild(statisticsRangePlot);

        // Append title and inner holder to outer one.
        holder.appendChild(titleEl);
        holder.appendChild(rangePlotInner);

        return holder;
    }

    /**
     * Ceate the range plot elements.
     *
     * @param  {Number} lower
     * @param  {Number} upper
     * @param  {String} lowerLabel
     * @param  {String} upperLabel
     * @return {DOM}
     */
    createRangePlot(lower, upper, lowerLabel = null, upperLabel = null) {
        // Create the background rangeplot
        const holder = this.viz.document.createElement('div');
        holder.classList.add('range-plot');

        const startCircle = this.createRangePlotDot(lower);
        const endCircle = this.createRangePlotDot(upper);

        const line = this.viz.document.createElement('div');
        line.classList.add('line');

        line.setAttribute('style', [
            `left: ${lower}%`,
            `width: ${upper - lower}%`
        ].join(';'));

        holder.appendChild(startCircle);
        holder.appendChild(line);
        holder.appendChild(endCircle);

        if (lowerLabel !== null) {
            const startLabel = this.createRangePlotDotLabel(lowerLabel);
            startLabel.classList.add('dot-start-label');
            startCircle.appendChild(startLabel);
        }

        if (upperLabel !== null) {
            const endLabel = this.createRangePlotDotLabel(upperLabel);
            endLabel.classList.add('dot-end-label');
            endCircle.appendChild(endLabel);
        }

        return holder;
    }

    /**
     * Creates a dot for the range plot.
     * @param  {Number} pos
     * @return {DOM}
     */
    createRangePlotDot(pos) {
        const circle = this.viz.document.createElement('div');
        circle.classList.add('dot');

        circle.setAttribute('style', [
            `left: ${pos}%`,
        ].join(';'));

        return circle;
    }

    /**
     * Creates a label for the range plot dot.
     * @param  {String} text
     * @return {DOM}
     */
    createRangePlotDotLabel(text) {
        const label = this.viz.document.createElement('span');
        label.classList.add('dot-label');
        label.innerHTML = text;
        return label;
    }
}
