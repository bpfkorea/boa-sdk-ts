/*******************************************************************************

    Contains definition for the class KeyPair, PublicKey, SecretKey and Seed

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
     * @param bin {Buffer | undefined} The binary data of the secret key
     */
    constructor (bin?: Buffer)
    {
        this.data = Buffer.alloc(SodiumHelper.sodium.crypto_sign_SECRETKEYBYTES);
        if (bin !== undefined)
        {
            assert.strictEqual(bin.length, SodiumHelper.sodium.crypto_sign_SECRETKEYBYTES);
            bin.copy(this.data);
        }
    }

    /**
     * Signs a message with this private key
     * @param {Buffer} msg The message to sign.
     * @returns {Signature} The signature of `msg` using `this`
     * See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/crypto/Key.d#L274-L282
     */
    public sign (msg: Buffer): Signature
    {
        let result = new Signature();
        result.data.set(SodiumHelper.sodium.crypto_sign_detached(msg, this.data));
        return result;
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
     * @param bin {Buffer | undefined} The binary data of the seed
     */
    constructor (bin?: Buffer)
    {
        this.data = Buffer.alloc(SodiumHelper.sodium.crypto_sign_SEEDBYTES);
        if (bin !== undefined)
        {
            assert.strictEqual(bin.length, SodiumHelper.sodium.crypto_sign_SEEDBYTES);
            bin.copy(this.data);
        }
    }

    /**
     * Returns a secret key seed as a string
     * @returns {string} The secret key seed
     */
    public toString (): string
    {
        const body = Buffer.concat([Buffer.from([VersionByte.Seed]), this.data]);
        const checksum = utils.checksum(body);
        const decoded = Buffer.concat([body, checksum]);
        return base32Encode(decoded);
    }

    /**
     * Create a seed instance from string seed
     * @param str {string} The secret key seed (ex. `SDAKFNYEIAORZKKCYRILFQKLLOCNPL5SWJ3YY5NM3ZH6GJSZGXHZEPQS`)
     * @returns {Seed} The instance of Seed
     */
    public static fromString (str: string): Seed
    {
        const decoded = Buffer.from(base32Decode(str));
        assert.strictEqual(decoded.length, 1 + SodiumHelper.sodium.crypto_sign_SEEDBYTES + 2);
        assert.strictEqual(decoded[0], VersionByte.Seed);

        const body = decoded.slice(0, -2);
        const data = body.slice(1);
        const checksum = decoded.slice(-2);

        assert.ok(utils.validate(body, checksum));
        return new Seed(data);
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
