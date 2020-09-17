/*******************************************************************************

    The class that defines the transaction's output in a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { PublicKey } from './KeyPair';

import { SmartBuffer } from 'smart-buffer';
import { UInt64 } from 'spu-integer-math';

/**
 * The class that defines the transaction's output in a block.
 */
export class TxOutput
{
    /**
     * The monetary value of this output, in 1/10^7
     */
    public value: UInt64;

    /**
     * The public key that can spend this output
     */
    public address: PublicKey;

    /**
     * Constructor
     * @param value The monetary value
     * @param address The public key
     */
    constructor (value?: string, address?: PublicKey)
    {
        if (value !== undefined)
            this.value = UInt64.fromString(value);
        else
            this.value = UInt64.fromString("0");

        if (address !== undefined)
            this.address = address;
        else
            this.address = new PublicKey();
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        buffer.writeInt32LE(this.value.lo);
        buffer.writeInt32LE(this.value.hi);
        this.address.computeHash(buffer);
    }
}
