/*******************************************************************************

    Contains definition for the signature

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as utils from '../utils';

import * as assert from 'assert';

/**
 * Define the signature
 */
export class Signature
{
    /**
     * Buffer containing signature values
     */
    public readonly data: Buffer;

    /**
     * The number of byte of the signature
     */
    public static Width: number = 64;

    /**
     * Constructor
     * @param bin {Buffer | undefined} Raw signature
     */
    constructor (bin?: Buffer)
    {
        this.data = Buffer.alloc(Signature.Width);
        if (bin != undefined)
        {
            assert.strictEqual(bin.length, Signature.Width);
            bin.copy(this.data);
        }
    }

    /**
     * Reads from hex string
     * @param hex {string} Hex string
     */
    public fromString (hex: string): Signature
    {
        utils.readFromString(hex, this.data);

        return this;
    }

    /**
     * Writes to hex string
     * @returns {string}
     */
    public toString (): string
    {
        return utils.writeToString(this.data);
    }

    /**
     * Creates from the hex string
     * @param hex The hex string
     * @returns The instance of Signature
     */
    public static createFromString (hex: string): Signature
    {
        return (new Signature()).fromString(hex);
    }

    /**
     * Creates from Buffer
     * @param bin The binary data of the signature
     * @returns The instance of Signature
     */
    public static createFromBinary (bin: Buffer): Signature
    {
        return new Signature(bin);
    }
}
