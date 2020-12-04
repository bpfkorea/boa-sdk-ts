/*******************************************************************************

    Contains class for managing UTXO

    This class manages what is used and not used in payment for UTXO
    This calculates the sum of the UTXO amounts.
    This also provides UTXO for the required amount.
    This allows for the addition of a later UTXO.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { TxType } from "../data/Transaction";
import { Hash } from "../data/Hash";

/**
 * Class for managing UTXO
 * Manage what is used and not used in payment for UTXO
 */
export class UTXOManager
{
    /**
     * Internal UTXO Array
     */
    private readonly items: Array<InternalUTXO>;

    /**
     * Constructor
     * @param data The array containing UnspentTxOutput objects
     */
    constructor (data: Array<UnspentTxOutput>)
    {
        this.items = [];
        this.add(data);
    }

    /**
     * Add UTXOs. If it already exists, ignore it.
     * After add, Two fields are used for sorting.
     * One is unlock_height and the other is amount.
     * The array is sorted in ascending order of unlock_height,
     * and in ascending order of amount when the same unlock_height is.
     * This allows a UTXO that is created first to be used first.
     * It also allows small amounts to be used first.
     * @param data The array of `UnspentTxOutput`
     */
    public add (data: Array<UnspentTxOutput>)
    {
        let old_length = this.items.length;
        this.items.push(
            ...data
                .filter(n => this.items.find(m => (m.utxo.data.compare(n.utxo.data) === 0)) === undefined)
                .map(n => new InternalUTXO(n.utxo, n.type, n.unlock_height, n.amount)));

        if (this.items.length > old_length)
            this.items.sort((a, b) =>
            {
                let cmp = (a: bigint, b: bigint) => ((a > b) ? 1 : ((a < b) ? -1 : 0));
                if (a.unlock_height !== b.unlock_height)
                    return cmp(a.unlock_height, b.unlock_height);
                return cmp(a.amount, b.amount);
            });
    }

    /**
     * Returns the sum of the amount.
     * @param height The height of the current block,
     * if this value is not specified, the total is calculated.
     * @returns Returns the sum of the amount.
     * The first is the sum of UTXO, whose type of transaction is Payment,
     * and the second is the sum of Freeze,
     * and the third is the amount that was released from the freeze
     * but locked to `unlock_height`.
     */
    public getSum (height?: bigint): [bigint, bigint, bigint]
    {
        if ((height !== undefined) && (height <= 0))
            throw new Error(`Positive height expected, not ${height.toString()}`);

        return this.items
            .filter(n => !n.used)
            .reduce<[bigint, bigint, bigint]>((sum, n) =>
            {
                if ((height !== undefined) && (n.unlock_height - BigInt(1) > height))
                    sum[2] += n.amount;
                else
                    sum[n.type] += n.amount;
                return sum;
            }, [BigInt(0), BigInt(0), BigInt(0)]);
    }

    /**
     * Returns an array of UTXOs to be used for input of transactions
     * based on the amount entered.
     * @param amount The required amount
     * @param height The height of latest block
     * @returns Returns the available array of UTXO. If the available amount
     * is less than the requested amount, the empty array is returned.
     */
    public getUTXO (amount: bigint, height: bigint): Array<UnspentTxOutput>
    {
        if (amount <= 0)
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        if (height <= 0)
            throw new Error(`Positive height expected, not ${height.toString()}`);

        if (amount > this.getSum(height)[TxType.Payment])
            return [];

        let sum = BigInt(0);
        return this.items
            .filter(n => (!n.used && (n.type == TxType.Payment)
                && (n.unlock_height - BigInt(1) <= height)))
            .filter((n) =>
            {
                if (sum >= amount)
                    return false;
                sum += n.amount;
                n.used = true;
                return true
            })
            .map(n => new UnspentTxOutput(
                n.utxo, n.type,
                n.unlock_height, n.amount));
    }
}

/**
 * Define the internal UTXO
 */
class InternalUTXO extends UnspentTxOutput
{
    /**
     * Status variable indicating whether it is used or not
     */
    public used: Boolean;

    /**
     * Constructor
     * @param utxo          The hash of the UTXO
     * @param type          The type of the transaction
     * @param unlock_height The height of the block that can be used
     * @param amount        The monetary value of UTXO
     */
    constructor (utxo: Hash, type: TxType, unlock_height: bigint, amount: bigint)
    {
        super(utxo, type, unlock_height, amount);

        if (unlock_height <= 0)
            throw new Error(`Positive unlock_height expected, not ${unlock_height.toString()}`);

        if (amount <= 0)
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        this.used = false;
    }
}
