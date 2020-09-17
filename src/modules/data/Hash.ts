/*******************************************************************************

    Includes classes and functions associated with hash.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as utils from '../utils';

import JSBI from 'jsbi';
import { SmartBuffer } from 'smart-buffer';

/**
 * The Class for creating hash
 */
export class Hash
{
    /**
     * Buffer containing calculated hash values
     */
    public readonly data: Buffer;

    /**
     * The number of byte of the Hash
     */
    public static Width: number = 64;

    /**
     * Constructor
     * @param bin Raw hash
     */
    constructor (bin?: Buffer)
    {
        this.data = Buffer.alloc(Hash.Width);
        if (bin != undefined)
            bin.copy(this.data);
    }

    /**
     * Reads from hex string
     * @param hex Hex string
     */
    public fromString (hex: string): Hash
    {
        utils.readFromString(hex, this.data);

        return this;
    }

    /**
     * Writes to hex string
     * @returns hex string
     */
    public toString (): string
    {
        return utils.writeToString(this.data);
    }

    /**
     * Creates from the hex string
     * @param hex The hex string
     * @returns The instance of Hash
     */
    public static createFromString (hex: string): Hash
    {
        return (new Hash()).fromString(hex);
    }

    /**
     * Creates from Buffer
     * @param bin The binary data of the hash
     * @returns The instance of Hash
     */
    public static createFromBinary (bin: Buffer): Hash
    {
        return new Hash(bin);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        buffer.writeBuffer(this.data);
    }
}

/**
 * Creates a hash and stores it in buffer.
 * @param source Original for creating hash
 * @returns Instance of Hash
 */
export function hash (source: Buffer): Hash
{
    return new Hash(Buffer.from(utils.SodiumHelper.sodium.crypto_generichash(Hash.Width, source)));
}

/**
 * Creates a hash of the two buffer combined.
 * @param source1 Original for creating hash
 * @param source2 Original for creating hash
 * @returns Instance of Hash
 * See_Also https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/Hash.d#L239-L255
 */
export function hashMulti (source1: Buffer, source2: Buffer): Hash
{
    let merge = Buffer.alloc(source1.length + source2.length);
    source1.copy(merge);
    source2.copy(merge, source1.length);

    return new Hash(Buffer.from(utils.SodiumHelper.sodium.crypto_generichash(Hash.Width, merge)));
}

/**
 * Makes a UTXOKey
 * @param h {Hash} Hash of transaction
 * @param index {number | string} Index of the output
 * @returns Instance of Hash
 * See_Also https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/data/UTXOSetValue.d#L50-L53
 */
export function makeUTXOKey (h: Hash, index: number | string | object): Hash
{
    let buf = Buffer.alloc(8);

    // See https://github.com/nodejs/node/blob/
    // 88fb5a5c7933022de750745e51e5dc0996a1e2c4/lib/internal/buffer.js#L573-L592
    let lo =
            JSBI.toNumber(
                JSBI.bitwiseAnd(
                    JSBI.BigInt(index),
                    JSBI.BigInt(0xffffffff)
                )
            );
    buf[0] = lo;
    lo = lo >> 8;
    buf[1] = lo;
    lo = lo >> 8;
    buf[2] = lo;
    lo = lo >> 8;
    buf[3] = lo;

    let hi =
            JSBI.toNumber(
                JSBI.bitwiseAnd(
                    JSBI.signedRightShift(
                        JSBI.BigInt(index),
                        JSBI.BigInt(32)
                    ),
                    JSBI.BigInt(0xffffffff)
                )
            );
    buf[4] = hi;
    hi = hi >> 8;
    buf[5] = hi;
    hi = hi >> 8;
    buf[6] = hi;
    hi = hi >> 8;
    buf[7] = hi;

    return hashMulti(h.data, buf);
}

/**
 * Serializes all internal objects that the instance contains in a buffer.
 * Calculates the hash of the buffer.
 * @param record The object to serialize for the hash for creation.
 * The object has a method named `computeHash`.
 * @returns The instance of the hash
 */
export function hashFull (record: any): Hash
{
    if ((record === null) || (record === undefined))
        return new Hash();

    let buffer = new SmartBuffer();
    hashPart(record, buffer);
    return hash(buffer.readBuffer());
}

/**
 * Serializes all internal objects that the instance contains in the buffer.
 * @param record The object to serialize for the hash for creation
 * @param buffer The storage of serialized data for creating the hash
 */
export function hashPart (record: any, buffer: SmartBuffer)
{
    if ((record === null) || (record === undefined))
        return;

    // If the record has a method called `computeHash`,
    if (typeof record["computeHash"] == "function")
    {
        record.computeHash(buffer);
        return;
    }

    if (Array.isArray(record))
    {
        for (let elem of record)
        {
            hashPart(elem, buffer);
        }
    }
    else
    {
        for (let key in record)
        {
            if (record.hasOwnProperty(key))
            {
                hashPart(record[key], buffer);
            }
        }
    }
}
