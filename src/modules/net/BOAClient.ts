/*******************************************************************************

    Contains definition for the BOA Client of TypeScript.
    It is responsible for requesting and receiving responses from
    the BOA API server(Stoa).
    It also provides other functions.(Verification of signature and pre-image)

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hash } from '../data/Hash';

/**
 * Define the BOA Client of TypeScript.
 * It is responsible for requesting and receiving responses from
 * the BOA API server(Stoa).
 * It also provides other functions. (Verification of signature and pre-image)
 */
export class BOAClient
{
    /**
     * Check the validity of a new pre-image
     * @param original_image {Hash} The original pre-image hash
     * @param original_image_height {number} The original pre-image height
     * @param new_image {Hash} The new pre-image hash to check
     * @param new_image_height {number} The new pre-image height
     * @returns {IsValidPreimageResponse}
     * {result: true, message: "The pre-image is valid."} if the pre-image is valid,
     * otherwise the result is false and the message is the reason for invalid
     * See_Also: https://github.com/bpfkorea/agora/blob/
     * 93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/validation/PreImage.d#L50-L69
     */
    public isValidPreimage (
        original_image: Hash, original_image_height: number,
        new_image: Hash, new_image_height: number): IsValidPreimageResponse
    {
        if (!Number.isInteger(original_image_height) || (original_image_height < 0))
            return {
                result: false,
                message: "The original pre-image height is not valid."
            };

        if (!Number.isInteger(new_image_height) || (new_image_height < 0))
            return {
                result: false,
                message: "The new pre-image height is not valid."
            };

        if (new_image_height < original_image_height)
            return {
                result: false,
                message: "The height of new pre-image is smaller than that of original one."
            };

        let temp_hash = new Hash(new_image.data);
        for (let idx = original_image_height; idx < new_image_height; idx++)
            temp_hash = hash(temp_hash.data)

        if (!original_image.data.equals(temp_hash.data))
            return {
                result: false,
                message: "The pre-image has a invalid hash value."
            };

        return {
            result: true,
            message: "The pre-image is valid."
        };
    }
}

export interface IsValidPreimageResponse
{
    result: boolean;
    message: string;
}
