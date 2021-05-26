/*******************************************************************************

    The class that defines the transaction of a block.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { hashPart } from '../common/Hash';
import { DataPayload } from './DataPayload';
import { Height } from '../common/Height';
import { JSONValidator } from '../utils/JSONValidator';
import { TxInput } from './TxInput';
import { TxOutput } from './TxOutput';
import { Utils } from '../utils/Utils';
import { VarInt } from '../utils/VarInt';

import { SmartBuffer } from 'smart-buffer';

/**
 * The transaction type constant
 */
export enum TxType
{
    Payment = 0,
    Freeze = 1,
    Coinbase = 2
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
        this.sort();
        buffer.writeUInt8(this.type);
        hashPart(this.inputs, buffer);
        hashPart(this.outputs, buffer);
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

    /**
     * Returns the estimated transaction size.
     * @param num_input The number of the inputs
     * @param num_output The number of the outputs
     * @param num_bytes_payload The bytes of the payload
     */
    public static getEstimatedNumberOfBytes (num_input: number, num_output: number, num_bytes_payload: number): number
    {
        return Utils.SIZE_OF_BYTE + Utils.SIZE_OF_LONG + num_bytes_payload +
            (num_input * TxInput.getEstimatedNumberOfBytes()) +
            (num_output * TxOutput.getEstimatedNumberOfBytes());
    }

    /**
     * Sort the transaction inputs and outputs
     */
    public sort ()
    {
        this.inputs.sort(TxInput.compare);
        this.outputs.sort(TxOutput.compare);
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize (buffer: SmartBuffer)
    {
        VarInt.fromNumber(this.type, buffer);

        VarInt.fromNumber(this.inputs.length, buffer);
        for (let elem of this.inputs)
            elem.serialize(buffer);

        VarInt.fromNumber(this.outputs.length, buffer);
        for (let elem of this.outputs)
            elem.serialize(buffer);

        this.payload.serialize(buffer);
        this.lock_height.serialize(buffer);
    }

    /**
     * Deserialize as binary data.
     * An exception occurs when the size of the remaining data is less than the required.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize (buffer: SmartBuffer): Transaction
    {
        let type = VarInt.toNumber(buffer);
        let length = VarInt.toNumber(buffer);
        let inputs: Array<TxInput> = [];
        for (let idx = 0; idx < length; idx++)
            inputs.push(TxInput.deserialize(buffer));

        length = VarInt.toNumber(buffer);
        let outputs: Array<TxOutput> = [];
        for (let idx = 0; idx < length; idx++)
            outputs.push(TxOutput.deserialize(buffer));

        let payload = DataPayload.deserialize(buffer);
        let lock_height = Height.deserialize(buffer);

        return new Transaction(type, inputs, outputs, payload, lock_height)
    }
}
