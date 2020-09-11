/*******************************************************************************

    The class that defines the vote data.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

 *******************************************************************************/

import { Seed, PublicKey } from './KeyPair';
import { Hash } from './Hash';

import { TxInput } from './TxInput';
import {readFromString, writeToString} from '../..';

/**
 * The class that defines the vote data.
 */
export class VoteData
{
    /**
     * An array of 1 or more UTXOs to be spent
     */
    public inputs: Array<TxInput>;

    /**
     * An array of length matching `inputs` which are the keys controlling the UTXOs
     */
    public keys: Array<Seed>;

    /**
     * The data to store
     */
    public data: Buffer;

    /**
     * The address to which to send the refund
     */
    public address: PublicKey;

    /**
     * Constructor
     * @param inputs An array of 1 or more UTXOs to be spent
     * @param keys An array of length matching `inputs` which are the keys controlling the UTXOs
     * @param data The data to store
     * @param address The address to which to send the refund
     */
    constructor(inputs: Array<TxInput>, keys: Array<Seed>, data: Buffer, address: PublicKey)
    {
        this.inputs = inputs;
        this.keys = keys;
        this.data = Buffer.from(data);
        this.address = address;
    }

    /**
     * Returns true, if this is valid
     * otherwise return false
     */
    public isValid(): boolean
    {
        if (this.inputs.length == 0)
            return false;

        if (this.inputs.length != this.keys.length)
            return false;

        if (this.data.length == 0)
            return false;

        return true;
    }

    /**
     * Gets the JSON object
     * @returns The JSON object
     * ex) {"inputs": inputs, "keys": keys, "data": data, "address": address}
     */
    public toObject (): IVoteData
    {
        let inputs = [];
        for (let elem of this.inputs)
            inputs.push(
                {
                    "previous": elem.previous.toString(),
                    "index": elem.index
                }
            );

        let keys = [];
        for (let elem of this.keys)
            keys.push(elem.toString());

        return {
            "inputs": inputs,
            "keys": keys,
            "data": writeToString(this.data),
            "address": this.address.toString()
        }
    }

    /**
     * Create from the JSON
     * @param data the JSON object
     * ex) {"inputs": inputs, "keys": keys, "data": data, "address": address}
     */
    public static fromObject (data: IVoteData): VoteData
    {
        let inputs: Array<TxInput> = [];
        for (let elem of data.inputs)
            inputs.push(
                new TxInput(
                    Hash.createFromString(elem.previous),
                    elem.index
                )
            );

        let keys: Array<Seed> = [];
        for (let elem of data.keys)
            keys.push(Seed.fromString(elem));

        return new VoteData(inputs, keys, readFromString(data.data), PublicKey.fromString(data.address));
    }
}

/**
 * The interface of Transaction input for JSON
 */
interface ITxInput
{
    previous: string;
    index: number;
}

/**
 * The interface of VoteData for JSON
 */
interface IVoteData
{
    inputs: Array<ITxInput>;
    keys: Array<string>;
    data: string;
    address: string;
}
