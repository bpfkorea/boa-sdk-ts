/*******************************************************************************

    Test for utility functions

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';
import {SodiumHelper} from "../src";

describe ('Test of isInteger, isPositiveInteger, isNegativeInteger', () =>
{
    it ('isInteger', () =>
    {
        assert.ok(!boasdk.Utils.isInteger("a12345678901234567890"));
        assert.ok(boasdk.Utils.isInteger("12345678901234567890"));
        assert.ok(boasdk.Utils.isInteger("+12345678901234567890"));
        assert.ok(boasdk.Utils.isInteger("-12345678901234567890"));
    });

    it ('isPositiveInteger', () =>
    {
        assert.ok(!boasdk.Utils.isPositiveInteger("a12345678901234567890"));
        assert.ok(boasdk.Utils.isPositiveInteger("12345678901234567890"));
        assert.ok(boasdk.Utils.isPositiveInteger("+12345678901234567890"));
        assert.ok(!boasdk.Utils.isPositiveInteger("-12345678901234567890"));
    });

    it ('isNegativeInteger', () =>
    {
        assert.ok(!boasdk.Utils.isNegativeInteger("a12345678901234567890"));
        assert.ok(!boasdk.Utils.isNegativeInteger("12345678901234567890"));
        assert.ok(!boasdk.Utils.isNegativeInteger("+12345678901234567890"));
        assert.ok(boasdk.Utils.isNegativeInteger("-12345678901234567890"));
    });
});

describe ('Test for JSON serialization', () =>
{
    it ('Test that `JSON.stringify` correctly picks up `Height.toJSON`', () =>
    {
        let height = new boasdk.Height("45");
        let json = JSON.stringify(height);
        assert.strictEqual(json, '"45"');
    });

    it ('Test that `Height.toJSON` works within an object', () =>
    {
        let height = new boasdk.Height("45");
        let json = JSON.stringify({ value: height });
        assert.strictEqual(json, '{"value":"45"}');
    });
});

describe ('Test of Utils', () =>
{
    before('Wait for the package libsodium to finish loading', async () =>
    {
        await boasdk.SodiumHelper.init();
    });

    it('Test of Utils.compareBuffer', () =>
    {
        let a = Buffer.from([6, 3, 2, 1]);
        let b = Buffer.from([5, 4, 2, 1]);
        let c = Buffer.from(b);

        assert.strictEqual(boasdk.Utils.writeToString(a), "0x01020306");
        assert.strictEqual(boasdk.Utils.writeToString(b), "0x01020405");
        assert.strictEqual(boasdk.Utils.writeToString(c), "0x01020405");

        assert.ok(Buffer.compare(a, b) > 0);
        assert.ok(boasdk.Utils.compareBuffer(a, b) < 0);
        assert.ok(boasdk.Utils.compareBuffer(b, a) > 0);
        assert.ok(boasdk.Utils.compareBuffer(b, c) == 0);
        assert.ok(boasdk.Utils.compareBuffer(c, b) == 0);

        let x = Buffer.from([   5, 4, 3, 4, 1]);
        let y = Buffer.from([6, 5, 4, 3, 4, 1]);
        assert.ok(boasdk.Utils.compareBuffer(x, y) < 0);
        assert.ok(boasdk.Utils.compareBuffer(y, x) > 0);
    });

    it ('Test of sizeof keys', () =>
    {
        assert.strictEqual(boasdk.Utils.SIZE_OF_PUBLIC_KEY, boasdk.SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES);
        assert.strictEqual(boasdk.Utils.SIZE_OF_SECRET_KEY, boasdk.SodiumHelper.sodium.crypto_sign_SECRETKEYBYTES);
        assert.strictEqual(boasdk.Utils.SIZE_OF_SEED_KEY, boasdk.SodiumHelper.sodium.crypto_sign_SEEDBYTES);
    });
});
