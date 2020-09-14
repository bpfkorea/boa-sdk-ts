/*******************************************************************************

    Contains instances of requesting data from the server

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import axios from 'axios';

const version = require('../../../package.json').version;

export const Request = axios.create({
    headers: {
        "X-Client-Name": "boa-sdk-ts",
        "X-Client-Version": version,
    }
});
