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
