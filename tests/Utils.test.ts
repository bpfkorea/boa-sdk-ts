/*******************************************************************************

    Test for utility functions

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';
import { SmartBuffer } from 'smart-buffer';

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
        assert.strictEqual(boasdk.Utils.SIZE_OF_PUBLIC_KEY, boasdk.SodiumHelper.sodium.crypto_core_ed25519_BYTES);
        assert.strictEqual(boasdk.Utils.SIZE_OF_SECRET_KEY, boasdk.SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES);
    });

    it ('Test of BitField JSON serialization', () =>
    {
        let validator = new boasdk.BitField([45, 90, 150]);
        assert.strictEqual(JSON.stringify(validator), `"[45,90,150]"`);
    });

    it('Test of writeJSBigIntLE, readJSBigIntLE', () =>
    {
        let buffer = Buffer.allocUnsafe(8);
        let original = boasdk.JSBI.BigInt("9007199254740992");
        boasdk.Utils.writeJSBigIntLE(buffer, original);
        let value = boasdk.Utils.readJSBigIntLE(buffer);
        assert.deepStrictEqual(value, original);
    });

    it('Test of readBuffer', () =>
    {
        let source = SmartBuffer.fromBuffer(Buffer.from("1234567890"));
        let result = boasdk.Utils.readBuffer(source, 10);
        assert.deepStrictEqual(source.toBuffer(), result);

        source.readOffset = 0;
        assert.throws(() => {
            result = boasdk.Utils.readBuffer(source, 12);
        }, new Error("Requested 12 bytes but only 10 bytes available"));
    });

    it('Test of VarInt serialization', () => {
        let buffer = new SmartBuffer();
        boasdk.VarInt.fromNumber(0, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0]));

        buffer.clear();
        boasdk.VarInt.fromNumber(252, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFC]));

        buffer.clear();
        boasdk.VarInt.fromNumber(253, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFD, 0xFD, 0x00]));

        buffer.clear();
        boasdk.VarInt.fromNumber(255, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFD, 0xFF, 0x00]));

        buffer.clear();
        boasdk.VarInt.fromNumber(0xFFFF, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFD, 0xFF, 0xFF]));

        buffer.clear();
        boasdk.VarInt.fromNumber(0x10000, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFE, 0x00, 0x00, 0x01, 0x00]));

        buffer.clear();
        boasdk.VarInt.fromNumber(0xFFFFFFFF, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFE, 0xFF, 0xFF, 0xFF, 0xFF]));


        buffer.clear();
        boasdk.VarInt.fromJSBI(boasdk.JSBI.BigInt(0), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0]));

        buffer.clear();
        boasdk.VarInt.fromJSBI(boasdk.JSBI.BigInt(252), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFC]));

        buffer.clear();
        boasdk.VarInt.fromJSBI(boasdk.JSBI.BigInt(253), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFD, 0xFD, 0x00]));

        buffer.clear();
        boasdk.VarInt.fromJSBI(boasdk.JSBI.BigInt(255), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFD, 0xFF, 0x00]));

        buffer.clear();
        boasdk.VarInt.fromJSBI(boasdk.JSBI.BigInt(0xFFFF), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFD, 0xFF, 0xFF]));

        buffer.clear();
        boasdk.VarInt.fromJSBI(boasdk.JSBI.BigInt(0x10000), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFE, 0x00, 0x00, 0x01, 0x00]));

        buffer.clear();
        boasdk.VarInt.fromJSBI(boasdk.JSBI.BigInt(0xFFFFFFFF), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFE, 0xFF, 0xFF, 0xFF, 0xFF]));

        buffer.clear();
        boasdk.VarInt.fromJSBI(boasdk.JSBI.BigInt(0x100000000), buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFF, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]));

        buffer.clear();
        let unsigned_log_max = boasdk.JSBI.add(
            boasdk.JSBI.leftShift(boasdk.JSBI.BigInt(0xFFFFFFFF), boasdk.JSBI.BigInt(32)),
            boasdk.JSBI.BigInt(0xFFFFFFFF)
        );
        boasdk.VarInt.fromJSBI(unsigned_log_max, buffer);
        assert.deepStrictEqual(buffer.toBuffer(), Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]));
    });

    it('Test of VarInt deserialization', () =>
    {
        let buffer = new SmartBuffer();
        buffer.writeBuffer(Buffer.from([]));
        assert.throws(() => {
            boasdk.VarInt.toNumber(buffer);
        }, new Error("Requested 1 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFD]));
        assert.throws(() => {
            boasdk.VarInt.toNumber(buffer);
        }, new Error("Requested 2 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFE]));
        assert.throws(() => {
            boasdk.VarInt.toNumber(buffer);
        }, new Error("Requested 4 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([]));
        assert.throws(() => {
            boasdk.VarInt.toJSBI(buffer);
        }, new Error("Requested 1 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFD]));
        assert.throws(() => {
            boasdk.VarInt.toJSBI(buffer);
        }, new Error("Requested 2 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFE]));
        assert.throws(() => {
            boasdk.VarInt.toJSBI(buffer);
        }, new Error("Requested 4 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFF]));
        assert.throws(() => {
            boasdk.VarInt.toJSBI(buffer);
        }, new Error("Requested 8 bytes but only 0 bytes available"));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0]));
        assert.deepStrictEqual(boasdk.VarInt.toNumber(buffer), 0);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFC]));
        assert.deepStrictEqual(boasdk.VarInt.toNumber(buffer), 252);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFD, 0xFD, 0x00]));
        assert.deepStrictEqual(boasdk.VarInt.toNumber(buffer), 253);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFD, 0xFF, 0x00]));
        assert.deepStrictEqual(boasdk.VarInt.toNumber(buffer), 255);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFD, 0xFF, 0xFF]));
        assert.deepStrictEqual(boasdk.VarInt.toNumber(buffer), 0xFFFF);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFE, 0x00, 0x00, 0x01, 0x00]));
        assert.deepStrictEqual(boasdk.VarInt.toNumber(buffer), 0x10000);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFE, 0xFF, 0xFF, 0xFF, 0xFF]));
        assert.deepStrictEqual(boasdk.VarInt.toNumber(buffer), 0xFFFFFFFF);

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0]));
        assert.deepStrictEqual(boasdk.VarInt.toJSBI(buffer), boasdk.JSBI.BigInt(0));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFC]));
        assert.deepStrictEqual(boasdk.VarInt.toJSBI(buffer), boasdk.JSBI.BigInt(252));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFD, 0xFD, 0x00]));
        assert.deepStrictEqual(boasdk.VarInt.toJSBI(buffer), boasdk.JSBI.BigInt(253));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFD, 0xFF, 0x00]));
        assert.deepStrictEqual(boasdk.VarInt.toJSBI(buffer), boasdk.JSBI.BigInt(255));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFD, 0xFF, 0xFF]));
        assert.deepStrictEqual(boasdk.VarInt.toJSBI(buffer), boasdk.JSBI.BigInt(0xFFFF));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFE, 0x00, 0x00, 0x01, 0x00]));
        assert.deepStrictEqual(boasdk.VarInt.toJSBI(buffer), boasdk.JSBI.BigInt(0x10000));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFE, 0xFF, 0xFF, 0xFF, 0xFF]));
        assert.deepStrictEqual(boasdk.VarInt.toJSBI(buffer), boasdk.JSBI.BigInt(0xFFFFFFFF));

        buffer.clear();
        buffer.writeBuffer(Buffer.from([0xFF, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]));
        assert.deepStrictEqual(boasdk.VarInt.toJSBI(buffer), boasdk.JSBI.BigInt(0x100000000));

        buffer.clear();
        let unsigned_log_max = boasdk.JSBI.add(
            boasdk.JSBI.leftShift(boasdk.JSBI.BigInt(0xFFFFFFFF), boasdk.JSBI.BigInt(32)),
            boasdk.JSBI.BigInt(0xFFFFFFFF)
        );
        buffer.writeBuffer(Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]));
        assert.deepStrictEqual(boasdk.VarInt.toJSBI(buffer), unsigned_log_max);
    });
});
