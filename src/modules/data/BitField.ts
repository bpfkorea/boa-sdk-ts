/*******************************************************************************

    The class that defines the BitField of a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

/**
 * The class that defines the BitField of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property are not present.
 */
export class BitField
{
    /**
     * The storage with bit data
     */
    public storage: number[];

    /**
     * Constructor
     * @param storage The source storage with bit data
     */
    constructor (storage: number[])
    {
        this.storage = storage;
    }
}
