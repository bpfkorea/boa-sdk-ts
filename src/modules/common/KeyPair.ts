/*******************************************************************************

    Contains definition for the class KeyPair, PublicKey, SecretKey and Seed

    See_Also: https://github.com/bosagora/agora/blob/e5fc8fcd925c81c5fcff354880868b5fdbeffc5b/source/agora/common/crypto/Key.d

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Scalar, Point } from "./ECC";
import { Schnorr, Pair } from "./Schnorr";
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
        let x25519_sk = new Scalar(Buffer.from(SodiumHelper.sodium.crypto_sign_ed25519_sk_to_curve25519(kp.privateKey)));

        return new KeyPair(
            new PublicKey(Buffer.from(kp.publicKey)),
            new SecretKey(x25519_sk.data),
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
        let x25519_sk = new Scalar(Buffer.from(SodiumHelper.sodium.crypto_sign_ed25519_sk_to_curve25519(kp.privateKey)));
        return new KeyPair(
            new PublicKey(Buffer.from(kp.publicKey)),
            new SecretKey(x25519_sk.data),
            seed);
    }
}

/**
 * Define the public key / address
 */
export class PublicKey
{
    /**
     * The instance of the Point
     */
    public readonly point: Point;

    /**
     * Buffer containing raw point data
     */
    public get data (): Buffer
    {
        return this.point.data;
    }

    /**
     * Constructor
     * @param data The string or instance of Point or binary representation of the public key
     * @throws Will throw the error if the public key validation fails.
     */
    constructor (data: Buffer | Point | string)
    {
        if (typeof data === 'string')
        {
            const decoded = Buffer.from(base32Decode(data));

            if (decoded.length != 1 + SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES + 2)
                throw new Error('Decoded data size is not normal');

            if (decoded[0] != VersionByte.AccountID)
                throw new Error('This is not a valid address type');

            const body = decoded.slice(0, -2);
            this.point = new Point(body.slice(1));

            const checksum = decoded.slice(-2);
            if (!validate(body, checksum))
                throw new Error('Checksum result do not match');
        }
        else if (data instanceof Point)
        {
            this.point = data;
        }
        else
        {
            if (data.length !== SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES)
                throw new Error("The size of the input data is abnormal.");
            this.point = new Point(data);
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
     * See_Also: https://github.com/bosagora/agora/blob/e5fc8fcd925c81c5fcff354880868b5fdbeffc5b/source/agora/common/crypto/Key.d#L257-L261
     */
    public verify (signature: Signature, msg: Buffer): boolean
    {
        return Schnorr.verify<Buffer>(this.point, signature, msg);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        this.point.computeHash(buffer);
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
    * The instance of the Scalar
    */
    public readonly scalar: Scalar;

    /**
     * Buffer containing raw scalar data
     */
    public get data (): Buffer
    {
        return this.scalar.data;
    }

    /**
     * Constructor
     * @param data The instance of Scalar or binary data of the secret key
     * @throws Will throw the error if the secret key validation fails.
     */
    constructor (data: Buffer | Scalar)
    {
        if (data instanceof Scalar)
        {
            this.scalar = data;
        }
        else
        {
            this.scalar = new Scalar(data);
        }
    }

    /**
     * Signs a message with this private key
     * @param msg The message to sign.
     * @returns The signature of `msg` using `this`
     * See_Also: https://github.com/bosagora/agora/blob/e5fc8fcd925c81c5fcff354880868b5fdbeffc5b/source/agora/common/crypto/Key.d#L352-L355
     */
    public sign (msg: Buffer): Signature
    {
        return Schnorr.signPair<Buffer>(Pair.fromScalar(this.scalar), msg);
    }
}

/**
 * Define secret key seed
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
     * @throws Will throw the error if the seed key validation fails.
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
