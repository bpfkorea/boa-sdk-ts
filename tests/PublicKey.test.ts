/*******************************************************************************

    Test for PublicKey

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import {PublicKey} from '../src/modules/data/PublicKey';
import * as assert from 'assert';

describe ('PublicKey', () =>
{
    it ('Extract the public key from a string, convert it back into a string, and compare it.', () =>
    {
        let address = 'GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW';
        let public_key: PublicKey = PublicKey.fromString(address);
        assert.equal(public_key.toString(), address);
    });
});
