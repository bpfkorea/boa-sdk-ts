/*******************************************************************************

    The class that defines the transaction data payload.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { hashPart } from '../common/Hash';
import { JSONValidator } from "../utils/JSONValidator";
import { Utils, Endian } from '../utils/Utils';
import { VarInt } from '../utils/VarInt';

import { SmartBuffer } from 'smart-buffer';

/**
 * The class that defines the transaction data payload.
 */
export class DataPayload
{
    /**
     * The data payload to store
     */
    public data: Buffer;

    /**
     * Constructor
     * @param data The data payload to store
     * @param endian The byte order
     */
    constructor (data: Buffer | string, endian: Endian = Endian.Big)
    {
        if (typeof data === 'string')
            this.data = Buffer.from(data, "base64");
        else
            this.data = this.fromBinary(data, endian).data;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `DataPayload` if `key == ""`, `value` otherwise.
     */
    public static reviver (key: string, value: any): any
    {
        if (key !== "")
            return value;

        JSONValidator.isValidOtherwiseThrow('DataPayload', value);

        return new DataPayload(value.bytes);
    }

    /**
     * Reads from the base64 string
     * @param data The base64 string
     * @returns The instance of DataPayload
     */
    public fromString (data: string): DataPayload
    {
        this.data = Buffer.from(data, "base64");
        return this;
    }

    /**
     * Writes to the base64 string
     * @returns The base64 string
     */
    public toString (): string
    {
        return this.data.toString("base64");
    }

    /**
     * Set binary data
     * @param bin    The binary data of the data payload
     * @param endian The byte order
     * @returns The instance of DataPayload
     */
    public fromBinary (bin: Buffer, endian: Endian = Endian.Big): DataPayload
    {
        this.data = Buffer.from(bin);
        if (endian === Endian.Little)
            this.data.reverse();

        return this;
    }

    /**
     * Get binary data
     * @param endian The byte order
     * @returns The binary data of the data payload
     */
    public toBinary (endian: Endian = Endian.Big): Buffer
    {
        if (endian === Endian.Little)
            return Buffer.from(this.data).reverse();
        else
            return this.data;
    }

    /**
     * Collects data to create a data payload.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        hashPart(this.data, buffer);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON (key?: string): any
    {
        return {
            bytes: this.data.toString("base64")
        };
    }

    /**
     * The data payload consisting of zero values for all bytes.
     * @returns The instance of DataPayload
     */
    static get init(): DataPayload
    {
        return new DataPayload(Buffer.alloc(0));
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize (buffer: SmartBuffer)
    {
        VarInt.fromNumber(this.data.length, buffer);
        buffer.writeBuffer(this.data);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize (buffer: SmartBuffer): DataPayload
    {
        let length = VarInt.toNumber(buffer);
        return new DataPayload(buffer.readBuffer(length));
    }
}
