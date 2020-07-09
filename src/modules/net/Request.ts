/*******************************************************************************

    Contains instances of requesting data from the server

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import axios from 'axios';

const Request = axios.create(
    {
        headers: {
            "User-Agent": "boa-sdk-ts"
        },
    });

export default Request;
