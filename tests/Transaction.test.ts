/*******************************************************************************

    Test of Transaction

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

 *******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';

describe ('Transaction', () =>
{
    before ('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    it ('Test of estimated size', () =>
    {
        assert.strictEqual(boasdk.TxInput.getEstimatedNumberOfBytes(), 132);
        assert.strictEqual(boasdk.TxOutput.getEstimatedNumberOfBytes(), 41);
        assert.strictEqual(boasdk.Transaction.getEstimatedNumberOfBytes(0, 0, 0), 9);
    });
});
