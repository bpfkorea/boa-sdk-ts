/*******************************************************************************

    Includes class to build a transaction

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hashFull } from "../common/Hash";
import { Height } from "../common/Height";
import { KeyPair, SecretKey, PublicKey } from "../common/KeyPair";
import { Lock, Unlock } from "../script/Lock";
import { DataPayload } from '../data/DataPayload';
import { Transaction, TxType } from '../data/Transaction';
import { TxInput } from '../data/TxInput';
import { TxOutput } from '../data/TxOutput';

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
     * @param lock The public key or instance of Lock
     * @param amount  The amount to be sent. If this is not set,
     * all remaining amounts of registered utxo will be set.
     */
    public addOutput (lock: Lock | PublicKey, amount?: bigint): TxBuilder
    {
        if (amount === undefined)
            amount = this.amount;

        if (amount <= BigInt(0))
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        if (amount > this.amount)
            throw new Error(`Insufficient amount. ${amount.toString()}:${this.amount.toString()}`);

        this.outputs.push(new TxOutput(amount, lock));

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
     * @param lock_height The transaction-level height lock
     * @param tx_fee The transaction fee
     * @param payload_fee The payload fee
     * @param unlock_age The unlock age for each input in the transaction
     * @param unlocker optional callback to generate the unlock script.
     * If one is not provided then a LockType.Key unlock script
     * is automatically generated.
     */
    public sign (type: TxType = TxType.Payment,
                 tx_fee: bigint = BigInt(0),
                 payload_fee: bigint = BigInt(0),
                 lock_height: Height = new Height(BigInt(0)),
                 unlock_age: number = 0,
                 unlocker?: (tx: Transaction, s: RawInput, idx: number) => Unlock) : Transaction
    {
        if (this.inputs.length == 0)
            throw (new Error("No input for transaction."));

        if ((type === TxType.Freeze) && (this.payload !== undefined) && (this.payload.data.length > 0))
            throw (new Error("Freeze transaction cannot have data payload."));

        let total_fee = tx_fee + payload_fee;
        if (this.amount > total_fee)
            this.addOutput(this.owner_keypair.address, this.amount - total_fee);
        else if (this.amount < total_fee)
            throw (new Error("There is not enough fee."));

        if (this.outputs.length == 0)
            throw (new Error("No output for transaction."));

        let tx = new Transaction(type,
            this.inputs.map(n => new TxInput(n.utxo, Unlock.Null, unlock_age)),
            this.outputs,
            (
                (this.payload !== undefined)
                    ? this.payload
                    : new DataPayload(Buffer.alloc(0))
            ),
            lock_height);

        let _unlocker = (unlocker !== undefined) ? unlocker : this.keyUnlocker;
        tx.inputs.forEach((value, idx) => {
            value.unlock = _unlocker(tx, this.inputs[idx], idx);
        });

        this.payload = undefined;
        this.inputs = [];
        this.outputs = [];
        this.amount = BigInt(0);

        return tx;
    }

    /**
     * Uses a random nonce when signing (non-determenistic signature),
     * and defaults to LockType.Key
     * @param tx The instance of the Transaction to sign
     * @param raw_input The instance of the SecretKey to sign
     * @param idx
     * @private
     */
    private keyUnlocker (tx: Transaction, raw_input: RawInput, idx: number): Unlock
    {
        return Unlock.fromSignature(raw_input.key.sign(hashFull(tx).data));
    }
}

/**
 * The class with UTXO and a secret key to be spent it
 */
export class RawInput
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
