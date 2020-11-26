/*******************************************************************************

    The class that defines the Validator.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import Ajv from 'ajv';

/**
 * @ignore
 */
const ajv = new Ajv();

/**
 * Class for validating JSON data
 */
export class JSONValidator
{
    /**
     * @ignore
     */
    private static schemas: Map<string, object> =
    new Map([
        [
            "BitField",
            {
                "title": "BitField",
                "type": "array",
                "items": {
                    "type": "number"
                },
                "additionalProperties": false,
                "required": []
            }
        ],
        [
            "Block",
            {
                "title": "Block",
                "type": "object",
                "properties": {
                    "header": {
                        "type": "object"
                    },
                    "txs": {
                        "items": {
                            "type": "object"
                        },
                        "type": "array"
                    },
                    "merkle_tree": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    }
                },
                "additionalProperties": false,
                "required": ["header", "txs", "merkle_tree"]
            }
        ],
        [
            "BlockHeader",
            {
                "title": "BlockHeader",
                "type": "object",
                "properties": {
                    "prev_block": {
                        "type": "string"
                    },
                    "height": {
                        "type": "string"
                    },
                    "merkle_root": {
                        "type": "string"
                    },
                    "validators": {
                        "type": "string"
                    },
                    "signature": {
                        "type": "string"
                    },
                    "enrollments": {
                        "items": {
                            "type": "object"
                        },
                        "type": "array"
                    }
                },
                "additionalProperties": false,
                "required": [
                    "prev_block",
                    "height",
                    "merkle_root",
                    "validators",
                    "signature",
                    "enrollments"
                ]
            }
        ],
        [
            "DataPayload",
            {
                "title": "DataPayload",
                "type": "string",
                "additionalProperties": false,
                "required": []
            }

        ],
        [
            "Enrollment",
            {
                "title": "Enrollment",
                "type": "object",
                "properties": {
                    "utxo_key": {
                        "type": "string"
                    },
                    "random_seed": {
                        "type": "string"
                    },
                    "cycle_length": {
                        "type": "number"
                    },
                    "enroll_sig": {
                        "type": "string"
                    }
                },
                "additionalProperties": false,
                "required": ["utxo_key", "random_seed", "cycle_length", "enroll_sig"]
            }

        ],
        [
            "PreImageInfo",
            {
                "title": "PreImageInfo",
                "type": "object",
                "properties": {
                    "enroll_key": {
                        "type": "string"
                    },
                    "hash": {
                        "type": "string"
                    },
                    "distance": {
                        "type": "integer"
                    }
                },
                "additionalProperties": false,
                "required": ["enroll_key", "hash", "distance"]
            }

        ],
        [
            "Transaction",
            {
                "title": "Transaction",
                "type": "object",
                "properties": {
                    "type": {
                        "type": "number"
                    },
                    "inputs": {
                        "items": {
                            "type": "object"
                        },
                        "type": "array"
                    },
                    "outputs": {
                        "items": {
                            "type": "object"
                        },
                        "type": "array"
                    },
                    "payload": {
                        "type": "string"
                    }
                },
                "additionalProperties": false,
                "required": ["type", "inputs", "outputs", "payload"]
            }
        ],
        [
            "TxInput",
            {
                "title": "TxInput",
                "type": "object",
                "properties": {
                    "utxo": {
                        "type": "string"
                    },
                    "signature": {
                        "type": "string"
                    }
                },
                "additionalProperties": false,
                "required": ["utxo", "signature"]
            }
        ],
        [
            "TxOutput",
            {
                "title": "TxOutput",
                "type": "object",
                "properties": {
                    "value": {
                        "type": "string"
                    },
                    "address": {
                        "type": "string"
                    }
                },
                "additionalProperties": false,
                "required": ["value", "address"]
            }
        ]
    ]);

    /**
     * The map of validation functions created to reuse -
     * an once created validation function.
     */
    private static validators = new Map<string, Ajv.ValidateFunction>();

    /**
     * Create a validation function using the schema.
     * Return it if it has already been created.
     * @param name The JSON schema name
     * @returns The function of validation
     */
    private static buildValidator (name: string): Ajv.ValidateFunction
    {
        let validator = JSONValidator.validators.get(name);
        if (validator === undefined)
        {
            let schema = JSONValidator.schemas.get(name);
            if (schema !== undefined)
            {
                validator = ajv.compile(schema);
                JSONValidator.validators.set(name, validator);
            }
            else
                throw new Error(`Non-existent schema accessed: ${name}`);
        }
        return validator as Ajv.ValidateFunction;
    }

    /**
     * Check the validity of a JSON data.
     * @param validator The Function to validate JSON
     * @param candidate The JSON data
     * @returns `true` if the JSON is valid, otherwise `false`
     */
    private static isValid (validator: Ajv.ValidateFunction, candidate: any)
    {
        return (validator(candidate) === true);
    }

    /**
     * Check the validity of a JSON data.
     * @param schema_name The JSON schema name
     * @param candidate The JSON data
     * @returns `true` if the JSON is valid, otherwise throw an `Error`
     */
    public static isValidOtherwiseThrow (schema_name: string, candidate: any)
    {
        const validator = this.buildValidator(schema_name);
        if (this.isValid(validator, candidate) === true)
        {
            return true;
        }
        else if (
            (validator.errors !== undefined) &&
            (validator.errors !== null) &&
            (validator.errors.length > 0))
        {
            if (validator.errors.length == 1)
            {
                throw new Error(`Validation failed: ${schema_name} - ` + validator.errors[0].message);
            }
            else
            {
                let messages = [];
                for (let error of validator.errors)
                    messages.push(error.message);
                throw new Error(`Validation failed: ${schema_name} - ` + messages.join('\n'));
            }
        }
        else
        {
            throw new Error(`Validation failed: ${schema_name}`);
        }
    }

    /**
     * Check the validity of a JSON data.
     * @param schema_name The JSON schema name
     * @param candidate The JSON data
     * @returns `true` if the JSON is valid, otherwise `false`
     */
    public static isValidOtherwiseNoThrow (schema_name: string, candidate: any)
    {
        const validator = this.buildValidator(schema_name);
        return this.isValid(validator, candidate);
    }
}
