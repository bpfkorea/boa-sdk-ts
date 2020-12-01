/*******************************************************************************

    Test for TxPayloadFee

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';

describe ('TxPayloadFee', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    it ('When a negative number is entered for the size of the data.', () =>
    {
        assert.throws(() => {
            boasdk.TxPayloadFee.getFee(-1);
        }, new Error("Data size cannot be negative."));
    });

    it ('When the size of the data is greater than the maximum value.', () =>
    {
        assert.throws(() => {
            boasdk.TxPayloadFee.getFee(boasdk.TxPayloadFee.TxPayloadMaxSize+1);
        }, new Error("Data size cannot be greater than maximum."));
    });

    it ('Test for TxPayloadFee.getFee()', () =>
    {
        assert.strictEqual(boasdk.TxPayloadFee.getFee(0), BigInt(0));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(10), BigInt(500000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(20), BigInt(1100000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(30), BigInt(1600000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(40), BigInt(2200000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(50), BigInt(2800000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(60), BigInt(3500000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(70), BigInt(4200000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(80), BigInt(4900000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(90), BigInt(5700000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(100), BigInt(6500000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(110), BigInt(7300000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(120), BigInt(8200000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(130), BigInt(9200000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(140), BigInt(10100000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(150), BigInt(11200000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(160), BigInt(12300000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(170), BigInt(13400000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(180), BigInt(14600000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(190), BigInt(15900000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(200), BigInt(17200000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(210), BigInt(18600000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(220), BigInt(20000000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(230), BigInt(21600000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(240), BigInt(23200000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(250), BigInt(24900000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(260), BigInt(26700000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(270), BigInt(28600000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(280), BigInt(30600000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(290), BigInt(32600000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(300), BigInt(34800000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(310), BigInt(37100000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(320), BigInt(39500000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(330), BigInt(42100000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(340), BigInt(44700000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(350), BigInt(47500000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(360), BigInt(50500000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(370), BigInt(53600000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(380), BigInt(56900000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(390), BigInt(60300000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(400), BigInt(63900000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(410), BigInt(67700000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(420), BigInt(71700000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(430), BigInt(75800000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(440), BigInt(80300000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(450), BigInt(84900000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(460), BigInt(89700000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(470), BigInt(94900000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(480), BigInt(100200000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(490), BigInt(105900000));
        assert.strictEqual(boasdk.TxPayloadFee.getFee(500), BigInt(111800000));
    });
});
