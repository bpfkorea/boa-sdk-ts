/*******************************************************************************

    Contains definition for the public key class,

    See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/crypto/Key.d

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as utils from '../utils/CRC16';
import { Signature } from './Signature';

import { SodiumHelper } from "../utils/SodiumHelper";
import * as assert from 'assert';
import { base32Encode, base32Decode } from '@ctrl/ts-base32';

/**
 * Define the public key / address
 */
export class PublicKey
{
    /**
     * Buffer containing raw public key
     */
    public readonly data: Buffer;

    /**
     * Constructor
     * @param bin {Buffer | undefined} Raw public key
     */
    constructor (bin?: Buffer)
    {
        this.data = Buffer.alloc(SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES);
        if (bin != undefined)
        {
            assert.strictEqual(bin.length, SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES);
            bin.copy(this.data);
        }
    }

    /**
     * Uses Stellar's representation instead of hex
     * @returns {string}
     */
    public toString (): string
    {
        const body = Buffer.concat([Buffer.from([VersionByte.AccountID]), this.data]);
        const checksum = utils.checksum(body);
        const unencoded = Buffer.concat([body, checksum]);
        return base32Encode(unencoded);
    }

    /**
     * Create a Public key from Stellar's string representation
     * @param str {string} address
     * @returns {PublicKey}
     */
    public static fromString (str: string): PublicKey
    {
        const decoded = Buffer.from(base32Decode(str));
        assert.strictEqual(decoded.length, 1 + SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES + 2);
        assert.strictEqual(decoded[0], VersionByte.AccountID);

        const body = decoded.slice(0, -2);
        const data = body.slice(1);
        const checksum = decoded.slice(-2);

        assert.ok(utils.validate(body, checksum));
        return new PublicKey(data);
    }

    /**
     * Verify that a signature matches a given message
     * @param signature {Signature} The signature of `msg` matching `this` public key.
     * @param msg {Buffer} The signed message. Should not include the signature.
     * @returns {boolean} `true` if the signature is valid
     * See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/crypto/Key.d#L226-L235
     */
    public verify (signature: Signature, msg: Buffer): boolean
    {
        return SodiumHelper.sodium.crypto_sign_verify_detached(signature.data, msg, this.data);
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
