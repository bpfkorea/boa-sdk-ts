/*******************************************************************************

    The class that defines the enrollment of a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash } from './Hash';
import { Signature } from './Signature';

import { SmartBuffer } from 'smart-buffer';

/**
 * The class that defines the enrollment of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class Enrollment
{
    /**
     * K: A hash of a frozen UTXO
     */
    public utxo_key: Hash;

    /**
     * X: The nth image of random value
     */
    public random_seed: Hash;

    /**
     * n: The number of rounds a validator will participate in
     */
    public cycle_length: number;

    /**
     * S: A signature for the message H(K, X, n, R) and the key K, using R
     */
    public enroll_sig: Signature;

    /**
     * Constructor
     * @param key   A hash of a frozen UTXO
     * @param seed  The nth image of random value
     * @param cycle The number of rounds a validator will participate in
     * @param sig A signature for the message H(K, X, n, R) and the key K, using R
     */
    constructor (key: Hash, seed: Hash, cycle: number, sig: Signature)
    {
        this.utxo_key = key;
        this.random_seed = seed;
        this.cycle_length = cycle;
        this.enroll_sig = sig;
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        this.utxo_key.computeHash(buffer);
        this.random_seed.computeHash(buffer);
        buffer.writeUInt32LE(this.cycle_length);
    }
}
