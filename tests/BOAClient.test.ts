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
import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import * as http from 'http';
import randomBytes from 'randombytes';
import URI from 'urijs';

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
 * Sample UTXOs
 */
let sample_utxo_address = "GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I";
let sample_utxo =
    [
        {
            "utxo": "0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0",
            "type": 1,
            "height": "0",
            "time": 1577836800000,
            "unlock_height": "1",
            "amount": "200000"
        },
        {
            "utxo": "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
            "type": 0,
            "height": "1",
            "time": 1577837400000,
            "unlock_height": "2",
            "amount": "200000"
        },
        {
            "utxo": "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
            "type": 0,
            "height": "2",
            "time": 1577838000000,
            "unlock_height": "3",
            "amount": "200000"
        },
        {
            "utxo": "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
            "type": 0,
            "height": "3",
            "time": 1577838600000,
            "unlock_height": "4",
            "amount": "200000"
        },
        {
            "utxo": "0xd44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92",
            "type": 0,
            "height": "4",
            "time": 1577839200000,
            "unlock_height": "5",
            "unlock_time": 1577836800000,
            "amount": "200000"
        },
        {
            "utxo": "0xc3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314",
            "type": 0,
            "height": "5",
            "time": 1577839800000,
            "unlock_height": "6",
            "amount": "200000"
        },
        {
            "utxo": "0x451a5b7929615121e0f2be759222853ea3acb45c94430a03de29a47db7c70e04eb4fce5b4a0c5af01d98331732546fede05fdfaf6ab429b3960aad6a20bbf0eb",
            "type": 0,
            "height": "6",
            "time": 1577840400000,
            "unlock_height": "7",
            "amount": "200000"
        },
        {
            "utxo": "0xff05579da497ac482ccd2be1851e9ff1196314e97228a1fca62e6292b5e7ea91cadca41d6afe2d57048bf594c6dd73ab1f93e96717c73c128807905e7175beeb",
            "type": 0,
            "height": "7",
            "time": 1577841000000,
            "unlock_height": "8",
            "unlock_time": 1577836800000,
            "amount": "200000"
        },
        {
            "utxo": "0xcfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2",
            "type": 0,
            "height": "8",
            "time": 1577841600000,
            "unlock_height": "9",
            "amount": "200000"
        },
        {
            "utxo": "0x37e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b",
            "type": 0,
            "height": "9",
            "time": 1577842200000,
            "unlock_height": "10",
            "amount": "100000"
        }
    ];

/**
 * This allows data transfer and reception testing with the server.
 * When this is executed, the local web server is run,
 * the test codes are performed, and the web server is shut down.
 */
export class TestStoa
{
    /**
     * The bind port
     */
    private readonly port: number;

    /**
     * The application of express module
     */
    protected app: express.Application;

    /**
     * The Http server
     */
    protected server: http.Server | null = null;

    /**
     * Constructor
     * @param port The bind port
     */
    constructor (port: number | string)
    {
        if (typeof port == "string")
            this.port = parseInt(port, 10);
        else
            this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start (): Promise<void>
    {
        // http://localhost/validators
        this.app.get("/validators",
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

                for (let elem of sample_validators)
                {
                    elem.preimage.distance = height - enrolled_height;
                }

                res.status(200).send(JSON.stringify(sample_validators));
            });

        // http://localhost/validator
        this.app.get("/validator/:address",
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

                for (let elem of sample_validators)
                {
                    if (elem.address == address)
                    {
                        elem.preimage.distance = height - enrolled_height;
                        res.status(200).send(JSON.stringify([elem]));
                        return;
                    }
                }

                res.status(204).send();
            });

        // http://localhost/client_info
        this.app.get("/client_info",
            (req : express.Request, res : express.Response) =>
            {
                res.status(200).send({
                    "X-Client-Name": req.header("X-Client-Name"),
                    "X-Client-Version": req.header("X-Client-Version"),
                });
            });

        // http://localhost/utxo
        this.app.get("/utxo/:address",
            (req : express.Request , res : express.Response) =>
            {
                let address: boasdk.PublicKey = new boasdk.PublicKey(req.params.address);

                if (sample_utxo_address == address.toString())
                {
                    res.status(200).send(JSON.stringify(sample_utxo));
                    return;
                }

                res.status(400).send();
            });


        // http://localhost/block_height
        this.app.get("/block_height",
            (req : express.Request , res : express.Response) =>
            {
                res.status(200).send("10");
            });

        this.app.set('port', this.port);

        // Listen on provided this.port on this.address.
        return new Promise<void>((resolve, reject) => {
            // Create HTTP server.
            this.server = http.createServer(this.app);
            this.server.on('error', reject);
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }

    public stop (): Promise<void>
    {
        return new Promise<void>((resolve, reject) => {
            if (this.server != null)
                this.server.close((err?) => { err === undefined ? resolve() : reject(err); });
            else
                resolve();
        });
    }
}

/**
 * This is an Agora node for testing.
 * The test code allows the Agora node to be started and shut down.
 */
class TestAgora
{
    /**
     * The bind port
     */
    private readonly port: number;

    /**
     * The application of express module
     */
    protected app: express.Application;

    /**
     * The Http server
     */
    protected server: http.Server | null = null;

    /**
     * Constructor
     * @param port The bind port
     */
    constructor (port: number | string)
    {
        if (typeof port == "string")
            this.port = parseInt(port, 10);
        else
            this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start (): Promise<void>
    {
        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: false }))
        // parse application/json
        this.app.use(bodyParser.json())

        this.app.put("/transaction",
            (req : express.Request, res : express.Response) =>
            {
                if (req.body.tx === undefined)
                {
                    res.status(400).send("Missing 'tx' object in body");
                    return;
                }
                res.status(200).send();
            });

        this.app.set('port', this.port);

        // Listen on provided this.port on this.address.
        return new Promise<void>((resolve, reject) => {
            // Create HTTP server.
            this.server = http.createServer(this.app);
            this.server.on('error', reject);
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }

    public stop (): Promise<void>
    {
        return new Promise<void>((resolve, reject) => {
            if (this.server != null)
                this.server.close((err?) => { err === undefined ? resolve() : reject(err); });
            else
                resolve();
        });
    }
}

describe ('BOA Client', () =>
{
    let stoa_server: TestStoa;
    let agora_server: TestAgora;
    let stoa_port: string = '5000';
    let agora_port: string = '2826';

    before('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    before('Start TestStoa', () =>
    {
        stoa_server = new TestStoa(stoa_port);
        return stoa_server.start();
    });

    before('Start TestAgora', () =>
    {
        agora_server = new TestAgora(agora_port);
        return agora_server.start();
    });

    after('Stop TestStoa', () =>
    {
        return stoa_server.stop();
    });

    after('Stop TestAgora', () =>
    {
        return agora_server.stop();
    });

    it ('Test requests and responses to data using `LocalNetworkTest`', (doneIt: () => void) =>
    {
        // Now we use axios, but in the future we will implement sdk, and test it.
        const client = axios.create();
        let stoa_uri = URI("http://localhost")
            .port(stoa_port)
            .directory("validator")
            .filename("GBJABNUCDJCIL5YJQMB5OZ7VCFPKYLMTUXM2ZKQJACT7PXL7EVOMEKNZ")
            .setSearch("height", "10");

        client.get (stoa_uri.toString())
        .then((response) =>
        {
            assert.strictEqual(response.data.length, 1);
            assert.strictEqual(response.data[0].address, "GBJABNUCDJCIL5YJQMB5OZ7VCFPKYLMTUXM2ZKQJACT7PXL7EVOMEKNZ");
            assert.strictEqual(response.data[0].preimage.distance, 10);

            doneIt();
        })
        .catch((error: any) =>
        {
            assert.ok(!error, error);
            doneIt();
        });
    });

    it ('Test a function of the BOA Client - `getAllValidators`', (doneIt: () => void) =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

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
        .catch((err: any) =>
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
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

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
        .catch((err: any) =>
        {
            // On Error
            assert.ok(!err, err);

            // end of this test
            doneIt();
        });
    });

    it ('Test a function of the BOA Client - `getUtxo`', (doneIt: () => void) =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new boasdk.PublicKey("GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I");
        boa_client.getUTXOs(public_key)
        .then((utxos: Array<boasdk.UnspentTxOutput>) =>
        {
            // On Success
            assert.strictEqual(utxos.length, sample_utxo.length);
            assert.deepStrictEqual(utxos[0].utxo, new boasdk.Hash(sample_utxo[0].utxo));
            assert.strictEqual(utxos[0].type, sample_utxo[0].type);
            assert.strictEqual(utxos[0].unlock_height, BigInt(sample_utxo[0].unlock_height));
            assert.strictEqual(utxos[0].amount, BigInt(sample_utxo[0].amount));

            doneIt();
        })
        .catch((err: any) =>
        {
            // On Error
            assert.ok(!err, err);
            doneIt();
        });
    });

    it ('Test a function of the BOA Client - `getBlockHeight`', (doneIt: () => void) =>
    {
        // Set URL
        let uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString(), agora_uri.toString());

        // Query
        boa_client.getBlockHeight()
            .then((height: bigint) =>
            {
                // On Success
                assert.strictEqual(height, BigInt(10));
                doneIt();
            })
            .catch((err: any) =>
            {
                // On Error
                assert.ok(!err, err);
                doneIt();
            });
    });

    it ('Test a function of the BOA Client using async, await - `getAllValidators`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

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
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

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
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        boa_client.getValidator("GX3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10)
            .then((validators: Array<boasdk.Validator>) =>
            {
                // On Success
                assert.strictEqual(validators.length, 0);

                // end of this test
                doneIt();
            })
            .catch((err: any) =>
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
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", -10)
            .then((validators: Array<boasdk.Validator>) =>
            {
                // On Success
                assert.ok(false, "A different case occurred than expected.");

                // end of this test
                doneIt();
            })
            .catch((err: boasdk.NetworkError) =>
            {
                // On Error
                assert.strictEqual(err.status, 400);
                assert.strictEqual(err.message, "Bad Request");
                assert.strictEqual(err.statusMessage, "The Height value is not valid.");

                // end of this test
                doneIt();
            });
    });

    it ('Can not connect to the server by entering the wrong URL', (doneIt: () => void) =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port("6000");
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10)
            .then((validators: Array<boasdk.Validator>) =>
            {
                // On Success
                assert.ok(false, "A different case occurred than expected.");

                // end of this test
                doneIt();
            })
            .catch((err: any) =>
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
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

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
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());
        let date = new Date(Date.UTC(2020, 3, 29, 0, 0, 0));
        boa_client.getHeightAt(date)
        .then((height: number) =>
        {
            assert.strictEqual(height, 17136);
        })
        .catch((err: any) =>
        {
            assert.ifError(err);
        });

        date = new Date(Date.UTC(2019, 3, 29, 0, 0, 0));
        boa_client.getHeightAt(date)
        .then(() =>
        {
            assert.fail("An error must occur with an invalid input value.");
        })
        .catch((err: any) =>
        {
            assert.ok(err);
        });

        date = new Date(Date.UTC(2020, 0, 1, 0, 0, 0));
        boa_client.getHeightAt(date)
        .then((height: number) =>
        {
            assert.strictEqual(height, 0);
        })
        .catch((err: any) =>
        {
            assert.ifError(err);
        });

        date = new Date(Date.UTC(2020, 0, 1, 0, 9, 59));
        boa_client.getHeightAt(date)
        .then((height: number) =>
        {
            assert.strictEqual(height, 0);
        })
        .catch((err: any) =>
        {
            assert.ifError(err);
        });

        date = new Date(Date.UTC(2020, 0, 1, 0, 10, 0));
        boa_client.getHeightAt(date)
        .then((height: number) =>
        {
            assert.strictEqual(height, 1);
        })
        .catch((err: any) =>
        {
            assert.ifError(err);
        });
        doneIt();
    });

    it ('Test client name and version', (doneIt: () => void) =>
    {
        const version = require("../package.json").version;

        let stoa_uri = URI("http://localhost")
            .port(stoa_port)
            .directory("client_info");

        boasdk.Request.get (stoa_uri.toString())
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

    it ('Test creating a vote data', () =>
    {
        let utxos = [
            {
                utxo: new boasdk.Hash("0x81a326afa790003c32517a2a" +
                    "2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c2" +
                    "29b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c74" +
                    "97"),
                amount: BigInt(100000)
            },
            {
                utxo: new boasdk.Hash("0xb82cb96710af2e9804c59d1f" +
                    "1e1679f8b8b69f4c0f6cd79c8c12f365dd766c09aaa4febcc18" +
                    "b3665d33301cb248ac7afd343ac7b98b27beaf246ad12d3b321" +
                    "9a"),
                amount: BigInt(200000)
            },
            {
                utxo: new boasdk.Hash("0x4028965b7408566a66e4cf8c" +
                    "603a1cdebc7659a3e693d36d2fdcb39b196da967914f40ef496" +
                    "6d5b4b1f4b3aae00fbd68ffe8808b070464c2a101d44f4d7b01" +
                    "70"),
                amount: BigInt(300000)
            },
        ];

        let keys: Array<boasdk.KeyPair> = [
            boasdk.KeyPair.fromSeed(new boasdk.Seed("SDAKFNYEIAORZKKCYRILFQKLLOCNPL5SWJ3YY5NM3ZH6GJSZGXHZEPQS")),
            boasdk.KeyPair.fromSeed(new boasdk.Seed("SAXA7RLGWM5I7Q34WBKXWLDPZ3NHFHATOZG7UUOG5ZGZCM7J64OLTJOT")),
            boasdk.KeyPair.fromSeed(new boasdk.Seed("SDWAMFTNWY6XLZ2FDGBEMBYIXJTQSSA6OKSPH2YVLZH7NDE3LDFC2AJR"))
        ];

        let builder = new boasdk.TxBuilder(
            boasdk.KeyPair.fromSeed(new boasdk.Seed("SDAKFNYEIAORZKKCYRILFQKLLOCNPL5SWJ3YY5NM3ZH6GJSZGXHZEPQS")));

        let vote_data = new boasdk.DataPayload("0x617461642065746f76");
        let fee = boasdk.TxPayloadFee.getFee(vote_data.data.length);

        let vote_tx =
            builder
                .addInput(utxos[0].utxo,utxos[0].amount, keys[0].secret)
                .addInput(utxos[1].utxo,utxos[1].amount, keys[1].secret)
                .addInput(utxos[2].utxo,utxos[2].amount, keys[2].secret)
                .assignPayload(vote_data)
                .addOutput(new boasdk.PublicKey(boasdk.TxPayloadFee.CommonsBudgetAddress), fee)
                .sign(boasdk.TxType.Payment)

        let expected_object = {
            type: 0,
            inputs: [
                {
                    utxo: '0x81a326afa790003c32517a2a2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c229b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c7497',
                    signature: '0x02780c8abbc9b9e1fb1bdcd74787e968fdd53818980922543a60ffbccb4c9b67535e78293a0f5f76fff7bceefb4b5c0d5b9614f38b8e24161b1ae35408c690ef'
                },
                {
                    utxo: '0xb82cb96710af2e9804c59d1f1e1679f8b8b69f4c0f6cd79c8c12f365dd766c09aaa4febcc18b3665d33301cb248ac7afd343ac7b98b27beaf246ad12d3b3219a',
                    signature: '0x00e851b18b0ab681f5ca5982ecc5340b6cdf5151960bf0a98af5cc647a3cba758200f35da264a8b0a6f01051fb418f37f3827a5c0971f6b4ff71c9ad888d6779'
                },
                {
                    utxo: '0x4028965b7408566a66e4cf8c603a1cdebc7659a3e693d36d2fdcb39b196da967914f40ef4966d5b4b1f4b3aae00fbd68ffe8808b070464c2a101d44f4d7b0170',
                    signature: '0x04828c97c29b41838e41a5b3327824409f6413c90c68bc926ef7cefce70d53539b29786c0fbe0519574ec089ae5814c6fd3efdafb34bea37cb082bf1b8bdd02e'
                }
            ],
            outputs: [
                {
                    value: '500000',
                    address: 'GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU'
                },
                {
                    value: '100000',
                    address: 'GAVEUXU6ASJZ5VKIQ5G7W2PT5K4SJMF2V7FJLOCEV76J2UHTHCPI4IYM'
                }
            ],
            payload: '0x617461642065746f76'
        };

        assert.deepStrictEqual(
            JSON.stringify(vote_tx),
            JSON.stringify(expected_object));

        // Verify the signature
        let tx_hash = boasdk.hashFull(vote_tx);
        for (let idx = 0; idx < vote_tx.inputs.length; idx++)
            assert.ok(keys[idx].address.verify(vote_tx.inputs[idx].signature, tx_hash.data));
    });

    it ('Test saving a vote data', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        try
        {
            let utxo = {
                utxo: new boasdk.Hash("0x81a326afa790003c32517a2a2556613004e61" +
                        "47edac28d576cf7bcc2daadf4bb60be1f644c229b775e789484" +
                        "4ec66b2d70ddf407b8196b46bc1dfe42061c7497"),
                amount : BigInt(100000000)
            };
            let vote_data = new boasdk.DataPayload("0x617461642065746f76");
            let fee = boasdk.TxPayloadFee.getFee(vote_data.data.length);

            let builder = new boasdk.TxBuilder(
                boasdk.KeyPair.fromSeed(new boasdk.Seed("SDAKFNYEIAORZKKCYRILFQKLLOCNPL5SWJ3YY5NM3ZH6GJSZGXHZEPQS")));
            let tx = builder
                .addInput(utxo.utxo, utxo.amount)
                .addOutput(new boasdk.PublicKey(boasdk.TxPayloadFee.CommonsBudgetAddress), fee)
                .assignPayload(vote_data)
                .sign(boasdk.TxType.Payment);

            let res = await boa_client.sendTransaction(tx);
            assert.ok(res);
        }
        catch (err)
        {
            assert.fail(err);
        }
    });

    it ('Test saving a vote data with `UTXOManager`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        try
        {
            let key_pair = boasdk.KeyPair.fromSeed(new boasdk.Seed("SBUC7CPSZVNHNNYO3SY7ZNBT3K3X6RWOC3NC4FVU4GOJXC3H5BUBC7YE"));
            let block_height = await boa_client.getBlockHeight();
            let utxos = await boa_client.getUTXOs(key_pair.address);

            let vote_data = new boasdk.DataPayload("0x617461642065746f76");
            let fee = boasdk.TxPayloadFee.getFee(vote_data.data.length);

            let builder = new boasdk.TxBuilder(key_pair);

            // Create UTXOManager
            let utxo_manager = new boasdk.UTXOManager(utxos);
            // Get UTXO for the amount to need.
            utxo_manager.getUTXO(fee, block_height)
                .forEach((u:boasdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

            let tx = builder
                .addOutput(new boasdk.PublicKey(boasdk.TxPayloadFee.CommonsBudgetAddress), fee)
                .assignPayload(vote_data)
                .sign(boasdk.TxType.Payment);

            let expected = {
                type: 0,
                inputs: [
                    {
                        utxo: '0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85',
                        signature: '0x0ffb3ea5d227c2e2691f6a8ade638354c6665b1828512399c0a5df155f371baece80d6537619baeb3d6746677f9a92d06914292762b1b07b4938874340797c1b'
                    },
                    {
                        utxo: '0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8',
                        signature: '0x0ffb3ea5d227c2e2691f6a8ade638354c6665b1828512399c0a5df155f371baece80d6537619baeb3d6746677f9a92d06914292762b1b07b4938874340797c1b'
                    },
                    {
                        utxo: '0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685',
                        signature: '0x0ffb3ea5d227c2e2691f6a8ade638354c6665b1828512399c0a5df155f371baece80d6537619baeb3d6746677f9a92d06914292762b1b07b4938874340797c1b'
                    }
                ],
                outputs: [
                    {
                        value: '500000',
                        address: 'GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU'
                    },
                    {
                        value: '100000',
                        address: 'GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I'
                    }
                ],
                payload: '0x617461642065746f76'
            }
            assert.strictEqual(JSON.stringify(expected), JSON.stringify(tx));

            let res = await boa_client.sendTransaction(tx);
            assert.ok(res);
        }
        catch (err)
        {
            assert.fail(err);
        }
    });
});
