export default {
    AgeGroup: {
        ALL: 'alle',
        '0-44': '0-44',
        '45-59': '45-59',
        '60-74': '60-74',
        '75+': '75+'
    },

    Gender: {
        ALL: 'Zusammen',
        MALE: 'Männlich',
        FEMALE: 'Weiblich'
    },

    Lang: {
        DE: 'de',
        EN: 'en'
    },

    StoryModes: {
        BY_FILTERS: 'filters',
        BY_CANCER_TYPE: 'cancerType'
    },

    StoryModeSteps: {
        // Steps in order for basic story mode.
        AMOUNT_OF_PEOPLE_WITH_CANCER: 'amount_of_people_with_cancer',
        MOST_PREVALENT_CANCER_TYPE: 'most_prevalent_cancer_type',
        SURVIVAL_RATE_5_YEARS: 'survival_rate_5_years',
        SURVIVAL_RATE_DEPENDING_ON_SPREAD: 'survival_rate_depending_on_spread',
        SURVIVAL_RATE_CHANGE: 'survival_rate_change',

        // Used as step 1 for exploration mode
        NUMBER_OF_AFFECTED_PEOPLE_BY_CANCER: 'affected_people_by_cancer'
    },

    Cancers: {
        BLADDER: 'Harnblase',
        BREASTCANCER: 'Brust',
        ESOPHAGUS: 'Speiseröhre',
        INTESTINE: 'Darm',
        LIVER: 'Leber',
        LUNGS: 'Lunge',
        PANCREAS: 'Bauchspeicheldrüse',
        PROSTATE: 'Prostata',
        TESTICLE: 'Hoden',
        THYROID: 'Schilddrüse',
        UTERUS: 'Gebärmutter'
    }
};
