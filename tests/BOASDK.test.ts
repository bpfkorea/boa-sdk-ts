/*******************************************************************************

    Test data delivery of SDK using internal web server

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as assert from 'assert';
import express from "express";
import axios from "axios";
import * as http from "http";
import URI from "urijs";

/**
 * sample JSON
 */
let sample_validators =
[
    {
        "address":"GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN",
        "enrolled_at":0,
        "stake":"0x210b66053c73e7bd7b27673706f0272617d09b8cda76605e91ab66ad1cc3bfc1f3f5fede91fd74bb2d2073de587c6ee495cfb0d981f03a83651b48ce0e576a1a",
        "preimage":
        {
            "distance":1,
            "hash":"0"
        }
    },
    {
        "address":"GBUVRIIBMHKC4PE6BK7MO2O26U2NJLW4WGGWKLAVLAA2DLFZTBHHKOEK",
        "enrolled_at":0,"stake":"0x86f1a6dff3b1f2256d2417b71ecc5511293b224894da5fd75c192965aa1874824ca777ecac678c871e717ad38c295046f4f64130f31750aa967c30c35529944a",
        "preimage":
        {
            "distance":1,
            "hash":"0"
        }
    },
    {
        "address":"GBJABNUCDJCIL5YJQMB5OZ7VCFPKYLMTUXM2ZKQJACT7PXL7EVOMEKNZ",
        "enrolled_at":0,
        "stake":"0xf21f606e96d6130b02a807655fda22c8888111f2045c0d45eda9c26d3c97741ca32fc68960ae68220809843d92671083e32395a848203380e5dfd46e4b0261f0",
        "preimage":
        {
            "distance":1,
            "hash":"0"
        }
    }
];

/**
 * This allows data transfer and reception testing with the server.
 * When this is executed, the local web server is run,
 * the test codes are performed, and the web server is shut down.
 * @param test This is the function has unittest code
 */
function LocalNetworkTest(port: string, test: (onDone: () => void) => void)
{
    let server: http.Server
    const test_app = express();

    // http://localhost/validators
    test_app.get("/validators",
        (req: express.Request , res: express.Response) =>
    {
        let height: number = Number(req.query.height);

        if (!Number.isNaN(height) && (!Number.isInteger(height) || height < 0))
        {
            res.status(400).send("The Height value is not valid.");
            return;
        }

        let enrolled_heigh: number = 0;
        if (Number.isNaN(height)) height = enrolled_heigh;

        sample_validators.forEach((elem: any) =>
        {
            elem.preimage.distance = height - enrolled_heigh;
        });

        res.status(200).send(JSON.stringify(sample_validators));
    })

    // http://localhost/validator
    test_app.get("/validator/:address",
        (req : express.Request , res : express.Response) =>
    {
        let height: number = Number(req.query.height);
        let address: string = String(req.params.address);

        if (!Number.isNaN(height) && (!Number.isInteger(height) || height < 0))
        {
            res.status(400).send("The Height value is not valid.");
            return;
        }

        let enrolled_heigh: number = 0;
        if (Number.isNaN(height)) height = enrolled_heigh;

        let done = sample_validators.some((elem: any) =>
        {
            if (elem.address == address)
            {
                elem.preimage.distance = height - enrolled_heigh;
                res.status(200).send(JSON.stringify([elem]));
                return true;
            }
        });

        if (!done) res.status(204).send();
    })

    // http://localhost/stop
    test_app.get("/stop",
        (req: express.Request, res: express.Response) =>
    {
        res.send("The test server is stopped.");
        server.close();
    })

    // Start to listen
    server = test_app.listen(port, () =>
    {
        // Run test function, the server shuts down when callback is executed.
        test(async () =>
        {
            let uri = URI("http://localhost/stop");
            uri.port(port)
            const client = axios.create();
            let response = await client.get(uri.toString())
        });
    });
};

describe ('BOA SDK', () =>
{
    let port: string = '5000';
    let doneServer: () => void;

    before('Start Server', (doneIt: () => void) =>
    {
        LocalNetworkTest (port, (done: () => void) =>
        {
            doneServer = done;
            doneIt();
        });
    });

    after('Stop Server', (doneIt: () => void) =>
    {
        doneServer();
        setTimeout(doneIt, 100);
    });

    it ('Test requests and responses to data using `LocalNetworkTest`', (doneIt: () => void) =>
    {
        // Now we use axios, but in the future we will implement sdk, and test it.
        const client = axios.create();
        let uri = URI("http://localhost")
            .port(port)
            .directory("validator")
            .filename("GBJABNUCDJCIL5YJQMB5OZ7VCFPKYLMTUXM2ZKQJACT7PXL7EVOMEKNZ")
            .setSearch("height", "10");

        client.get (uri.toString())
        .then((response) =>
        {
            assert.equal(response.data.length, 1);
            assert.equal(response.data[0].address, "GBJABNUCDJCIL5YJQMB5OZ7VCFPKYLMTUXM2ZKQJACT7PXL7EVOMEKNZ");
            assert.equal(response.data[0].preimage.distance, 10);

            doneIt();
        })
        .catch((error) =>
        {
            assert.ok(!error, error);
            doneIt();
        });
    });
  });
