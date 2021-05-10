/*******************************************************************************

    This tests the serialization and deserialization of sample Blocks

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as sdk from '../lib';
import { BOASodium } from 'boa-sodium-ts';

import fs from "fs";
import * as assert from 'assert';

const samples: Array<any> =
    (() => {
        let data: string = fs.readFileSync('tests/data/Blocks.sample3.json', 'utf-8');
        return JSON.parse(data);
    })();


describe ('Test of Stoa API Server', () =>
{
    before ('Wait for the package libsodium to finish loading', async () =>
    {
        sdk.SodiumHelper.assign(new BOASodium());
        await sdk.SodiumHelper.init();
    });

    it ('Test sample blocks', () =>
    {
        let blocks: Array<sdk.Block> = [];
        blocks = samples.map(m => sdk.Block.reviver("", m));

        assert.strictEqual(blocks.length, 3);

        // Test for JSON serialization
        for (let idx = 0; idx < blocks.length; idx++)
            assert.deepStrictEqual(JSON.stringify(blocks[idx]), JSON.stringify(samples[idx]));

        // Test for block header hash
        for (let idx = 0; idx < blocks.length-1; idx++)
            assert.deepStrictEqual(sdk.hashFull(blocks[idx].header), blocks[idx+1].header.prev_block);
    });
});
