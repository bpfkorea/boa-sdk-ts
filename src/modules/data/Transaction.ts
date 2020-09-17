/*******************************************************************************

    The class that defines the transaction in a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { TxInput } from './TxInput';
import { TxOutput } from './TxOutput';

import { SmartBuffer } from 'smart-buffer';

/**
 * The transaction type constant
 */
export enum TxType
{
    Payment = 0,
    Freeze = 1
}

/**
 * The class that defines the transaction in a block.
 */
export class Transaction
{
    /**
     * The type of the transaction
     */
    public type: TxType;

    /**
     * The array of references to the unspent output of the previous transaction
     */
    public inputs: TxInput[];

    /**
     * The array of newly created outputs
     */
    public outputs: TxOutput[];

    /**
     * Constructor
     * @param type The type of the transaction
     * @param inputs The array of references to the unspent output of the previous transaction
     * @param outputs The array of newly created outputs
     */
    constructor (type?: number, inputs?: TxInput[], outputs?: TxOutput[])
    {
        if (type !== undefined)
            this.type = type;
        else
            this.type = 0;

        if (inputs !== undefined)
            this.inputs = inputs;
        else
            this.inputs = [];

        if (outputs !== undefined)
            this.outputs = outputs;
        else
            this.outputs = [];
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        buffer.writeUInt8(this.type);
        for (let elem of this.inputs)
            elem.computeHash(buffer);
        for (let elem of this.outputs)
            elem.computeHash(buffer);
    }
}
