/*******************************************************************************

    Includes various useful functions

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { UInt64 } from 'spu-integer-math';

/**
 * Converts the UInt64 to the string
 * @param value The number of UInt64
 * @param radix An integer in the range 2 through 36 specifying
 * the base to use for representing numeric values.
 */
export function UInt64ToString(value: UInt64, radix?: number): string
{
    const BIT32 = 4294967296;

    let high = value.hi;
    let low = value.lo;
    let str = "";

    radix = radix || 10;
    while (true)
    {
        let mod = (high % radix) * BIT32 + low;
        high = Math.floor(high / radix);
        low = Math.floor(mod / radix);
        str = (mod % radix).toString(radix) + str;
        if (!high && !low) break;
    }
    return str;
}
