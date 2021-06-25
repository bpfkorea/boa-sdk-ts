/*******************************************************************************

    Contains instances of requesting data from the server

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import axios from "axios";

/**
 * @ignore
 */
const version = require("../../../package.json").version;

export const Request = axios.create({
    headers: {
        "X-Client-Name": "boa-sdk-ts",
        "X-Client-Version": version,
    },
});
