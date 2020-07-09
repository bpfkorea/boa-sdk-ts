/*******************************************************************************

    Contains validation of JSON data

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

/**
 * This checks that the JSON data has all the properties of the class.
 * @param obj {Object} The instance of a class
 * @param json {any} The object of the JSON
 */
export function validateJSON (obj: Object, json: any)
{
    Object.getOwnPropertyNames(obj)
        .forEach(property => {
            if (!json.hasOwnProperty(property))
            {
                throw new Error('Parse error: ' + obj.constructor.name + '.' + property);
            }
        });
}
