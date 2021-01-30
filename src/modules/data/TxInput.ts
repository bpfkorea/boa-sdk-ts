/*******************************************************************************

    The class that defines the transaction's inputs of a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { JSONValidator } from '../utils/JSONValidator';
import { Hash, makeUTXOKey } from '../common/Hash';
import { Signature } from '../common/Signature';

import { SmartBuffer } from 'smart-buffer';

/**
 * The class that defines the transaction's inputs of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class TxInput
{
    /**
     * The hash of the UTXO to be spent
     */
    public utxo: Hash;

    /**
     * A signature that should be verified using public key of the output in the previous transaction
     */
    public signature: Signature;

    /**
     * The UTXO this `Input` references must be at least `unlock_age` older
     * than the block height at which the spending transaction wants to be
     * included in the block. Use for implementing relative time locks.
     */
    public unlock_age: number;

    /**
     * Constructor
     * @param first  The hash of the UTXO or the hash of the transaction
     * @param second The instance of Signature or output index
     * in the previous transaction
     * If the type of the second parameter is bigint,
     * the first parameter is considered the hash of the transaction
     * otherwise, the first parameter is considered the hash of the UTXO.
     * @param unlock_age The UTXO this `Input` references must be at least
     * `unlock_age` older than the block height at which the spending
     * transaction wants to be  included in the block.
     * Use for implementing relative time locks.
     */
    constructor (first: Hash, second: Signature | bigint, unlock_age: number = 0)
    {
        if (typeof second == "bigint") {
            this.utxo = makeUTXOKey(first, second);
            this.signature = new Signature(Buffer.alloc(Signature.Width));
            this.unlock_age = unlock_age;
        } else {
            this.utxo = first;
            this.signature = second;
            this.unlock_age = unlock_age;
        }
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `TxInputs` if `key == ""`, `value` otherwise.
     */
    public static reviver (key: string, value: any): any
    {
        if (key !== "")
            return value;

        JSONValidator.isValidOtherwiseThrow('TxInput', value);
        return new TxInput(
            new Hash(value.utxo), new Signature(value.signature),
            value.unlock_age);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        this.utxo.computeHash(buffer);
        buffer.writeUInt32LE(this.unlock_age)
    }
}
