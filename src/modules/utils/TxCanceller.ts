/*******************************************************************************

    Includes class to cancel a transaction

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash } from "../common/Hash";
import { KeyPair, PublicKey } from "../common/KeyPair";
import { Transaction } from "../data/Transaction";
import { OutputType } from "../data/TxOutput";
import { LockType } from "../script/Lock";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { TxPayloadFee } from "./TxPayloadFee";
import { TxBuilder } from "./TxBuilder";

import JSBI from "jsbi";

/**
 * A class that creates a cancellation transaction.
 */
export class TxCanceller {
    public static double_spent_threshold_pct: number = 20;

    /**
     * The original transaction
     */
    private tx: Transaction;

    /**
     * The array of KeyPairs to be used for signing
     */
    private key_pairs: Array<KeyPair>;

    /**
     * The array of UTXO information used in tx's inputs
     */
    private utxos: Array<UnspentTxOutput>;

    /**
     * Constructor
     * @param tx           The original transaction
     * @param key_pairs    The array of KeyPairs to be used for signing
     * @param utxos        The array of UTXO information used in tx's inputs
     */
    constructor(tx: Transaction, utxos: Array<UnspentTxOutput>, key_pairs: Array<KeyPair>) {
        this.tx = tx;
        this.utxos = utxos;
        this.key_pairs = key_pairs;
    }

    /**
     * Find the element in the array that corresponds to the hash of utxo.
     * @param utxo The hash of UTXO
     */
    private findUTXO(utxo: Hash): UnspentTxOutput | undefined {
        return this.utxos.find((m) => Buffer.compare(m.utxo.data, utxo.data) === 0);
    }

    /**
     * Find the element corresponding to the public key in the array.
     * @param address The public key
     */
    private findKey(address: PublicKey): KeyPair | undefined {
        return this.key_pairs.find((m) => Buffer.compare(m.address.data, address.data) === 0);
    }

    /**
     * Validate that the transaction is cancelable transaction.
     */
    private validate(): TxCancelResultCode {
        if (this.tx.inputs.length === 0) return TxCancelResultCode.InvalidTransaction;

        if (this.key_pairs.length === 0) return TxCancelResultCode.NotFoundKey;

        for (let input of this.tx.inputs) {
            let u = this.findUTXO(input.utxo);
            if (u === undefined) return TxCancelResultCode.NotFoundUTXO;

            if (u.lock_type !== LockType.Key) return TxCancelResultCode.UnsupportedLockType;

            let pk = new PublicKey(Buffer.from(u.lock_bytes, "base64"));
            let found = this.findKey(pk);
            if (found === undefined) return TxCancelResultCode.NotFoundKey;

            // Unfreezing transactions cannot be canceled.
            if (u.type === OutputType.Freeze) return TxCancelResultCode.UnsupportedUnfreezing;
        }

        let amount_info = this.calculateAmount();
        let new_adjusted_fee = this.getNewAdjustedFee(amount_info);
        let tx_size = Transaction.getEstimatedNumberOfBytes(
            this.tx.inputs.length,
            this.tx.inputs.length,
            this.tx.payload.length
        );
        let total_fee = JSBI.multiply(new_adjusted_fee, JSBI.BigInt(tx_size));

        // Fees for cancellation transactions can be set larger than existing fees.
        // Make sure it's big enough to work it out.
        if (JSBI.lessThan(amount_info.sum_input, JSBI.add(total_fee, JSBI.BigInt(this.tx.inputs.length))))
            return TxCancelResultCode.NotEnoughFee;

        return TxCancelResultCode.Success;
    }

    /**
     * Calculate the transaction fee.
     */
    private calculateAmount(): ITxAmountInfo {
        let sum_in: JSBI = JSBI.BigInt(0);
        let sum_out: JSBI = JSBI.BigInt(0);

        for (let input of this.tx.inputs) {
            let u = this.findUTXO(input.utxo);
            if (u !== undefined) sum_in = JSBI.add(sum_in, u.amount);
        }

        for (let output of this.tx.outputs) sum_out = JSBI.add(sum_out, output.value);

        let total_fee = JSBI.subtract(sum_in, sum_out);
        let payload_fee = TxPayloadFee.getFee(this.tx.payload.length);
        let tx_fee = JSBI.subtract(total_fee, payload_fee);
        let tx_size = this.tx.getNumberOfBytes();

        return {
            sum_input: sum_in,
            sum_output: sum_out,
            total_fee: total_fee,
            payload_fee: payload_fee,
            tx_fee: tx_fee,
            tx_size: tx_size,
            adjusted_fee: JSBI.divide(total_fee, JSBI.BigInt(tx_size)),
        };
    }

    /**
     * Calculate the fees to be used in cancellation transactions.
     */
    private getNewAdjustedFee(amount_info: ITxAmountInfo): JSBI {
        return JSBI.divide(
            JSBI.multiply(
                amount_info.adjusted_fee,
                JSBI.add(JSBI.BigInt(100), JSBI.BigInt(TxCanceller.double_spent_threshold_pct))
            ),
            JSBI.BigInt(100)
        );
    }

    /**
     * Builder a cancellation transaction.
     * @return If successful, res.code will have TxCancelResultCode.Success.
     * Otherwise, they have values based on the cause of the error.
     */
    public build(): ITxCancelResult {
        let result_code = this.validate();
        if (result_code !== TxCancelResultCode.Success) return { code: result_code };

        let amount_info = this.calculateAmount();
        let new_adjusted_fee = this.getNewAdjustedFee(amount_info);

        let in_length = this.tx.inputs.length;
        let tx_size = Transaction.getEstimatedNumberOfBytes(in_length, in_length, this.tx.payload.length);
        let total_fee = JSBI.multiply(new_adjusted_fee, JSBI.BigInt(tx_size));
        let payload_fee = TxPayloadFee.getFee(this.tx.payload.length);
        let tx_fee = JSBI.subtract(total_fee, payload_fee);

        let divided_fee = JSBI.divide(total_fee, JSBI.BigInt(in_length));
        let remain_fee = JSBI.subtract(total_fee, JSBI.multiply(divided_fee, JSBI.BigInt(in_length)));

        let builder = new TxBuilder(this.key_pairs[0]);

        this.tx.inputs.forEach((input, idx) => {
            let u = this.findUTXO(input.utxo);
            if (u !== undefined) {
                let k = this.findKey(new PublicKey(Buffer.from(u.lock_bytes, "base64")));
                if (k !== undefined) {
                    let amount = JSBI.subtract(u.amount, divided_fee);
                    if (idx == in_length - 1) amount = JSBI.subtract(amount, remain_fee);

                    builder.addInput(u.utxo, u.amount, k.secret);
                    builder.addOutput(k.address, amount);
                }
            }
        });

        return {
            code: result_code,
            tx: builder.sign(
                OutputType.Payment,
                tx_fee,
                payload_fee,
                this.tx.lock_height,
                this.tx.inputs[0].unlock_age
            ),
        };
    }

    /**
     * PublicKey extract stored on the map of UTXO
     * @param utxo_map the map of UTXO
     */
    public static addresses(utxo_map: Map<string, UnspentTxOutput>): Array<PublicKey> {
        let res = new Array<PublicKey>();
        utxo_map.forEach((value) => {
            if (value.lock_type === LockType.Key) {
                res.push(new PublicKey(Buffer.from(value.lock_bytes, "base64")));
            }
        });
        return res;
    }
}

interface ITxAmountInfo {
    sum_input: JSBI;
    sum_output: JSBI;
    total_fee: JSBI;
    payload_fee: JSBI;
    tx_fee: JSBI;
    tx_size: number;
    adjusted_fee: JSBI;
}

export enum TxCancelResultCode {
    Success,
    InvalidTransaction,
    UnsupportedUnfreezing,
    NotFoundUTXO,
    UnsupportedLockType,
    NotFoundKey,
    NotEnoughFee,
}

export interface ITxCancelResult {
    code: TxCancelResultCode;
    tx?: Transaction;
}
