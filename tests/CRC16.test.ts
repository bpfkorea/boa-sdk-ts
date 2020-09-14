/*******************************************************************************

    This tests the checksum function.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';

describe ('CRC16', () =>
{
    it ('This checks the data "123456789" and checks that it is the same as the results already known[0xC3, 0x31].', () =>
    {
        let data = Buffer.from("123456789", "ascii");
        let expected = Buffer.from([0xC3, 0x31]);
        const result = boasdk.checksum(data);
        assert.ok(result.equals(expected));
    });
});
