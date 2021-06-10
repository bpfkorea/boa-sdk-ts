/*******************************************************************************

    Test of Transaction

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

 *******************************************************************************/

import * as boasdk from '../lib';
import { BOASodium } from "boa-sodium-ts";

import * as assert from 'assert';

describe ('Transaction', () =>
{
    before ('Wait for the package libsodium to finish loading', () =>
    {
        boasdk.SodiumHelper.assign(new BOASodium());
        return boasdk.SodiumHelper.init();
    });

    it ('Test of estimated size', () =>
    {
        assert.strictEqual(boasdk.TxInput.getEstimatedNumberOfBytes(), 132);
        assert.strictEqual(boasdk.TxOutput.getEstimatedNumberOfBytes(), 45);
        assert.strictEqual(boasdk.Transaction.getEstimatedNumberOfBytes(0, 0, 0), 8);
    });
});
