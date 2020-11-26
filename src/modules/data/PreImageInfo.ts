/*******************************************************************************

    The class that defines the preImageInfo.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash } from './Hash';

/**
 * The class that defines the preImageInfo.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class PreImageInfo
{
    /**
     * UTXO used to enroll
     */
    public enroll_key: Hash;

    /**
     * Value of the pre-image
     */
    public hash: Hash;

    /**
     * Distance from the enrollment, 0 based
     */
    public distance: number;

    /**
     * Construct a new instance of this object
     *
     * @param enroll_key The UTXO used to enroll
     * @param hash       The value of the pre-image
     * @param distance   The distance from the Enrollment
     */
    constructor (enroll_key: Hash, hash: Hash, distance: number)
    {
        this.enroll_key = enroll_key;
        this.hash = hash;
        this.distance = distance;
    }
}
