/*******************************************************************************

    Test for KeyPair, PublicKey, SecretKey and Seed

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';
import { base32Encode, base32Decode } from '@ctrl/ts-base32';

describe ('Public Key', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    it ('Extract the public key from a string then convert it back into a string and compare it.', () =>
    {
        let address = 'GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW';
        let public_key = new boasdk.PublicKey(address);
        assert.strictEqual(public_key.toString(), address);
    });

    it ('Test of PublicKey.validate()', () =>
    {
        assert.strictEqual(boasdk.PublicKey.validate("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQF"), 'Decoded data size is not normal');
        assert.strictEqual(boasdk.PublicKey.validate("SDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW"), 'This is not a valid address type');
        assert.strictEqual(boasdk.PublicKey.validate("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW"), '');

        const decoded = Buffer.from(base32Decode("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW"));
        const body = decoded.slice(0, -2);
        const checksum = decoded.slice(-2);
        let invalid_decoded = Buffer.concat([body, checksum.map(n => ~n)]);
        let invalid_address = base32Encode(invalid_decoded);
        assert.strictEqual(boasdk.PublicKey.validate(invalid_address), 'Checksum result do not match');
    });
});

describe ('Secret Key', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    it ('Extract the seed from a string then convert it back into a string and compare it.', () =>
    {
        let secret_str = 'SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ';
        let secret_key = new boasdk.SecretKey(secret_str);
        assert.strictEqual(secret_key.toString(false), secret_str);
    });

    it ('Test of Seed.validate()', () =>
    {
        assert.strictEqual(boasdk.SecretKey.validate("SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7T"), 'Decoded data size is not normal');
        assert.strictEqual(boasdk.SecretKey.validate("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW"), 'This is not a valid seed type');
        assert.strictEqual(boasdk.SecretKey.validate("SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ"), '');

        const decoded = Buffer.from(base32Decode("SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ"));
        const body = decoded.slice(0, -2);
        const checksum = decoded.slice(-2);
        let invalid_decoded = Buffer.concat([body, checksum.map(n => ~n)]);
        let invalid_seed = base32Encode(invalid_decoded);
        assert.strictEqual(boasdk.SecretKey.validate(invalid_seed), 'Checksum result do not match');
    });
});

describe ('KeyPair', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    // See: https://github.com/bosagora/agora/blob/bcd14f2c6a3616d7f05ef850dc95fae3eb386760/source/agora/crypto/Key.d#L391-L404
    it ('Test of KeyPair.fromSeed, sign, verify', () =>
    {
        let address = `GDNODE2JBW65U6WVIOESR3OTJUFOHPHTEIL4GQINDB3MVB645KXAHG73`;
        let seed = `SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI`;

        let kp = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(seed));
        assert.strictEqual(kp.address.toString(), address);

        let signature = kp.secret.sign(Buffer.from('Hello World'));
        assert.ok(kp.address.verify(signature, Buffer.from('Hello World')));
    });

    it ('Test of KeyPair.random, sign, verify, reproduce', () =>
    {
        let random_kp = boasdk.KeyPair.random();

        let random_kp_signature = random_kp.secret.sign(Buffer.from('Hello World'));
        assert.ok(random_kp.address.verify(random_kp_signature, Buffer.from('Hello World')));

        // Test whether randomly generated key-pair are reproducible.
        let reproduced_kp = boasdk.KeyPair.fromSeed(random_kp.secret);

        let reproduced_kp_signature = reproduced_kp.secret.sign(Buffer.from('Hello World'));
        assert.ok(reproduced_kp.address.verify(reproduced_kp_signature, Buffer.from('Hello World')));

        assert.deepStrictEqual(random_kp.secret, reproduced_kp.secret);
        assert.deepStrictEqual(random_kp.address, reproduced_kp.address);
    });
});
