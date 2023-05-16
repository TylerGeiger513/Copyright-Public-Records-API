const { emitWarning } = require('process');
const urlConfig = require('../config/url-config.json');

class SearchBuilder {

    params = buildDefaultSearch();

    //new SearchBuilder({params: {"subquery": subquery}})
    constructor(options = { params: {}, args: {} }) {
        if (!options.hasOwnProperty('args')) {
            options.args = {
                ['--override']: "subquery"
            }
        } else if (options.args.hasOwnProperty('--override-all') && options.args['--override-all'] === true) {
            options.args['--override'] = Object.keys(urlConfig.parameters);
        }

        for (const key in options.params) {
            // allows for initialization with multiple params by using an array
            if (Array.isArray(options.params[key])) {
                // used to override the default behavior of adding to the array, and only override the first value
                let override = options.args['--override'].includes(key);

                options.params[key].forEach((value) => {
                    // fill defaults for subquery
                    if (typeof value == 'object') {
                        value = this.fillDefaults(key, value);
                    }
                    
                    this.setParam(key, value, override);
                    override = false;
                })
            } else {
                // fill defaults for subquery
                if (typeof options.params[key] == 'object') {
                    options.params[key] = this.fillDefaults(key, options.params[key]);
                }
                this.setParam(key, options.params[key], options['args']['--override'].includes(key))
            }
        }
    }



    setParam = (key, value, override = false) => {
        let current = this.params.get(key);

        if (override) {
            current = value;
        } else {
            if (!Array.isArray(current)) {
                current = [current];
            }
            current.push(value);
        }

        this.params.set(key, current);
    }

    // if subquery param doesn't contain all the required fields, fill them with defaults
    fillDefaults = (key, param) => {
        const paramDefaults = urlConfig.parameters[key].values;

        for (const key in paramDefaults) {
            if (!param.hasOwnProperty(key)) {
                param[key] = paramDefaults[key].default;
            }
        }
        return param;
    }

    validateUrl = () => {
        const validateValue = (param, value, paramKey) => {
            // if the value is null, we can ignore it unless it is required
            if (value === null) {
                if (param.hasOwnProperty('default')) {
                    value = param.default;
                    emitWarning(`Missing required param:${paramKey}... Using default value: ${value}`);
                } else {
                    return;
                }
            }

            if (param.type == 'string') {
                if (param.values && !param.values.includes(value)) {
                    throw new Error(`Invalid value: ${value} for param: ${paramKey}: please use one of the following: ${param.values}`);
                }
            } else if (param.type == 'number') {
                if (typeof value != 'number') {
                    throw new Error(`Invalid value: ${value} for param: ${paramKey}: Must be a number`);
                }
            } else if (param.type == 'json') {
                if (typeof value != 'object') {
                    throw new Error(`Invalid value: ${value} for param: ${paramKey}: please use a JSON object`);
                }

                for (const key in value) {
                    if (key == 'searchTypeReverseLookup') continue;


                    validateValue(param.values[key], value[key], key)
                    if (!param.values.hasOwnProperty(key)) {
                        throw new Error(`Invalid value: ${value} for param: ${paramKey}: please use one of the following: ${Object.keys(param.values)}`);
                    }
                }

            }
        }

        this.params.forEach((value, key) => {
            // validate keys
            if (!urlConfig.parameters.hasOwnProperty(key)) {
                throw new Error(`Invalid parameter: ${key}`);
            }

            // validate values
            const param = urlConfig.parameters[key];
            if (param.multivalued) {
                // validate multivalued values   
                if (Array.isArray(value)) {
                    value.forEach((val) => {
                        validateValue(param, val, key);
                    })
                } else {
                    value = [value];
                    this.params.set(key, value)

                    value.forEach((val) => {
                        validateValue(param, val, key);
                    })
                }
            } else {
                validateValue(param, value, key);
            }

            // extra validation for subqueries
            if (key === 'subquery') {
                const subqueries = value;

                // if there is only one subquery, its operatorType must be ""
                if (subqueries.length === 1 && subqueries[0].operatorType !== "") {
                    subqueries[0].operatorType = "";
                }

                // if there are multiple subqueries, the first one must be ""
                if (subqueries.length > 1 && subqueries[0].operatorType !== "") {
                    subqueries[0].operatorType = "";
                    emitWarning(`Overriding subquery operatorType`);
                }

                // append searchTypeReverseLookup to the end of all subqueries
                subqueries.forEach((subquery) => {
                    subquery["searchTypeReverseLookup"] = { exact: "Is (exact)", starts_with: "Starts with", contains: "Contains", phrase: "As a Phrase" }
                })
                this.params.set('subquery', subqueries);
            }
        })
    }


    buildUrl = () => {
        this.validateUrl();
        let url = urlConfig.baseUrl + "?";
        this.params.forEach((value, key) => {
            if (value === null)
                return;

            if (Array.isArray(value)) {
                value.forEach((val) => {
                    if (val === null) return;
                    if (typeof val == 'object') {
                        url += `${key}=${JSON.stringify(val)}&`;
                    } else {
                        url += `${key}=${val}&`;
                    }
                })
            } else {
                if (value != null)
                    url += `${key}=${value}&`;
            }

        });
        if (url.endsWith('&')) {
            url = url.slice(0, -1);
        }

        return url;
    }
}



/**
 * Builds a map of url parameters based on the url-config.json file
 * @returns {Map} - Map of url parameters
 */
const buildDefaultSearch = () => {
    const urlParameters = new Map();
    const params = urlConfig.parameters

    for (const key in params) {
        const param = params[key];
        let value;
        // when multivalued, the value is an array
        if (param.multivalued) {
            value = [];

            if (param.type == 'json') {
                let obj = {};
                for (const val in param.values) {
                    if (param.values[val].hasOwnProperty('default'))
                        obj[val] = param.values[val].default;
                    else {
                        obj[val] = null;
                    }
                }
                value.push(obj);
            } else if (param.hasOwnProperty('default')) {
                value.push(param.default);
            } else {
                value.push(null);
            }
            // when not multivalued, the value is a single value
        } else {
            // since there are no non-multivalued json objects yet, we can ignore the type checking
            value = null;
            if (param.hasOwnProperty('default'))
                value = param.default;
        }
        urlParameters.set(key, value);

    }

    return urlParameters;
}

module.exports = {
    SearchBuilder
}