/*******************************************************************************

    Contains definition for the pre-image

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash }  from '../../data/Hash';
import { Utils } from '../../utils/Utils';

/**
 * Define the pre-image
 */
export class PreImage
{
    /**
     * The value of the pre-image at the distance from the commitment
     */
    hash: Hash;

    /**
     * The distance between this pre-image and the initial commitment
     */
    distance: number;

    /**
     * Constructor
     * @param h {Hash | undefined} The value of the pre-image at the distance from the commitment
     * @param d {number | undefined} The distance between this pre-image and the initial commitment
     */
    constructor (h?: Hash, d?: number)
    {
        if (h != undefined)
            this.hash = new Hash(h.data);
        else
            this.hash = new Hash();

        if (d != undefined)
            this.distance = d;
        else
            this.distance = 0;
    }

    /**
     * This import from JSON
     * @param data {JSONPreImage} The object of the JSON
     */
    public fromJSON (data: JSONPreImage)
    {
        Utils.validateJSON(this, data);

        this.distance = data.distance;
        this.hash.fromString(data.hash);
    }
}

/**
 * @ignore
 * Define the pre-image in JSON
 */
export interface JSONPreImage
{
    hash: string;
    distance: number;
}
