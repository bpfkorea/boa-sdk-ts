/*******************************************************************************

    The class that defines the transaction's outputs of a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { JSONValidator } from '../utils/JSONValidator';
import { PublicKey } from '../common/KeyPair';
import { Utils } from "../utils/Utils";
import { Lock } from '../script/Lock';

import JSBI from 'jsbi';
import { SmartBuffer } from 'smart-buffer';

/**
 * The class that defines the transaction's outputs of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class TxOutput
{
    /**
     * The monetary value of this output, in 1/10^7
     */
    public value: JSBI;

    /**
     * The lock condition for this Output
     */
    public lock: Lock;

    /**
     * Constructor
     * @param value   The monetary value
     * @param lock    The public key or instance of Lock
     */
    constructor (value: JSBI | string, lock: Lock | PublicKey)
    {
        this.value = JSBI.BigInt(value);

        if (lock instanceof PublicKey)
            this.lock = Lock.fromPublicKey(lock);
        else
            this.lock = lock
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `TxOutputs` if `key == ""`, `value` otherwise.
     */
    public static reviver (key: string, value: any): any
    {
        if (key !== "")
            return value;

        JSONValidator.isValidOtherwiseThrow('TxOutput', value);
        return new TxOutput(
            value.value,
            Lock.reviver("", value.lock));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        const buf = Buffer.allocUnsafe(8);
        Utils.writeJSBigIntLE(buf, this.value);
        buffer.writeBuffer(buf);
        this.lock.computeHash(buffer);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON (key?: string): any
    {
        return {
            value: this.value.toString(),
            lock: this.lock.toJSON()
        };
    }
}
