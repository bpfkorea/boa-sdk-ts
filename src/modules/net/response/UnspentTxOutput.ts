/*******************************************************************************

    Contains definition for the unspent transaction output

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash }  from '../../common/Hash';
import { TxType } from '../../data/Transaction';
import { Utils } from '../../utils/Utils';

/**
 * Define the unspentTxOutput
 */
export class UnspentTxOutput
{
    /**
     * The hash of the UTXO key
     */
    utxo: Hash;

    /**
     * The type of the transaction
     */
    type: TxType;

    /**
     * The height of the block to be unlock
     */
    unlock_height: bigint;

    /**
     * The amount value of this utxo, in 1/10^7
     */
    amount: bigint;

    /**
     * Block height on created
     */
    height: bigint;

    /**
     * Block time on created
     */
    time: number;

    /**
     * Constructor
     * @param utxo          The hash of the UTXO key
     * @param type          The type of the transaction
     * @param unlock_height The height of the block to be unlock
     * @param amount        The amount value of this utxo, in 1/10^7
     * @param height        The height of the block on created
     * @param time          The time of the block on created
     */
    constructor (utxo?: Hash, type?: TxType, unlock_height?: bigint, amount?: bigint,
                 height?: bigint, time?: number)
    {
        if (utxo != undefined)
            this.utxo = new Hash(utxo.data);
        else
            this.utxo = new Hash(Buffer.alloc(Hash.Width));

        if (type != undefined)
            this.type = type;
        else
            this.type = TxType.Payment;

        if (unlock_height != undefined)
            this.unlock_height = unlock_height;
        else
            this.unlock_height = BigInt(0);

        if (amount != undefined)
            this.amount = amount;
        else
            this.amount = BigInt(0);

        if (height != undefined)
            this.height = height;
        else
            this.height = BigInt(0);

        if (time != undefined)
            this.time = time;
        else
            this.time = 0;
    }

    /**
     * This import from JSON
     * @param data The object of the JSON
     */
    public fromJSON (data: JSONUnspentTxOutput)
    {
        Utils.validateJSON(this, data);

        this.utxo.fromString(data.utxo);
        this.type = data.type;
        this.unlock_height = BigInt(data.unlock_height);
        this.amount = BigInt(data.amount);
        this.height = BigInt(data.height);
        this.time = data.time;
    }
}

/**
 * @ignore
 * Define the unspentTxOutput in JSON
 */
export interface JSONUnspentTxOutput
{
    utxo: string;
    type: number;
    unlock_height: string;
    amount: string;
    height: string;
    time: number;
}
