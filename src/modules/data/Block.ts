/*******************************************************************************

    The class that defines the block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { BlockHeader } from './BlockHeader';
import { Hash } from './Hash';
import { Transaction } from './Transaction';

/**
 * The class that defines the block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class Block
{
    /**
     * The header of the block
     */
    public header: BlockHeader;

    /**
     * The array of the transaction
     */
    public txs: Transaction[];

    /**
     * The merkle tree
     */
    public merkle_tree: Hash[];

    /**
     * Constructor
     * @param header      The header of the block
     * @param txs         The array of the transaction
     * @param merkle_tree The merkle tree
     */
    constructor (header: BlockHeader, txs: Transaction[], merkle_tree: Hash[])
    {
        this.header = header;
        this.txs = txs;
        this.merkle_tree = merkle_tree;
    }
}
