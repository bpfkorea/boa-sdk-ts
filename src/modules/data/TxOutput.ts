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
import { Utils } from "../utils/Utils";

/**
 * The class that defines the transaction's output in a block.
 */
export class TxOutput
{
    /**
     * The monetary value of this output, in 1/10^7
     */
    public value: bigint;

    /**
     * The public key that can spend this output
     */
    public address: PublicKey;

    /**
     * Constructor
     * @param value   The monetary value
     * @param address The public key
     */
    constructor (value?: bigint, address?: PublicKey)
    {
        if (value !== undefined)
            this.value = value;
        else
            this.value = BigInt("0");

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
        const buf = Buffer.allocUnsafe(8);
        Utils.writeBigIntLE(buf, this.value);
        buffer.writeBuffer(buf);
        this.address.computeHash(buffer);
    }
}
