/*******************************************************************************

    The class that defines the transaction's input in a block.

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
 * The class that defines the transaction's inputs in a block.
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
     * Constructor
     * @param utxo The hash of the UTXO to be spent
     * @param signature A signature that should be verified using public key of the output in the previous transaction
     */
    constructor(utxo?: Hash, signature?: Signature)
    {
        if (utxo !== undefined)
            this.utxo = new Hash(utxo.data);
        else
            this.utxo = new Hash();

        if (signature !== undefined)
            this.signature = new Signature(signature.data);
        else
            this.signature = new Signature();
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        this.utxo.computeHash(buffer);
    }
}
