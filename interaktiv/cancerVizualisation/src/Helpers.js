export default class Helpers {
    constructor() {
        console.log('This is a pure static class. Do not instantiate');
    }

    /**
     * Check if item is in fact an Object and not an array.
     *
     * @param  {*}       item
     * @return {Boolean}
     */
    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    /**
     * Deep merge 2 objects.
     *
     * The source will overwrite properties in the target.
     *
     * @param  {Object} target
     * @param  {Object} source
     * @return {Object}
     */
    static mergeDeep(target, source) {
        const output = Object.assign({}, target);
        if (Helpers.isObject(target) && Helpers.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (Helpers.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = Helpers.mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }

        return output;
    }
}
