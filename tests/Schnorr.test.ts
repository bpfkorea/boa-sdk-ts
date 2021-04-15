/*******************************************************************************

    Test for Schnorr

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as sdk from "../lib";
import { BOASodium } from "boa-sodium-ts";

import * as assert from 'assert';

describe ('Test of Schnorr', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it ('Create Signature', () =>
    {
        const signature = (new sdk.Sig(
            new sdk.Point("0x921405afbfa97813293770efd55865c01055f39ad2a70f2b7a04ac043766a693"),
            new sdk.Scalar("0x074360d5eab8e888df07d862c4fc845ebd10b6a6c530919d66221219bba50216")
            )).toSignature();
        assert.deepStrictEqual(signature.toString(), "0x921405afbfa97813293770efd55865c01055f39ad2a70f2b7a04ac043766a693074360d5eab8e888df07d862c4fc845ebd10b6a6c530919d66221219bba50216");
    });

    it ('Single signature', () =>
    {
        let kp: sdk.Pair  = sdk.Pair.random();
        let signature = sdk.Schnorr.signPair<string>(kp, "Hello world");
        assert.ok(sdk.Schnorr.verify<string>(kp.V, signature, "Hello world"));
    });

    it ('Multi-signature', () =>
    {
        let secret = "BOSAGORA for the win";

        let kp1: sdk.Pair = sdk.Pair.random();
        let kp2: sdk.Pair = sdk.Pair.random();
        let R1: sdk.Pair = sdk.Pair.random();
        let R2: sdk.Pair = sdk.Pair.random();
        let R: sdk.Point = sdk.Point.add(R1.V, R2.V);
        let X: sdk.Point = sdk.Point.add(kp1.V, kp2.V);

        const sig1 = sdk.Schnorr.sign<string>(kp1.v, X, R1.v, R, secret);
        const sig2 = sdk.Schnorr.sign<string>(kp2.v, X, R2.v, R, secret);
        const sig3 = new sdk.Sig(R, sdk.Scalar.add(sdk.Sig.fromSignature(sig1).s, sdk.Sig.fromSignature(sig2).s)).toSignature();

        // No one can verify any of those individually
        assert.ok(!sdk.Schnorr.verify<string>(kp1.V, sig1, secret));
        assert.ok(!sdk.Schnorr.verify<string>(kp1.V, sig2, secret));
        assert.ok(!sdk.Schnorr.verify<string>(kp2.V, sig2, secret));
        assert.ok(!sdk.Schnorr.verify<string>(kp2.V, sig1, secret));
        assert.ok(!sdk.Schnorr.verify<string>(kp1.V, sig3, secret));
        assert.ok(!sdk.Schnorr.verify<string>(kp2.V, sig3, secret));

        // But multisig works
        assert.ok(sdk.Schnorr.verify<string>(X, sig3, secret));
    });

    it ('Test constructing Pair from scalar', () =>
    {
        let s: sdk.Scalar = sdk.Scalar.random();
        let pair1 = new sdk.Pair(s, s.toPoint());
        let pair2 = sdk.Pair.fromScalar(s);
        assert.deepStrictEqual(pair1, pair2);
    });

    it ('Valid signing test with valid scalar', () =>
    {
        let kp: sdk.Pair = sdk.Pair.fromScalar(new sdk.Scalar(`0x074360d5eab8e888df07d862c4fc845ebd10b6a6c530919d66221219bba50216`));
        let message = "Bosagora:-)";
        let signature = sdk.Schnorr.signPair<string>(kp, message);
        assert.ok(sdk.Schnorr.verify<string>(kp.V, signature, message));
    });

    it ('Valid with scalar value 1', () =>
    {
        let kp: sdk.Pair = sdk.Pair.fromScalar(new sdk.Scalar(`0x0000000000000000000000000000000000000000000000000000000000000001`));
        let message = "Bosagora:-)";
        let signature = sdk.Schnorr.signPair<string>(kp, message);
        assert.ok(sdk.Schnorr.verify<string>(kp.V, signature, message));
    });

    it ('Largest value for Scalar', () =>
    {
        // One less than Ed25519 prime order l where l=2^252 + 27742317777372353535851937790883648493
        let kp: sdk.Pair = sdk.Pair.fromScalar(new sdk.Scalar(`0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ec`));
        let message = "Bosagora:-)";
        let signature = sdk.Schnorr.signPair<string>(kp, message);
        assert.ok(sdk.Schnorr.verify<string>(kp.V, signature, message));
    });

    it ('Not valid with blank signature', () =>
    {
        let kp: sdk.Pair = sdk.Pair.fromScalar(new sdk.Scalar(`0x074360d5eab8e888df07d862c4fc845ebd10b6a6c530919d66221219bba50216`));
        let message = "Bosagora:-)";
        let signature = new sdk.Signature(Buffer.alloc(sdk.Signature.Width))
        assert.ok(!sdk.Schnorr.verify<string>(kp.V, signature, message));
    });

    it ('Valid signing test', () =>
    {
        let secret = "BOSAGORA for the win";

        let kp1: sdk.Pair = sdk.Pair.random();
        let kp2: sdk.Pair = sdk.Pair.random();
        let sig1 = sdk.Schnorr.signPair<string>(kp1, secret);
        let sig2 = sdk.Schnorr.signPair<string>(kp2, secret);
        assert.ok(sdk.Schnorr.verify<string>(kp1.V, sig1, secret));
        assert.ok(!sdk.Schnorr.verify<string>(kp1.V, sig2, secret));
        assert.ok(sdk.Schnorr.verify<string>(kp2.V, sig2, secret));
        assert.ok(!sdk.Schnorr.verify<string>(kp2.V, sig1, secret));
    });

    it ('Invalid signing test with invalid Public Key Point X', () =>
    {
        let kp: sdk.Pair = sdk.Pair.fromScalar(new sdk.Scalar(`0x074360d5eab8e888df07d862c4fc845ebd10b6a6c530919d66221219bba50216`));
        let message = "Bosagora:-)";
        let signature = sdk.Schnorr.signPair<string>(kp, message);
        let invalid = new sdk.Point("0xab4f6f6e85b8d0d38f5d5798a4bdc4dd444c8909c8a5389d3bb209a18610511c");
        assert.ok(!sdk.Schnorr.verify<string>(invalid, signature, message));
    });

    it ('Invalid signing test with invalid Point R in Signature', () =>
    {
        let kp: sdk.Pair = sdk.Pair.fromScalar(new sdk.Scalar(`0x074360d5eab8e888df07d862c4fc845ebd10b6a6c530919d66221219bba50216`));
        let message = "Bosagora:-)";
        let signature = sdk.Schnorr.signPair<string>(kp, message);
        let invalid_sig: sdk.Signature =
            new sdk.Sig(
                new sdk.Point("0xab4f6f6e85b8d0d38f5d5798a4bdc4dd444c8909c8a5389d3bb209a18610511c"),
                sdk.Sig.fromSignature(signature).s
            ).toSignature();
        assert.ok(!sdk.Schnorr.verify<string>(kp.V, invalid_sig, message));
    });

    it ('Example of extracting the private key from an insecure signature scheme', () =>
    {
        let message = "BOSAGORA for the win";
        let kp: sdk.Pair = sdk.Pair.random();  // key-pair
        let c: sdk.Scalar = sdk.Scalar.fromHash(sdk.hashFull(message));  // challenge
        let s: sdk.Scalar = sdk.Scalar.mul(kp.v, c);  // signature

        // known public data of the node
        let K: sdk.Point = kp.V;

        // other nodes verify
        assert.deepStrictEqual(s.toPoint(), sdk.Point.scalarMul(c, K));

        // but the other node can also extract the private key!
        let stolen_key: sdk.Scalar = sdk.Scalar.mul(s, c.invert());
        assert.deepStrictEqual(stolen_key, kp.v);
    });

    it ('Possibly secure signature scheme (requires proving ownership of private key)', () =>
    {
        let message = "BOSAGORA for the win";
        let kp: sdk.Pair = sdk.Pair.random();  // key-pair
        let Rp: sdk.Pair = sdk.Pair.random();  // (R, r), the public and private nonce
        let c: sdk.Scalar = sdk.Scalar.fromHash(sdk.hashFull(message));  // challenge
        let s: sdk.Scalar = sdk.Scalar.add(Rp.v, sdk.Scalar.mul(kp.v, c));  // signature

        // known public data of the node
        let K: sdk.Point = kp.V;
        let R: sdk.Point = Rp.V;

        // other nodes verify
        assert.deepStrictEqual(s.toPoint(), sdk.Point.add(R, sdk.Point.scalarMul(c, K)));

        // other nodes cannot extract the private key, they don't know 'r'
        let stolen_key: sdk.Scalar = sdk.Scalar.mul(s, c.invert());
        assert.notDeepStrictEqual(stolen_key, kp.v);
    });

    // rogue-key attack
    // see: https://tlu.tarilabs.com/cryptography/digital_signatures/introduction_schnorr_signatures.html#key-cancellation-attack
    // see: https://blockstream.com/2018/01/23/en-musig-key-aggregation-schnorr-signatures/#:~:text=not%20secure.
    it ('rogue-key attack', () =>
    {
        let message = "BOSAGORA for the win";

        // alice
        const kp1 = sdk.Pair.random(); // key-pair
        const R1 = sdk.Pair.random();  // (R, r), the public and private nonce

        // bob
        const kp2 = sdk.Pair.random(); // ditto
        const R2 = sdk.Pair.random();  // ditto

        let R = sdk.Point.add(R1.V, R2.V);
        let X = sdk.Point.add(kp1.V, kp2.V);
        let c = sdk.Scalar.fromHash(sdk.hashFull(new sdk.Message(X, R, message)));  // challenge

        let s1 = sdk.Scalar.add(R1.v, sdk.Scalar.mul(kp1.v, c));
        let s2 = sdk.Scalar.add(R2.v, sdk.Scalar.mul(kp2.v, c));
        let multi_sig = sdk.Scalar.add(s1, s2);
        assert.deepStrictEqual(multi_sig.toPoint(), sdk.Point.add(R, sdk.Point.scalarMul(c, X)));

        // now assume that bob lied about his V and R during the co-operative phase.
        let bobV = sdk.Point.sub(kp2.V, kp1.V);
        let bobR = sdk.Point.sub(R2.V, R1.V);
        X = sdk.Point.add(kp1.V, bobV);
        R = sdk.Point.add(R1.V, bobR);
        c = sdk.Scalar.fromHash(sdk.hashFull(new sdk.Message(X, R, message)));

        // bob signed the message alone, without co-operation from alice. it passes!
        let bob_sig = sdk.Scalar.add(R2.v, sdk.Scalar.mul(c, kp2.v));
        assert.deepStrictEqual(bob_sig.toPoint(), sdk.Point.add(R, sdk.Point.scalarMul(c, X)));
    });

    // rogue-key attack, but using multi-sig
    it ('rogue-key attack, but using multi-sig', () =>
    {
        let message = "BOSAGORA for the win";

        let c = sdk.Scalar.fromHash(sdk.hashFull(message));  // challenge

        let kp_1 = sdk.Pair.random();  // key-pair
        let Rp_1 = sdk.Pair.random();  // (R, r), the public and private nonce
        let s_1 = sdk.Scalar.add(Rp_1.v, sdk.Scalar.mul(c, kp_1.v));  // signature

        let kp_2 = sdk.Pair.random();  // key-pair
        let Rp_2 = sdk.Pair.random();  // (R, r), the public and private nonce
        let s_2 = sdk.Scalar.add(Rp_2.v, sdk.Scalar.mul(c, kp_2.v));  // signature

        // known public data of the nodes
        let K_1 = kp_1.V;
        let R_1 = Rp_1.V;

        let K_2 = kp_2.V;
        let R_2 = Rp_2.V;

        // verification of individual signatures
        assert.deepStrictEqual(s_1.toPoint(), sdk.Point.add(R_1, sdk.Point.scalarMul(c, K_1)));
        assert.deepStrictEqual(s_2.toPoint(), sdk.Point.add(R_2, sdk.Point.scalarMul(c, K_2)));

        // "multi-sig" - collection of one or more signatures
        let sum_s = sdk.Scalar.add(s_1, s_2);
        assert.deepStrictEqual(sum_s.toPoint(),
            sdk.Point.add(
                sdk.Point.add(R_1, sdk.Point.scalarMul(c, K_1)),
                sdk.Point.add(R_2, sdk.Point.scalarMul(c, K_2))
            ));

        // Or the equivalent:
        assert.deepStrictEqual(sum_s.toPoint(),
            sdk.Point.add(
                sdk.Point.add(
                    sdk.Point.add(R_1, R_2),
                    sdk.Point.scalarMul(c, K_1),
                ),
                sdk.Point.scalarMul(c, K_2)
            ));
    });

    it ('Test signing using Stellar seed', () =>
    {
        let seed = `SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4`;
        let kp: sdk.KeyPair = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed));
        assert.deepStrictEqual(kp.secret.scalar, new sdk.Scalar("0x080267e00c79b9ca75b646df38c2a739c36158eacfc6980b78adb3353e5d82f8"));

        let pair: sdk.Pair = sdk.Pair.fromScalar(kp.secret.scalar);
        assert.deepStrictEqual(pair.V.data, kp.address.data);
        let signature: sdk.Signature = sdk.Schnorr.signPair<string>(pair, "BOSAGORA");

        let point: sdk.Point = new sdk.Point(kp.address.data);
        assert.ok(sdk.Schnorr.verify<string>(point, signature, "BOSAGORA"));
    });
});
