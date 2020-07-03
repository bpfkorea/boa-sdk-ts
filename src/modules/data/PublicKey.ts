/*******************************************************************************

    Definitions of the public key / address

    See_Also: https://github.com/bpfkorea/agora/blob/
    93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/crypto/Key.d

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as utils from '../utils/CRC16';

import * as sodium from 'sodium-native'
import * as assert from 'assert';
import { base32Encode, base32Decode } from '@ctrl/ts-base32';

/**
 * Represent a public key / address
 */
export class PublicKey
{
    public readonly data: Buffer;
    public static Width: number = sodium.crypto_sign_PUBLICKEYBYTES;

    constructor (bin?: Buffer)
    {
        this.data = Buffer.alloc(PublicKey.Width);
        if (bin != undefined)
        {
            assert.equal(bin.length, PublicKey.Width);
            bin.copy(this.data);
        }
    }

    /**
     * Uses Stellar's representation instead of hex
     */
    public toString (): string
    {
        const version_buffer = Buffer.from([VersionByte.AccountID]);
        const data_check = Buffer.concat([version_buffer, this.data]);
        const checksum = utils.checksum(data_check);
        const unencoded = Buffer.concat([data_check, checksum]);
        return base32Encode(unencoded);
    }

    /**
     * Create a Public key from Stellar's string representation
     * @param str address
     */
    public static fromString (str: string): PublicKey
    {
        const decoded = Buffer.from(base32Decode(str))
        assert.equal(decoded.length, 1 + PublicKey.Width + 2);

        const version_byte = decoded[0];
        assert.equal(version_byte, VersionByte.AccountID);

        const data_check = decoded.slice(0, -2);
        const data = data_check.slice(1);
        const checksum = decoded.slice(-2);

        assert.ok(utils.validate(data_check, checksum));
        return new PublicKey(data);
    }
}

/**
 * Discriminant for Stellar binary-encoded user-facing data
 */
enum VersionByte
{
    /**
     * Used for encoded stellar addresses
     * Base32-encodes to 'G...'
     */
	AccountID = 6 << 3,

    /**
     * Used for encoded stellar seed
     * Base32-encodes to 'S...'
     */
	Seed = 18 << 3,

    /**
     * Used for encoded stellar hashTx signer keys.
     * Base32-encodes to 'T...'
     */
	HashTx = 19 << 3,

    /**
     * Used for encoded stellar hashX signer keys.
     * Base32-encodes to 'X...'
     */
	HashX = 23 << 3,
}
