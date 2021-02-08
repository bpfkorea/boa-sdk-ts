/*******************************************************************************

    The class that defines the transaction of a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { DataPayload } from './DataPayload';
import { Height } from '../common/Height';
import { JSONValidator } from '../utils/JSONValidator';
import { TxInput } from './TxInput';
import { TxOutput } from './TxOutput';
import { Utils } from '../utils/Utils';

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
 * The class that defines the transaction of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
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
     * The data payload to store
     */
    public payload: DataPayload;

    /**
     * This transaction may only be included in a block with `height >= lock_height`.
     * Note that another tx with a lower lock time could double-spend this tx.
     *
     */
    public lock_height: Height;

    /**
     * Constructor
     * @param type    The type of the transaction
     * @param inputs  The array of references to the unspent output of the previous transaction
     * @param outputs The array of newly created outputs
     * @param payload The data payload to store
     * @param lock_height The lock height
     */
    constructor (type: number, inputs: TxInput[], outputs: TxOutput[], payload: DataPayload,
                 lock_height: Height = new Height("0"))
    {
        this.type = type;
        this.inputs = inputs;
        this.outputs = outputs;
        this.payload = payload;
        this.lock_height = lock_height;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `Transaction` if `key == ""`, `value` otherwise.
     */
    public static reviver (key: string, value: any): any
    {
        if (key !== "")
            return value;

        JSONValidator.isValidOtherwiseThrow('Transaction', value);

        return new Transaction(
            Number(value.type),
            value.inputs.map((elem: any) => TxInput.reviver("", elem)),
            value.outputs.map((elem: any) => TxOutput.reviver("", elem)),
            DataPayload.reviver("", value.payload),
            new Height(value.lock_height));
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
        this.payload.computeHash(buffer);

        const buf = Buffer.allocUnsafe(8);
        Utils.writeJSBigIntLE(buf, this.lock_height.value);
        buffer.writeBuffer(buf);
    }

    /**
     * Returns the transaction size.
     */
    public getNumberOfBytes (): number
    {
        let bytes_length = Utils.SIZE_OF_BYTE + //  Transaction.type
            this.payload.data.length +          //  Transaction.payload
            Utils.SIZE_OF_LONG;                 //  Transaction.lock_height

        for (let elem of this.inputs)
            bytes_length += elem.getNumberOfBytes();
        for (let elem of this.outputs)
            bytes_length += elem.getNumberOfBytes();

        return bytes_length;
    }
}
