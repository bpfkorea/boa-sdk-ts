/*******************************************************************************

    Includes various useful functions

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as assert from 'assert';
import JSBI from "jsbi";

/**
 * The byte order
 */
export enum Endian
{
    Little,
    Big
}

export class Utils
{
    public static readonly SIZE_OF_BYTE: number = 1;
    public static readonly SIZE_OF_INT: number = 4;
    public static readonly SIZE_OF_LONG: number  = 8;

    /**
     * Check whether the string is a integer.
     * @param value
     */
    public static isInteger (value: string): boolean
    {
        return /^[+\-]?([0-9]+)$/.test(value);
    }

    /**
     * Check whether the string is a positive integer.
     * @param value
     */
    public static isPositiveInteger (value: string): boolean
    {
        return /^(\+)?([0-9]+)$/.test(value);
    }

    /**
     * Check whether the string is a negative integer.
     * @param value
     */
    public static isNegativeInteger (value: string): boolean
    {
        return /^\-([0-9]+)$/.test(value);
    }

    /**
     *  Gets the path to where the execution command was entered for this process.
     * This value must be set, otherwise the application will terminate.
     */
    public static getInitCWD (): string
    {
        // Get the working directory the user was in when the process was started,
        // as opposed to the `cwd` exposed by node which is the program's path.
        // Try to use `INIT_CWD` which is provided by npm, and fall back to
        // `PWD` otherwise.
        // See also: https://github.com/npm/cli/issues/2033
        if (process.env.INIT_CWD !== undefined)
            return process.env.INIT_CWD;
        assert.ok(process.env.PWD !== undefined, "Neither `INIT_CWD` nor `PWD` are defined");
        return process.env.PWD;
    }

    /**
     * Read from the hex string
     * @param hex The hex string
     * @param target The buffer to output
     * @param endian The byte order
     * @returns The output buffer
     */
    public static readFromString (hex: string, target?: Buffer, endian: Endian = Endian.Little): Buffer
    {
        let start = (hex.substr(0, 2) == '0x') ? 2 : 0;
        let length = (hex.length - start) >> 1;
        if (target === undefined)
            target = Buffer.alloc(length);

        if (endian == Endian.Little)
        {
            for (let pos = 0, idx = start; idx < length * 2 + start; idx += 2, pos++)
                target[length - pos - 1] = parseInt(hex.substr(idx, 2), 16);
        }
        else
        {
            for (let pos = 0, idx = start; idx < length * 2 + start; idx += 2, pos++)
                target[pos] = parseInt(hex.substr(idx, 2), 16);
        }
        return target;
    }

    /**
     * Write to the hex string
     * @param source The buffer to input
     * @param endian The byte order
     * @returns The hex string
     */
    public static writeToString (source: Buffer, endian: Endian = Endian.Little): string
    {
        if (source.length == 0)
            return '';

        if (endian == Endian.Little)
        {
            let hex: Array<string> = [];
            for (let idx = source.length-1; idx >= 0; idx--) {
                hex.push((source[idx] >>> 4).toString(16));
                hex.push((source[idx] & 0xF).toString(16));
            }
            return '0x' + hex.join("");
        }
        else
            return '0x' + source.toString("hex");
    }

    /**
     * Writes little endian 64-bits Big integer value to an allocated buffer
     * See https://github.com/nodejs/node/blob/88fb5a5c7933022de750745e51e5dc0996a1e2c4/lib/internal/buffer.js#L573-L592
     * @param buffer The allocated buffer
     * @param value  The big integer value
     */
    public static writeJSBigIntLE (buffer: Buffer, value: JSBI)
    {
        // See https://github.com/nodejs/node/blob/
        // 88fb5a5c7933022de750745e51e5dc0996a1e2c4/lib/internal/buffer.js#L573-L592
        let lo =
            JSBI.toNumber(
                JSBI.bitwiseAnd(
                    value,
                    JSBI.BigInt(0xffffffff)
                )
            );
        buffer[0] = lo;
        lo = lo >> 8;
        buffer[1] = lo;
        lo = lo >> 8;
        buffer[2] = lo;
        lo = lo >> 8;
        buffer[3] = lo;

        let hi =
            JSBI.toNumber(
                JSBI.bitwiseAnd(
                    JSBI.signedRightShift(
                        value,
                        JSBI.BigInt(32)
                    ),
                    JSBI.BigInt(0xffffffff)
                )
            );
        buffer[4] = hi;
        hi = hi >> 8;
        buffer[5] = hi;
        hi = hi >> 8;
        buffer[6] = hi;
        hi = hi >> 8;
        buffer[7] = hi;
    }
    /**
     * This checks that the JSON data has all the properties of the class.
     * @param obj  The instance of a class
     * @param json The object of the JSON
     */
    public static validateJSON (obj: Object, json: any)
    {
        Object.getOwnPropertyNames(obj)
            .forEach(property => {
                if (!json.hasOwnProperty(property))
                {
                    throw new Error('Parse error: ' + obj.constructor.name + '.' + property);
                }
            });
    }

    /**
     * Compare the two Buffers, This compares the two buffers from the back to the front.
     * If a is greater than b, it returns a positive number,
     * if a is less than b, it returns a negative number,
     * and if a and b are equal, it returns zero.
     */
    public static compareBuffer (a: Buffer, b: Buffer): number
    {
        let min_length = Math.min(a.length,  b.length)
        for (let idx = 0; idx < min_length; idx++)
        {
            let a_value = a[a.length - 1 - idx];
            let b_value = b[b.length - 1 - idx];
            if (a_value !== b_value)
                return (a_value - b_value)
        }

        return a.length - b.length;
    }
}
