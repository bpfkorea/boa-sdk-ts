/*******************************************************************************

    The class that defines the transaction's inputs of a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, makeUTXOKey } from './Hash';
import { Signature } from './Signature';

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
     * Constructor
     * @param first  The hash of the UTXO or the hash of the transaction
     * @param second The instance of Signature or output index
     * in the previous transaction
     * If the type of the second parameter is bigint,
     * the first parameter is considered the hash of the transaction
     * otherwise, the first parameter is considered the hash of the UTXO.
     */
    constructor (first: Hash, second: Signature | bigint)
    {
        if (typeof second == "bigint") {
            this.utxo = makeUTXOKey(first, second);
            this.signature = new Signature(Buffer.alloc(Signature.Width));
        } else {
            this.utxo = first;
            this.signature = second;
        }
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
