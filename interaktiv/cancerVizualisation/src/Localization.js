import TRANSLATIONS from './translations';

/**
 * Basic localization class.
 */
export default class localization {
    constructor(lang) {
        this.lang = lang;
    }

    localize(key, tokens) {
        let trans = TRANSLATIONS;
        const locale = this.lang;

        // Split key.
        const parts = key.split('.');

        // Loop over each key to see if it exists.
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            // If a key does not exist we return immediately.
            if (trans[part] === undefined) {
                return key;
            }

            // Whenever a part of a key exists we will go deeper into the dict until we reach the deepest level.
            trans = trans[part];
        }

        if (trans[locale] !== undefined && trans[locale] !== '') { // See if a localized version exists.
            trans = trans[locale];
        } else if (locale !== ' en' && trans['en'] !== undefined && trans['en'] !== '') { // If no localized version exists we try the English version.
            trans = trans['en'];
        } else { // If there is also no English translation defined at the lowest level we then assume the last part of the key to be the English translation.
            trans = parts[parts.length - 1];
        }

        if (tokens !== undefined) {
            const keys = Object.keys(tokens);

            for (let i = 0; i < keys.length; i++) {
                trans = trans.replace('{' + keys[i] + '}', tokens[keys[i]]);
            }
        }

        return trans;
    }
}
