/*******************************************************************************

    Includes class to build a transaction

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import {
    DataPayload, Hash, hashFull, KeyPair, SecretKey, PublicKey,
    Signature, Transaction, TxInput, TxOutput, TxType,
} from '../..';

/**
 * Class for building a transaction
 */
export class TxBuilder
{
    /**
     * Array of UTXO to be spent
     */
    private inputs: Array<RawInput>;

    /**
     * Array of TxOutput
     */
    private outputs: Array<TxOutput>;

    /**
     * The sum of UTXO in `inputs`
     */
    private amount: bigint;

    /**
     * The data payload in transaction to be created
     */
    private payload: DataPayload | undefined;

    /**
     * The default owner key pair
     */
    private readonly owner_keypair: KeyPair;

    /**
     * Constructor
     * @param owner_keypair The owner key pair
     */
    constructor (owner_keypair: KeyPair)
    {
        this.payload = undefined;
        this.owner_keypair = owner_keypair;
        this.inputs = [];
        this.outputs = [];
        this.amount = BigInt(0);
    }

    /**
     * Adds information to create and sign transaction inputs
     * @param utxo   The hash of the UTXO to be spent
     * @param amount The value of UTXO to be spent
     * @param secret The key pair to spend UTXO.
     */
    public addInput (utxo: Hash, amount: bigint, secret?: SecretKey): TxBuilder
    {
        if (amount <= 0)
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        if (secret === undefined)
            this.inputs.push(new RawInput(utxo, this.owner_keypair.secret));
        else
            this.inputs.push(new RawInput(utxo, secret));

        this.amount += amount

        return this;
    }

    /**
     * Adds information to create transaction output
     * @param address The address of the destination.
     * @param amount  The amount to be sent. If this is not set,
     * all remaining amounts of registered utxo will be set.
     */
    public addOutput (address: PublicKey, amount?: bigint): TxBuilder
    {
        if (amount === undefined)
            amount = this.amount;

        if (amount <= BigInt(0))
            throw new Error(`[${address.toString()}] Positive amount expected, not ${amount.toString()}`);

        if (amount > this.amount)
            throw new Error(`[${address.toString()}] Insufficient amount. ${amount.toString()}:${this.amount.toString()}`);

        this.outputs.push(new TxOutput(amount, address));

        this.amount -= amount;

        return this;
    }

    /**
     * Sets the data payload.
     * @param payload
     */
    public assignPayload (payload: DataPayload): TxBuilder
    {
        this.payload = payload;

        return this;
    }

    /**
     * Create and sign a transaction and return the created transactions.
     * @param type The type of Transaction
     */
    public sign (type: TxType = TxType.Payment) : Transaction
    {
        if (this.inputs.length == 0)
            throw (new Error("No input for transaction."));

        if (this.outputs.length == 0)
            throw (new Error("No output for transaction."));

        if ((type === TxType.Freeze) && (this.payload !== undefined) && (this.payload.data.length > 0))
            throw (new Error("Freeze transaction cannot have data payload."));

        if (this.amount > 0)
            this.addOutput(this.owner_keypair.address, this.amount);

        let null_signature = new Signature(Buffer.alloc(Signature.Width));
        let tx = new Transaction(type,
            this.inputs.map(n => new TxInput(n.utxo, null_signature)),
            this.outputs,
            (
                (this.payload !== undefined)
                    ? this.payload
                    : new DataPayload(Buffer.alloc(0))
            ));

        let tx_hash = hashFull(tx);
        tx.inputs.forEach((value, idx) => {
            value.signature = this.inputs[idx].key.sign(tx_hash.data);
        });

        this.payload = undefined;
        this.inputs = [];
        this.outputs = [];
        this.amount = BigInt(0);

        return tx;
    }
}

/**
 * The class with UTXO and a secret key to be spent it
 */
class RawInput
{
    /**
     * The hash of the UTXO to be spent
     */
    public readonly utxo: Hash;

    /**
     * The secret key to sign when using UTXO
     */
    public readonly key: SecretKey;

    /**
     * Constructor
     * @param utxo The hash of the UTXO to be spent
     * @param key  The secret key to sign when using UTXO
     */
    constructor(utxo: Hash, key: SecretKey)
    {
        this.utxo = utxo;
        this.key = key;
    }
}
