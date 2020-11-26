/*******************************************************************************

    The class that defines the transaction's outputs of a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { PublicKey } from './KeyPair';
import { Utils } from "../utils/Utils";

import { SmartBuffer } from 'smart-buffer';

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
    constructor (value: bigint, address: PublicKey)
    {
        this.value = value;
        this.address = address;
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
