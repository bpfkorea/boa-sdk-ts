/*******************************************************************************

    Test for TxPayloadFee

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';
import { BOASodium } from "boa-sodium-ts";

import * as assert from 'assert';
import JSBI from 'jsbi';

describe ('TxPayloadFee', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        boasdk.SodiumHelper.assign(new BOASodium());
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
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(0), JSBI.BigInt(0));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(10), JSBI.BigInt(500000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(20), JSBI.BigInt(1100000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(30), JSBI.BigInt(1600000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(40), JSBI.BigInt(2200000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(50), JSBI.BigInt(2800000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(60), JSBI.BigInt(3500000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(70), JSBI.BigInt(4200000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(80), JSBI.BigInt(4900000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(90), JSBI.BigInt(5700000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(100), JSBI.BigInt(6500000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(110), JSBI.BigInt(7300000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(120), JSBI.BigInt(8200000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(130), JSBI.BigInt(9200000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(140), JSBI.BigInt(10100000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(150), JSBI.BigInt(11200000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(160), JSBI.BigInt(12300000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(170), JSBI.BigInt(13400000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(180), JSBI.BigInt(14600000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(190), JSBI.BigInt(15900000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(200), JSBI.BigInt(17200000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(210), JSBI.BigInt(18600000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(220), JSBI.BigInt(20000000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(230), JSBI.BigInt(21600000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(240), JSBI.BigInt(23200000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(250), JSBI.BigInt(24900000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(260), JSBI.BigInt(26700000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(270), JSBI.BigInt(28600000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(280), JSBI.BigInt(30600000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(290), JSBI.BigInt(32600000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(300), JSBI.BigInt(34800000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(310), JSBI.BigInt(37100000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(320), JSBI.BigInt(39500000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(330), JSBI.BigInt(42100000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(340), JSBI.BigInt(44700000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(350), JSBI.BigInt(47500000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(360), JSBI.BigInt(50500000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(370), JSBI.BigInt(53600000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(380), JSBI.BigInt(56900000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(390), JSBI.BigInt(60300000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(400), JSBI.BigInt(63900000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(410), JSBI.BigInt(67700000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(420), JSBI.BigInt(71700000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(430), JSBI.BigInt(75800000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(440), JSBI.BigInt(80300000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(450), JSBI.BigInt(84900000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(460), JSBI.BigInt(89700000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(470), JSBI.BigInt(94900000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(480), JSBI.BigInt(100200000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(490), JSBI.BigInt(105900000));
        assert.deepStrictEqual(boasdk.TxPayloadFee.getFee(500), JSBI.BigInt(111800000));
    });
});
