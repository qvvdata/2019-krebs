import Enums from './enums.js';

export default {
    cancerPhases: {
        lokalisiert: {
            en: 'localized',
            de: 'lokal'
        },

        regionalisiert: {
            en: 'regionalize',
            de: 'regional'
        },

        disseminiert: {
            en: 'metastasized',
            de: 'fortgeschritten'
        }
    },

    gender: {
        [Enums.Gender.MALE]: {
            en: 'male',
            de: 'männlich'
        },

        [Enums.Gender.FEMALE]: {
            en: 'female',
            de: 'weiblich'
        }
    },

    sentences: {
        chooseManually: {
            en: 'Choose a type manually',
            de: 'Wählen Sie eine Krebsart aus'
        }
    },

    slider: {
        iAm: {
            en: 'I am ...',
            de: 'Ich bin...'
        },

        startBtn: {
            en: 'Show most prevalent cancer',
            de: 'Mein Krebsrisiko?'
        },

        chooseManually: {
            en: 'or choose one manually',
            de: 'Oder wählen Sie eine Krebsart aus'
        }
    },

    storyMode: {
        [Enums.StoryModeSteps.AMOUNT_OF_PEOPLE_WITH_CANCER]: {
            en: '<span class="highlight-story-text-red">1 out of {peopleAmountRelative} {peopleType}</span> {ageGroup} lives with a cancer diagnosis. In total this is about {peopleAmountAbsolute} people.',
            de: '<span class="highlight-story-text-red">{pronoun} von {peopleAmountRelative} {peopleType}</span> {ageGroup} lebt mit einer Krebsdiagnose - das sind {peopleAmountAbsolute} Betroffene.'
        },

        [Enums.StoryModeSteps.MOST_PREVALENT_CANCER_TYPE]: {
            en: 'The most common cancer found is {cancerType}cancer - <span class="highlight-story-text-red">{percentageOfTotal}% of all diagnoses.</span>',
            de: 'Am häufigsten wird {cancerType}krebs festgestellt - <span class="highlight-story-text-red">{percentageOfTotal} % aller Diagnosen.</span>'
        },

        [Enums.StoryModeSteps.SURVIVAL_RATE_5_YEARS]: {
            en: 'between <span class="highlight-story-text-{highlightColor}">{lowerSurvivalPercentile} - {upperSurvivalPercentile}%</span> of patients survive in the following 5 years.',
            de: 'Etwa <span class="highlight-story-text-{highlightColor}">{lowerSurvivalPercentile} - {upperSurvivalPercentile} %</span> der Patienten überleben die darauffolgenden fünf Jahre.'
        },

        [Enums.StoryModeSteps.SURVIVAL_RATE_DEPENDING_ON_SPREAD]: {
            en: 'The rate of <span class="highlight-story-text-black">survival depends</span> on spread of the cancer:',
            de: 'Die <span class="highlight-story-text-black">Chance schwankt</span> je nach Krankheitsfortschritt:'
        },

        [Enums.StoryModeSteps.SURVIVAL_RATE_CHANGE]: {
            en: 'For {peopleType} in your age group the <span class="highlight-story-text-black">survival rate has {improvedOrWorsened}:</span>',
            de: 'Für {peopleType} in Ihrer Lebensphase hat sich die <span class="highlight-story-text-black">Überlebenswahrscheinlichkeit {improvedOrWorsened}:</span>'
        },

        [Enums.AgeGroup.ALL]: {
            en: 'of all ages',
            de: 'jeden Alters'
        },

        [Enums.AgeGroup['0-44']]: {
            en: 'of all ages to 44',
            de: 'im Alter von bis zu 44 Jahren'
        },

        [Enums.AgeGroup['45-59']]: {
            en: 'from 45 to 59',
            de: 'von 45 bis zu 59 Jahren'
        },

        [Enums.AgeGroup['60-74']]: {
            en: 'from 60 to 74',
            de: 'von 60 bis zu 74 Jahren'
        },

        [Enums.AgeGroup['75+']]: {
            en: 'ages 75 and older',
            de: 'über 75 Jahren'
        },

        [Enums.StoryModeSteps.NUMBER_OF_AFFECTED_PEOPLE_BY_CANCER]: {
            en: 'About {peopleAmountAbsolute} <span class="highlight-story-text-red">(1 von {peopleAmountRelative})</span> {peopleType} {ageGroup} lives with a {cancerType}cancer diagnose.',
            de: '<span class="highlight-story-text-red">{pronoun} von {peopleAmountRelative}</span> {peopleType} {ageGroup} lebt mit dieser Diagnose - rund {peopleAmountAbsolute} Betroffene.'
        }
    },

    words: {
        all: {
            en: 'all',
            de: 'alle'
        },

        improved: {
            en: 'improved',
            de: 'verbessert'
        },

        localized: {
            en: 'localized',
            de: 'lokal'
        },

        men: {
            en: 'men',
            de: 'Männern'
        },

        metastasized: {
            en: 'metastasized',
            de: 'fortgeschritten'
        },

        people: {
            en: 'people',
            de: 'Menschen'
        },

        regionalised: {
            en: 'regionalised',
            de: 'regional'
        },

        start: {
            en: 'start',
            de: 'Start'
        },

        unknown: {
            en: 'unknown',
            de: 'unbekannt'
        },

        women: {
            en: 'women',
            de: 'Frauen'
        },

        worsened: {
            en: 'worsened',
            de: 'verschlechtert'
        }
    }
};
