/*******************************************************************************

    Test data delivery of BOA Client using internal web server

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';
import * as assert from 'assert';
import express from "express";
import axios from "axios";
import * as http from "http";
import URI from "urijs";
import randomBytes from 'randombytes';

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
 * @param port Http server port for test
 * @param test This is the function has unittest code
 */
function LocalNetworkTest(port: string, test: (onDone: () => void) => void)
{
    let server: http.Server;
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

        let enrolled_height: number = 0;
        if (Number.isNaN(height)) height = enrolled_height;

        sample_validators.forEach((elem: any) =>
        {
            elem.preimage.distance = height - enrolled_height;
        });

        res.status(200).send(JSON.stringify(sample_validators));
    });

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

        let enrolled_height: number = 0;
        if (Number.isNaN(height)) height = enrolled_height;

        let done = sample_validators.some((elem: any) =>
        {
            if (elem.address == address)
            {
                elem.preimage.distance = height - enrolled_height;
                res.status(200).send(JSON.stringify([elem]));
                return true;
            }
        });

        if (!done) res.status(204).send();
    });

    // http://localhost/client_info
    test_app.get("/client_info",
        (req : express.Request, res : express.Response) =>
    {
        res.status(200).send({
            "X-Client-Name": req.header("X-Client-Name"),
            "X-Client-Version": req.header("X-Client-Version"),
        });
    });

    // http://localhost/stop
    test_app.get("/stop",
        (req: express.Request, res: express.Response) =>
    {
        res.send("The test server is stopped.");
        server.close();
    });

    // Start to listen
    server = test_app.listen(port, () =>
    {
        // Run test function, the server shuts down when callback is executed.
        test(async () =>
        {
            let uri = URI("http://localhost/stop");
            uri.port(port);
            const client = axios.create();
            await client.get(uri.toString());
        });
    });
}

describe ('BOA Client', () =>
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

    before('Wait for the package libsodium to finish loading', (doneIt: () => void) =>
    {
        boasdk.SodiumHelper.init()
            .then(() =>
            {
                doneIt();
            })
            .catch((err: any) =>
            {
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
            assert.strictEqual(response.data.length, 1);
            assert.strictEqual(response.data[0].address, "GBJABNUCDJCIL5YJQMB5OZ7VCFPKYLMTUXM2ZKQJACT7PXL7EVOMEKNZ");
            assert.strictEqual(response.data[0].preimage.distance, 10);

            doneIt();
        })
        .catch((error) =>
        {
            assert.ok(!error, error);
            doneIt();
        });
    });

    it ('Test a function of the BOA Client - `getAllValidators`', (doneIt: () => void) =>
    {
        // Set URL
        let uri = URI("http://localhost").port(port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString());

        // Query
        boa_client.getAllValidators(10)
        .then((validators: Array<boasdk.Validator>) =>
        {
            // On Success
            assert.strictEqual(validators.length, 3);
            assert.strictEqual(validators[0].address, "GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN");
            assert.strictEqual(validators[0].preimage.distance, 10);

            // end of this test
            doneIt();
        })
        .catch(err =>
        {
            // On Error
            assert.ok(!err, err);

            // end of this test
            doneIt();
        });
    });

    it ('Test a function of the BOA Client - `getAllValidator`', (doneIt: () => void) =>
    {
        // Set URL
        let uri = URI("http://localhost").port(port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString());

        // Query
        boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10)
        .then((validators: Array<boasdk.Validator>) =>
        {
            // On Success
            assert.strictEqual(validators.length, 1);
            assert.strictEqual(validators[0].address, "GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN");
            assert.strictEqual(validators[0].preimage.distance, 10);

            // end of this test
            doneIt();
        })
        .catch(err =>
        {
            // On Error
            assert.ok(!err, err);

            // end of this test
            doneIt();
        });
    });

    it ('Test a function of the BOA Client using async, await - `getAllValidators`', async () =>
    {
        // Set URL
        let uri = URI("http://localhost").port(port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString());

        // Query
        try
        {
            let validators = await boa_client.getAllValidators(10);
            // On Success
            assert.strictEqual(validators.length, 3);
            assert.strictEqual(validators[0].address, "GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN");
            assert.strictEqual(validators[0].preimage.distance, 10);
        }
        catch (err)
        {
            // On Error
            assert.ok(!err, err);
        }
    });

    it ('Test a function of the BOA Client using async, await - `getAllValidator`', async () =>
    {
        // Set URL
        let uri = URI("http://localhost").port(port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString());

        // Query
        try
        {
            let validators = await boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10);

            // On Success
            assert.strictEqual(validators.length, 1);
            assert.strictEqual(validators[0].address, "GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN");
            assert.strictEqual(validators[0].preimage.distance, 10);
        }
        catch (err)
        {
            // On Error
            assert.ok(!err, err);
        }
    });

    it ('When none of the data exists as a result of the inquiry.', (doneIt: () => void) =>
    {
        // Set URL
        let uri = URI("http://localhost").port(port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString());

        // Query
        boa_client.getValidator("GX3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10)
            .then((validators: Array<boasdk.Validator>) =>
            {
                // On Success
                assert.strictEqual(validators.length, 0);

                // end of this test
                doneIt();
            })
            .catch(err =>
            {
                // On Error
                assert.fail(err);

                // end of this test
                doneIt();
            });
    });

    it ('When an error occurs with the wrong input parameter (height is -10).', (doneIt: () => void) =>
    {
        // Set URL
        let uri = URI("http://localhost").port(port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString());

        // Query
        boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", -10)
            .then((validators: Array<boasdk.Validator>) =>
            {
                // On Success
                assert.ok(false, "A different case occurred than expected.");

                // end of this test
                doneIt();
            })
            .catch(err =>
            {
                // On Error
                assert.strictEqual(err.message, "Bad Request, The Height value is not valid.");

                // end of this test
                doneIt();
            });
    });

    it ('Can not connect to the server by entering the wrong URL', (doneIt: () => void) =>
    {
        // Set URL
        let uri = URI("http://localhost").port("6000");

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString());

        // Query
        boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10)
            .then((validators: Array<boasdk.Validator>) =>
            {
                // On Success
                assert.ok(false, "A different case occurred than expected.");

                // end of this test
                doneIt();
            })
            .catch(err =>
            {
                // On Error
                assert.strictEqual(err.message, "connect ECONNREFUSED 127.0.0.1:6000");

                // end of this test
                doneIt();
            });
    });

    /**
     * See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/validation/PreImage.d#L79-L106
     */
    it ('test for validity of pre-image', (doneIt: () => void) =>
    {
        // Set URL
        let uri = URI("http://localhost").port(port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString());

        let pre_images: boasdk.Hash[] = [];
        pre_images.push(boasdk.hash(randomBytes(boasdk.Hash.Width)));
        for (let idx = 0; idx < 20; idx++)
        {
            pre_images.push(boasdk.hash(pre_images[idx].data))
        }
        pre_images = pre_images.reverse();

        let original_image = pre_images[0];
        let original_image_height = 1;

        // valid pre-image
        let new_image = pre_images[10];
        let new_image_height = 11;
        let res = boa_client.isValidPreimage(original_image, original_image_height, new_image, new_image_height);
        assert.ok(res.result);

        // invalid pre-image with wrong height number
        new_image = pre_images[10];
        new_image_height = 0;
        res = boa_client.isValidPreimage(original_image, original_image_height, new_image, new_image_height);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The height of new pre-image is smaller than that of original one.");

        // invalid pre-image with wrong hash value
        new_image = pre_images[10];
        new_image_height = 10;
        res = boa_client.isValidPreimage(original_image, original_image_height, new_image, new_image_height);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The pre-image has a invalid hash value.");

        // invalid (original_image_height is NaN and new_image_height is NaN)
        new_image = pre_images[10];
        new_image_height = 11;
        res = boa_client.isValidPreimage(original_image, NaN, new_image, new_image_height);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The original pre-image height is not valid.");

        // invalid (original_image_height is NaN and new_image_height is NaN)
        new_image = pre_images[10];
        res = boa_client.isValidPreimage(original_image, original_image_height, new_image, NaN);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The new pre-image height is not valid.");

        doneIt();
    });

    it ('test for getHeightAt', (doneIt: () => void) =>
    {
        // Set URL
        let uri = URI("http://localhost").port(port);
        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString());
        let date = new Date(Date.UTC(2020, 3, 29, 0, 0, 0));
        boa_client.getHeightAt(date)
        .then((height: number) =>
        {
            assert.strictEqual(height, 17136);
        })
        .catch(err =>
        {
            assert.ifError(err);
        });

        date = new Date(Date.UTC(2019, 3, 29, 0, 0, 0));
        boa_client.getHeightAt(date)
        .then(() =>
        {
            assert.fail("An error must occur with an invalid input value.");
        })
        .catch(err =>
        {
            assert.ok(err);
        });

        date = new Date(Date.UTC(2020, 0, 1, 0, 0, 0));
        boa_client.getHeightAt(date)
        .then((height: number) =>
        {
            assert.strictEqual(height, 0);
        })
        .catch(err =>
        {
            assert.ifError(err);
        });

        date = new Date(Date.UTC(2020, 0, 1, 0, 9, 59));
        boa_client.getHeightAt(date)
        .then((height: number) =>
        {
            assert.strictEqual(height, 0);
        })
        .catch(err =>
        {
            assert.ifError(err);
        });

        date = new Date(Date.UTC(2020, 0, 1, 0, 10, 0));
        boa_client.getHeightAt(date)
        .then((height: number) =>
        {
            assert.strictEqual(height, 1);
        })
        .catch(err =>
        {
            assert.ifError(err);
        });
        doneIt();
    });

    it ('Test client name and version', (doneIt: () => void) =>
    {
        const version = require("../package.json").version;

        let uri = URI("http://localhost")
            .port(port)
            .directory("client_info");

        boasdk.Request.get (uri.toString())
            .then((response: any) =>
            {
                assert.strictEqual(response.data["X-Client-Name"], "boa-sdk-ts");
                assert.strictEqual(response.data["X-Client-Version"], version);
                doneIt();
            })
            .catch((error: any) =>
            {
                assert.ok(!error, error);
                doneIt();
            });
    });
});
