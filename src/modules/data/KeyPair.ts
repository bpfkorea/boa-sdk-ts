/*******************************************************************************

    Contains definition for the class KeyPair, PublicKey, SecretKey and Seed

    See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/crypto/Key.d

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Signature } from './Signature';
import { SodiumHelper } from '../utils/SodiumHelper';
import { checksum, validate } from "../utils/CRC16";

import * as assert from 'assert';
import { base32Encode, base32Decode } from '@ctrl/ts-base32';
import { SmartBuffer } from 'smart-buffer';

/**
 * The class to hold a secret key + public key + seed
 */
export class KeyPair
{
    /**
     * The public key
     */
    public address: PublicKey;

    /**
     * The secret key
     */
    public secret: SecretKey;

    /**
     * The seed key
     */
    public seed: Seed;

    /**
     * Constructor
     * @param address {PublicKey} The instance of PublicKey
     * @param secret {SecretKey} The instance of SecretKey
     * @param seed {Seed} The instance of Seed
     */
    constructor (address: PublicKey, secret: SecretKey, seed: Seed)
    {
        this.address = address;
        this.secret = secret;
        this.seed = seed;
    }

    /**
     * Create a KeyPair from a Seed
     * @param seed {Seed} The instance of Seed
     * @returns {KeyPair} The instance of KeyPair
     */
    public static fromSeed (seed: Seed): KeyPair
    {
        let kp = SodiumHelper.sodium.crypto_sign_seed_keypair(seed.data);
        return new KeyPair(
            new PublicKey(Buffer.from(kp.publicKey)),
            new SecretKey(Buffer.from(kp.privateKey)),
            seed);
    }

    /**
     * Generate a KeyPair with a randomly generated Seed
     * @returns {KeyPair} The instance of KeyPair
     */
    public static random (): KeyPair
    {
        let kp = SodiumHelper.sodium.crypto_sign_keypair();
        let seed = new Seed(Buffer.from(SodiumHelper.sodium.crypto_sign_ed25519_sk_to_seed(kp.privateKey)));
        return new KeyPair(
            new PublicKey(Buffer.from(kp.publicKey)),
            new SecretKey(Buffer.from(kp.privateKey)),
            seed);
    }
}

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
     * @param data The string or binary representation of the public key
     */
    constructor (data: Buffer | string)
    {
        if (typeof data === 'string')
        {
            const decoded = Buffer.from(base32Decode(data));
            assert.strictEqual(decoded.length, 1 + SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES + 2);
            assert.strictEqual(decoded[0], VersionByte.AccountID);

            const body = decoded.slice(0, -2);
            this.data = body.slice(1);

            const checksum = decoded.slice(-2);
            assert.ok(validate(body, checksum));
        }
        else
        {
            assert.ok(data.length == SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES);
            this.data = Buffer.from(data);
        }
        assert.ok(this.data.length == SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES);
    }

    /**
     * Uses Stellar's representation instead of hex
     * @returns {string}
     */
    public toString (): string
    {
        const body = Buffer.concat([Buffer.from([VersionByte.AccountID]), this.data]);
        const cs = checksum(body);
        const unencoded = Buffer.concat([body, cs]);
        return base32Encode(unencoded);
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

    /**
     * Collects data to create a hash.
     * @param buffer - The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        buffer.writeBuffer(this.data);
    }
}

/**
 * Define the secret key
 */
export class SecretKey
{
    /**
     * Buffer containing raw secret key
     */
    public readonly data: Buffer;

    /**
     * Constructor
     * @param data The binary data of the secret key
     */
    constructor (data: Buffer)
    {
        assert.strictEqual(data.length, SodiumHelper.sodium.crypto_sign_SECRETKEYBYTES);
        this.data = Buffer.from(data);
    }

    /**
     * Signs a message with this private key
     * @param {Buffer} msg The message to sign.
     * @returns {Signature} The signature of `msg` using `this`
     * See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/crypto/Key.d#L274-L282
     */
    public sign (msg: Buffer): Signature
    {
        return new Signature(Buffer.from(SodiumHelper.sodium.crypto_sign_detached(msg, this.data)));
    }
}

/**
 * Define ed25519 secret key seed
 */
export class Seed
{
    /**
     * Buffer containing raw seed
     */
    public readonly data: Buffer;

    /**
     * Constructor
     * @param data The binary data of the seed
     */
    constructor (data: Buffer | string)
    {
        if (typeof data === 'string')
        {
            const decoded = Buffer.from(base32Decode(data));
            assert.strictEqual(decoded.length, 1 + SodiumHelper.sodium.crypto_sign_SEEDBYTES + 2);
            assert.strictEqual(decoded[0], VersionByte.Seed);

            const body = decoded.slice(0, -2);
            const cs = decoded.slice(-2);

            assert.ok(validate(body, cs));

            this.data = body.slice(1);
        }
        else
        {
            assert.strictEqual(data.length, SodiumHelper.sodium.crypto_sign_SEEDBYTES);
            this.data = Buffer.from(data);
        }
        assert.ok(this.data.length == SodiumHelper.sodium.crypto_sign_SEEDBYTES);
    }

    /**
     * Returns a secret key seed as a string
     * @returns {string} The secret key seed
     */
    public toString (): string
    {
        const body = Buffer.concat([Buffer.from([VersionByte.Seed]), this.data]);
        const cs = checksum(body);
        const decoded = Buffer.concat([body, cs]);
        return base32Encode(decoded);
    }
}

/**
 * @ignore
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
