/*******************************************************************************

    This tests the base32 function.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as assert from 'assert';
import { base32Encode, base32Decode } from '@ctrl/ts-base32';

describe ('BASE32', () =>
{
    it ('It decodes the PublicKey as BASE32 and then re-encodes it.', () =>
    {
        let address = "GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW";
        let decode = base32Decode(address);
        let endcode = base32Encode(Buffer.from(decode));
        assert.equal(address, endcode.toString());
    });
});