/*******************************************************************************

    Contains definition for the class KeyPair, PublicKey, SecretKey and Seed

    See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/crypto/Key.d

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Scalar } from "./ECC";
import { Signature } from './Signature';
import { SodiumHelper } from '../utils/SodiumHelper';
import { checksum, validate } from "../utils/CRC16";

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
     * @param address The instance of PublicKey
     * @param secret  The instance of SecretKey
     * @param seed    The instance of Seed
     */
    constructor (address: PublicKey, secret: SecretKey, seed: Seed)
    {
        this.address = address;
        this.secret = secret;
        this.seed = seed;
    }

    /**
     * Create a KeyPair from a Seed
     * @param seed The instance of Seed
     * @returns The instance of KeyPair
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
     * @returns The instance of KeyPair
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

    /**
     * Convert SecretKey(Ed25519) to Scalar(X25519)
     * @param secret SecretKey in Ed25519 format
     * @returns Converted X25519 secret key
     */
    public static secretKeyToCurveScalar (secret: SecretKey): Scalar
    {
        return new Scalar(Buffer.from(SodiumHelper.sodium.crypto_sign_ed25519_sk_to_curve25519(secret.data)));
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

            if (decoded.length != 1 + SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES + 2)
                throw new Error('Decoded data size is not normal');

            if (decoded[0] != VersionByte.AccountID)
                throw new Error('This is not a valid address type');

            const body = decoded.slice(0, -2);
            this.data = body.slice(1);

            const checksum = decoded.slice(-2);
            if (!validate(body, checksum))
                throw new Error('Checksum result do not match');
        }
        else
        {
            if (data.length !== SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES)
                throw new Error("The size of the input data is abnormal.");
            this.data = Buffer.from(data);
        }
    }

    /**
     * Verify the public key with a string for normal.
     * @param address Representing the public key as a string
     * @returns If the address passes the validation, it returns an empty string or a message.
     */
    public static validate (address: string): string
    {
        const decoded = Buffer.from(base32Decode(address));

        if (decoded.length != 1 + SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES + 2)
            return 'Decoded data size is not normal';

        if (decoded[0] != VersionByte.AccountID)
            return 'This is not a valid address type';

        const body = decoded.slice(0, -2);
        const checksum = decoded.slice(-2);
        if (!validate(body, checksum))
            return 'Checksum result do not match';

        return '';
    }

    /**
     * Uses Stellar's representation instead of hex
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
     * @param signature The signature of `msg` matching `this` public key.
     * @param msg       The signed message. Should not include the signature.
     * @returns `true` if the signature is valid
     * See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/common/crypto/Key.d#L226-L235
     */
    public verify (signature: Signature, msg: Buffer): boolean
    {
        return SodiumHelper.sodium.crypto_sign_verify_detached(signature.data, msg, this.data);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        buffer.writeBuffer(this.data);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON (key?: string): string
    {
        return this.toString();
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
        if (data.length !== SodiumHelper.sodium.crypto_sign_SECRETKEYBYTES)
            throw new Error("The size of the input data is abnormal.");
        this.data = Buffer.from(data);
    }

    /**
     * Signs a message with this private key
     * @param msg The message to sign.
     * @returns The signature of `msg` using `this`
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
            if (decoded.length != 1 + SodiumHelper.sodium.crypto_sign_SEEDBYTES + 2)
                throw new Error('Decoded data size is not normal');

            if (decoded[0] != VersionByte.Seed)
                throw new Error('This is not a valid seed type');

            const body = decoded.slice(0, -2);
            const cs = decoded.slice(-2);

            if (!validate(body, cs))
                throw new Error('Checksum result do not match');

            this.data = body.slice(1);
        }
        else
        {
            if (data.length !== SodiumHelper.sodium.crypto_sign_SEEDBYTES)
                throw new Error("The size of the input data is abnormal.");
            this.data = Buffer.from(data);
        }
    }

    /**
     * Verify the seed with a string for normal.
     * @param seed Representing the seed as a string
     * @returns If the seed passes the validation, it returns an empty string or a message.
     */
    public static validate (seed: string): string
    {
        const decoded = Buffer.from(base32Decode(seed));

        if (decoded.length != 1 + SodiumHelper.sodium.crypto_sign_SEEDBYTES + 2)
            return 'Decoded data size is not normal';

        if (decoded[0] != VersionByte.Seed)
            return 'This is not a valid seed type';

        const body = decoded.slice(0, -2);
        const checksum = decoded.slice(-2);
        if (!validate(body, checksum))
            return 'Checksum result do not match';

        return '';
    }

    /**
     * Returns a secret key seed as a string
     * @returns The secret key seed
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
