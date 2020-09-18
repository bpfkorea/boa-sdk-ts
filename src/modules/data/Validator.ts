/*******************************************************************************

    Contains definition for the validator

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash }  from './Hash';
import { PreImage, JSONPreImage } from './PreImage';
import * as utils from '../utils';

/**
 * Define the validator
 */
export class Validator
{
    /**
     * The public key that is included in the frozen UTXO.
     */
    address: string;

    /**
     * The block height when enrolled
     */
    enrolled_at: number;

    /**
     * The hash of frozen UTXO
     */
    stake: Hash;

    /**
     * The pre-image
     */
    preimage: PreImage;

    /**
     * Constructor
     * @param address {string | undefined} The public key that is included in the frozen UTXO.
     * @param height {number | undefined} The block height when enrolled
     * @param stake {Hash | undefined} The hash of frozen UTXO
     * @param image {PreImage | undefined} The pre-image
     */
    constructor(address?: string, height?: number, stake?: Hash, image?: PreImage)
    {
        if (address != undefined)
            this.address = address;
        else
            this.address = '';

        if (height != undefined)
            this.enrolled_at = height;
        else
            this.enrolled_at = 0;

        if (stake != undefined)
            this.stake = stake;
        else
            this.stake = new Hash();

        if (image != undefined)
            this.preimage = image;
        else
            this.preimage = new PreImage();
    }

    /**
     * This import from JSON
     * @param data {JSONValidator} The object of the JSON
     */
    public fromJSON (data: JSONValidator)
    {
        utils.validateJSON(this, data);

        this.address = data.address;
        this.enrolled_at = data.enrolled_at;
        this.stake.fromString(data.stake);
        this.preimage.fromJSON(data.preimage);
    }
}

/**
 * @ignore
 * Define the validator in JSON
 */
export interface JSONValidator
{
    address: string;
    enrolled_at: number;
    stake: string;
    preimage: JSONPreImage;
}
