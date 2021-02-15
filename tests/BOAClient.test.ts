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
import JSBI from 'jsbi';
import randomBytes from 'randombytes';
import URI from 'urijs';

/**
 * sample JSON
 */
let sample_validators =
    [
        {
            "address": "GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN",
            "enrolled_at": 0,
            "stake": "0x210b66053c73e7bd7b27673706f0272617d09b8cda76605e91ab66ad1cc3bfc1f3f5fede91fd74bb2d2073de587c6ee495cfb0d981f03a83651b48ce0e576a1a",
            "preimage":
                {
                    "distance": 1,
                    "hash": "0"
                }
        },
        {
            "address": "GBUVRIIBMHKC4PE6BK7MO2O26U2NJLW4WGGWKLAVLAA2DLFZTBHHKOEK",
            "enrolled_at": 0,
            "stake": "0x86f1a6dff3b1f2256d2417b71ecc5511293b224894da5fd75c192965aa1874824ca777ecac678c871e717ad38c295046f4f64130f31750aa967c30c35529944a",
            "preimage":
                {
                    "distance": 1,
                    "hash": "0"
                }
        },
        {
            "address": "GBJABNUCDJCIL5YJQMB5OZ7VCFPKYLMTUXM2ZKQJACT7PXL7EVOMEKNZ",
            "enrolled_at": 0,
            "stake": "0xf21f606e96d6130b02a807655fda22c8888111f2045c0d45eda9c26d3c97741ca32fc68960ae68220809843d92671083e32395a848203380e5dfd46e4b0261f0",
            "preimage":
                {
                    "distance": 1,
                    "hash": "0"
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

let sample_tx = {
    "type": 0,
    "inputs": [
        {
            "utxo": "0xc0abcbff07879bfdb1495b8fdb9a9e5d2b07a689c7b9b3c583459082259be35687c125a1ddd6bd28b4fe8533ff794d3dba466b5f91117bbf557c3f1b6ff50e5f",
            "unlock": {
                "bytes": "o78xIUchVl3X7B/KzFtDnt1K72bVeiAK4iy1ZK4+T5m0Fw3KCxf2YBdgLJ3jANQsH5eU7+YbABxCO1ayJaAGBw=="
            },
            "unlock_age": 0
        }
    ],
    "outputs": [
        {
            "value": "4000000000000",
            "lock": {
                "type": 0,
                "bytes": "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q="
            }
        },
        {
            "value": "4000000000000",
            "lock": {
                "type": 0,
                "bytes": "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q="
            }
        },
        {
            "value": "4000000000000",
            "lock": {
                "type": 0,
                "bytes": "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q="
            }
        },
        {
            "value": "4000000000000",
            "lock": {
                "type": 0,
                "bytes": "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q="
            }
        },
        {
            "value": "4000000000000",
            "lock": {
                "type": 0,
                "bytes": "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q="
            }
        }
    ],
    "payload": "",
    "lock_height": "0"
};

let sample_txs_history =
    [
        {
            display_tx_type: 'inbound',
            address: 'GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '9',
            time: 1601553600,
            tx_hash: '0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814',
            tx_type: 'payment',
            amount: '610000000000000',
            unlock_height: '10',
            unlock_time: 1601554200
        },
        {
            display_tx_type: 'outbound',
            address: 'GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '8',
            time: 1600953600,
            tx_hash: '0x63341a4502434e2c89d0f4e46cb9cbd27dfa8a6d244685bb5eb6635d634b2179b49108e949f176906a13b8685254b1098ebf1adf44033f5c9dd6b4362c14b020',
            tx_type: 'payment',
            amount: '-610000000000000',
            unlock_height: '9',
            unlock_time: 1600954200
        },
        {
            display_tx_type: 'inbound',
            address: 'GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '7',
            time: 1600353600,
            tx_hash: '0xcf3ca7b3d5c8f6bac821a7812318eb2ab89a6b9345c5e8dbf41d5e69067c3e38642cf8679187d9c0a5ae11477f0e9d632ed950fb25baf4bcfd9b397a4a611d01',
            tx_type: 'payment',
            amount: '610000000000000',
            unlock_height: '8',
            unlock_time: 1600354200
        },
        {
            display_tx_type: 'outbound',
            address: 'GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '6',
            time: 1599753600,
            tx_hash: '0xb14c45657f4fd6ff7dc0a64c08c29304704c4c0c54096a8d3cdcff9a33d31ccfe64b3fe5d26527e90d53519189497b1c602b84db659f90d58f9d8ec10088f572',
            tx_type: 'payment',
            amount: '-610000000000000',
            unlock_height: '7',
            unlock_time: 1599754200
        },
        {
            display_tx_type: 'inbound',
            address: 'GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '5',
            time: 1599153600,
            tx_hash: '0x22152566c7d705f419752bb7907984f8071ecce51368774b42980b150cd967a72ca38bc4d3b2c6d94989458f17fcf365820f656d9bbdf2091f13c24947509fe2',
            tx_type: 'payment',
            amount: '610000000000000',
            unlock_height: '6',
            unlock_time: 1599154200
        },
        {
            display_tx_type: 'outbound',
            address: 'GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '4',
            time: 1598553600,
            tx_hash: '0x85f160d6018473ee4e38dbcb784d7e7e69ae8db77d8ab6de27e373feeb6d0e6e35d1d4952063e7a0efec3a2a7aad8b72399fecc0655b1920cfb6fc9403e5c72a',
            tx_type: 'payment',
            amount: '-610000000000000',
            unlock_height: '5',
            unlock_time: 1598554200
        },
        {
            display_tx_type: 'inbound',
            address: 'GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '3',
            time: 1597953600,
            tx_hash: '0x148891ad8dfaa13276434bfbc9525111dea803de185afe4dd12e5564b23163399e9f37bfdba4e9041ea189377f184cc25533e3361479e2e0c8dc461abe86bbfa',
            tx_type: 'payment',
            amount: '610000000000000',
            unlock_height: '4',
            unlock_time: 1597954200
        },
        {
            display_tx_type: 'outbound',
            address: 'GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '2',
            time: 1597353600,
            tx_hash: '0x2ff28f6f890be85fe2d23ff0e42bd7e5c8626cb7749e00978dd7296b28583effdb038db5a1922b06eddb5c7b23bc67e9db8d3ce3ee9b701854ab05a8cc313caa',
            tx_type: 'payment',
            amount: '-610000000000000',
            unlock_height: '3',
            unlock_time: 1597354200
        },
        {
            display_tx_type: 'inbound',
            address: 'GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD',
            peer: 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ',
            peer_count: 1,
            height: '1',
            time: 1596753600,
            tx_hash: '0x520d6766f3142d391d80ac1a47d63d7978476415030f9ff61eea2374dda1b85e7f699364d7f8db8993dd078de6f95f525c5e2d66cd20fea2ed34c340b44db9f3',
            tx_type: 'payment',
            amount: '610000000000000',
            unlock_height: '2',
            unlock_time: 1596754200
        }
    ];

let sample_tx_overview =
    {
        height: '9',
        time: 1601553600,
        tx_hash: '0xc2fed6fe6e445328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b81a2661b9a07308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52',
        tx_type: 'payment',
        unlock_height: '10',
        unlock_time: 1601554200,
        payload: '',
        senders: [
            {
                address: 'GDI22L72RGWY3BEFK2VUBWMJMSZU5SQNCQLN5FCF467RFIYN5KMY3YJT',
                amount: 610000000000000,
                utxo: '0xb0383981111438cf154c7725293009d53462c66d641f76506400f64f55f9cb2e253dafb37af9fafd8b0031e6b9789f96a3a4be06b3a15fa592828ec7f8c489cc'
            }
        ],
        receivers: [
            {
                address: 'GDA225RGC4GOCVASSAMROSWJSGNOZX2IGPXZG52ESDSKQW2VN6UJFKWI',
                amount: 610000000000000,
                utxo: '0xefed6c1701d1195524d469a3bbb058492a7922ff98e7284a01f14c0a32c31814f4ed0d6666aaf7071ae0f1eb615920173f13a63c8774aa5955a3af77c51e55e9'
            }
        ],
        fee: '0'
    };

let sample_txs_pending =
    [
        {
            tx_hash: '0xcf8e55b51027342537ebbdfc503146033fcd8091054913e78d6a858125f892a24b0734afce7154fdde85688ab1700307b999b2e5a17a724990bb83d3785e89da',
            submission_time: 1613404086,
            address: 'GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU',
            amount: '1663400000',
            fee: '0'
        },
        {
            tx_hash: '0xcf8e55b51027342537ebbdfc503146033fcd8091054913e78d6a858125f892a24b0734afce7154fdde85688ab1700307b999b2e5a17a724990bb83d3785e89da',
            submission_time: 1613404086,
            address: 'GDID227ETHPOMLRLIHVDJSNSJVLDS4D4ANYOUHXPMG2WWEZN5JO473ZO',
            amount: '24398336600000',
            fee: '0'
        }
    ];

/**
 * This allows data transfer and reception testing with the server.
 * When this is executed, the local web server is run,
 * the test codes are performed, and the web server is shut down.
 */
export class TestStoa {
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
    constructor (port: number | string) {
        if (typeof port == "string")
            this.port = parseInt(port, 10);
        else
            this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start (): Promise<void> {
        // http://localhost/validators
        this.app.get("/validators",
            (req: express.Request, res: express.Response) => {
                let height: number = Number(req.query.height);

                if (!Number.isNaN(height) && (!Number.isInteger(height) || height < 0)) {
                    res.status(400).send("The Height value is not valid.");
                    return;
                }

                let enrolled_height: number = 0;
                if (Number.isNaN(height)) height = enrolled_height;

                for (let elem of sample_validators) {
                    elem.preimage.distance = height - enrolled_height;
                }

                res.status(200).send(JSON.stringify(sample_validators));
            });

        // http://localhost/validator
        this.app.get("/validator/:address",
            (req: express.Request, res: express.Response) => {
                let height: number = Number(req.query.height);
                let address: string = String(req.params.address);

                if (!Number.isNaN(height) && (!Number.isInteger(height) || height < 0)) {
                    res.status(400).send("The Height value is not valid.");
                    return;
                }

                let enrolled_height: number = 0;
                if (Number.isNaN(height)) height = enrolled_height;

                for (let elem of sample_validators) {
                    if (elem.address == address) {
                        elem.preimage.distance = height - enrolled_height;
                        res.status(200).send(JSON.stringify([elem]));
                        return;
                    }
                }

                res.status(204).send();
            });

        // http://localhost/client_info
        this.app.get("/client_info",
            (req: express.Request, res: express.Response) => {
                res.status(200).send({
                    "X-Client-Name": req.header("X-Client-Name"),
                    "X-Client-Version": req.header("X-Client-Version"),
                });
            });

        // http://localhost/utxo
        this.app.get("/utxo/:address",
            (req: express.Request, res: express.Response) => {
                let address: boasdk.PublicKey = new boasdk.PublicKey(req.params.address);

                if (sample_utxo_address == address.toString()) {
                    res.status(200).send(JSON.stringify(sample_utxo));
                    return;
                }

                res.status(400).send();
            });


        // http://localhost/block_height
        this.app.get("/block_height",
            (req: express.Request, res: express.Response) => {
                res.status(200).send("10");
            });

        // http://localhost/transaction/fees
        this.app.get("/transaction/fees/:tx_size",
            (req: express.Request, res: express.Response) => {

                let size: string = req.params.tx_size.toString();

                if (!boasdk.Utils.isPositiveInteger(size))
                {
                    res.status(400).send(`Invalid value for parameter 'tx_size': ${size}`);
                    return;
                }

                let tx_size = JSBI.BigInt(size);
                let factor = JSBI.BigInt(200);
                let minimum = JSBI.BigInt(100_000);     // 0.01BOA
                let medium = JSBI.multiply(tx_size, factor);
                if (JSBI.lessThan(medium, minimum))
                    medium = JSBI.BigInt(minimum);

                let width = JSBI.divide(medium, JSBI.BigInt(10));
                let high = JSBI.add(medium, width);
                let low = JSBI.subtract(medium, width);
                if (JSBI.lessThan(low, minimum))
                    low = JSBI.BigInt(minimum);

                let data = {
                    tx_size: JSBI.toNumber(tx_size),
                    high: high.toString(),
                    medium: medium.toString(),
                    low: low.toString()
                };

                res.status(200).send(JSON.stringify(data));
            });

        this.app.get("/wallet/transactions/history/:address",
            (req: express.Request, res: express.Response) =>
            {
                let address: string = String(req.params.address);
                if (boasdk.PublicKey.validate(address) != '')
                {
                    res.status(400).send(`Invalid value for parameter 'address': ${address}`);
                    return;
                }
                res.status(200).send(JSON.stringify(sample_txs_history));
            });

        this.app.get("/wallet/transaction/overview/:hash",
            (req: express.Request, res: express.Response) =>
            {
                let tx_hash: boasdk.Hash;
                try
                {
                    tx_hash = new boasdk.Hash(String(req.params.hash));
                    res.status(200).send(JSON.stringify(sample_tx_overview));
                }
                catch (error)
                {
                    res.status(400).send(`Invalid value for parameter 'hash': ${String(req.params.hash)}`);
                }
            });

        this.app.get("/wallet/transactions/pending/:address",
            (req: express.Request, res: express.Response) =>
            {
                let address: string = String(req.params.address);
                if (boasdk.PublicKey.validate(address) != '')
                {
                    res.status(400).send(`Invalid value for parameter 'address': ${address}`);
                    return;
                }
                res.status(200).send(JSON.stringify(sample_txs_pending));
            });

        // http://localhost/transaction/pending
        this.app.get("/transaction/pending/:hash",
            (req: express.Request, res: express.Response) => {

                let hash: string = String(req.params.hash);

                let tx_hash: boasdk.Hash;
                try
                {
                    tx_hash = new boasdk.Hash(hash);
                }
                catch (error)
                {
                    res.status(400).send(`Invalid value for parameter 'hash': ${hash}`);
                    return;
                }

                let sample_tx_hash = new boasdk.Hash(
                    "0x4c1d71415c9ec7b182438e8bb669e324dde9be93b9c223a2ca831689d2e9598" +
                    "c628d07c84d3ee0941e9f6fb597faf4fe92518fa35e577ba12125919c0501d4bd");

                if (Buffer.compare(tx_hash.data, sample_tx_hash.data) != 0)
                {
                    res.status(204).send(`No pending transactions. hash': (${hash})`);
                }
                else
                {
                    res.status(200).send(JSON.stringify(sample_tx));
                }
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

    public stop (): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.server != null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else
                resolve();
        });
    }
}

/**
 * This is an Agora node for testing.
 * The test code allows the Agora node to be started and shut down.
 */
class TestAgora {
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
    constructor (port: number | string) {
        if (typeof port == "string")
            this.port = parseInt(port, 10);
        else
            this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start (): Promise<void> {
        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({extended: false}))
        // parse application/json
        this.app.use(bodyParser.json())

        this.app.put("/transaction",
            (req: express.Request, res: express.Response) => {
                if (req.body.tx === undefined) {
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

    public stop (): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.server != null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else
                resolve();
        });
    }
}

describe('BOA Client', () => {
    let stoa_server: TestStoa;
    let agora_server: TestAgora;
    let stoa_port: string = '5000';
    let agora_port: string = '2826';

    before('Wait for the package libsodium to finish loading', async () =>
    {
        await boasdk.SodiumHelper.init();
    });

    before('Start TestStoa', async () =>
    {
        stoa_server = new TestStoa(stoa_port);
        await stoa_server.start();
    });

    before('Start TestAgora', async () =>
    {
        agora_server = new TestAgora(agora_port);
        await agora_server.start();
    });

    after('Stop TestStoa', async () =>
    {
        await stoa_server.stop();
    });

    after('Stop TestAgora', async () =>
    {
        await agora_server.stop();
    });

    it ('Test requests and responses to data using `LocalNetworkTest`', async () =>
    {
        // Now we use axios, but in the future we will implement sdk, and test it.
        const client = axios.create();
        let stoa_uri = URI("http://localhost")
            .port(stoa_port)
            .directory("validator")
            .filename("GBJABNUCDJCIL5YJQMB5OZ7VCFPKYLMTUXM2ZKQJACT7PXL7EVOMEKNZ")
            .setSearch("height", "10");

        let response = await client.get (stoa_uri.toString());
        assert.strictEqual(response.data.length, 1);
        assert.strictEqual(response.data[0].address, "GBJABNUCDJCIL5YJQMB5OZ7VCFPKYLMTUXM2ZKQJACT7PXL7EVOMEKNZ");
        assert.strictEqual(response.data[0].preimage.distance, 10);
    });

    it ('Test a function of the BOA Client - `getAllValidators`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getAllValidators(10);
        assert.strictEqual(validators.length, 3);
        assert.strictEqual(validators[0].address, "GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN");
        assert.strictEqual(validators[0].preimage.distance, 10);
    });

    it ('Test a function of the BOA Client - `getAllValidator`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10);
        assert.strictEqual(validators.length, 1);
        assert.strictEqual(validators[0].address, "GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN");
        assert.strictEqual(validators[0].preimage.distance, 10);
    });

    it ('Test a function of the BOA Client - `getUtxo`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new boasdk.PublicKey("GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I");
        let utxos = await boa_client.getUTXOs(public_key);
        assert.strictEqual(utxos.length, sample_utxo.length);
        assert.deepStrictEqual(utxos[0].utxo, new boasdk.Hash(sample_utxo[0].utxo));
        assert.strictEqual(utxos[0].type, sample_utxo[0].type);
        assert.deepStrictEqual(utxos[0].unlock_height, JSBI.BigInt(sample_utxo[0].unlock_height));
        assert.deepStrictEqual(utxos[0].amount, JSBI.BigInt(sample_utxo[0].amount));
    });

    it ('Test a function of the BOA Client - `getBlockHeight`', async () =>
    {
        // Set URL
        let uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(uri.toString(), agora_uri.toString());

        // Query
        let height = await boa_client.getBlockHeight();
        assert.deepStrictEqual(height, JSBI.BigInt(10));
    });

    it('Test a function of the BOA Client using async, await - `getAllValidators`', async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getAllValidators(10);
        assert.strictEqual(validators.length, 3);
        assert.strictEqual(validators[0].address, "GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN");
        assert.strictEqual(validators[0].preimage.distance, 10);
    });

    it('Test a function of the BOA Client using async, await - `getAllValidator`', async () => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10);
        assert.strictEqual(validators.length, 1);
        assert.strictEqual(validators[0].address, "GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN");
        assert.strictEqual(validators[0].preimage.distance, 10);
    });

    it ('When none of the data exists as a result of the inquiry.', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let validators = await boa_client.getValidator("GX3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10);
        assert.strictEqual(validators.length, 0);
    });

    it ('When an error occurs with the wrong input parameter (height is -10).', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        await assert.rejects(
            boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", -10),
            {
                status: 400,
                message: "Bad Request",
                statusMessage: "The Height value is not valid."
            });
    });

    it ('Can not connect to the server by entering the wrong URL', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port("6000");
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        await assert.rejects(
            boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10),
            {
                message: "connect ECONNREFUSED 127.0.0.1:6000"
            });
    });

    /**
     * See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/validation/PreImage.d#L79-L106
     */
    it('test for validity of pre-image', (doneIt: () => void) => {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let pre_images: boasdk.Hash[] = [];
        pre_images.push(boasdk.hash(randomBytes(boasdk.Hash.Width)));
        for (let idx = 0; idx < 20; idx++) {
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

    it ('test for getHeightAt', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());
        let date = new Date(Date.UTC(2020, 3, 29, 0, 0, 0));
        let height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 17136);

        date = new Date(Date.UTC(2019, 3, 29, 0, 0, 0));
        await assert.rejects(
            boa_client.getHeightAt(date),
            new Error("Dates prior to the chain Genesis date (January 1, 2020) are not valid"));

        date = new Date(Date.UTC(2020, 0, 1, 0, 0, 0));
        height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 0);

        date = new Date(Date.UTC(2020, 0, 1, 0, 9, 59));
        height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 0);

        date = new Date(Date.UTC(2020, 0, 1, 0, 10, 0));
        height = await boa_client.getHeightAt(date)
        assert.strictEqual(height, 1);
    });

    it ('Test client name and version', async () =>
    {
        const version = require("../package.json").version;

        let stoa_uri = URI("http://localhost")
            .port(stoa_port)
            .directory("client_info");

        let response = await boasdk.Request.get (stoa_uri.toString())
        assert.strictEqual(response.data["X-Client-Name"], "boa-sdk-ts");
        assert.strictEqual(response.data["X-Client-Version"], version);
    });

    it('Test creating a vote data', () => {
        let utxos = [
            {
                utxo: new boasdk.Hash("0x81a326afa790003c32517a2a" +
                    "2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c2" +
                    "29b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c74" +
                    "97"),
                amount: JSBI.BigInt(100000)
            },
            {
                utxo: new boasdk.Hash("0xb82cb96710af2e9804c59d1f" +
                    "1e1679f8b8b69f4c0f6cd79c8c12f365dd766c09aaa4febcc18" +
                    "b3665d33301cb248ac7afd343ac7b98b27beaf246ad12d3b321" +
                    "9a"),
                amount: JSBI.BigInt(200000)
            },
            {
                utxo: new boasdk.Hash("0x4028965b7408566a66e4cf8c" +
                    "603a1cdebc7659a3e693d36d2fdcb39b196da967914f40ef496" +
                    "6d5b4b1f4b3aae00fbd68ffe8808b070464c2a101d44f4d7b01" +
                    "70"),
                amount: JSBI.BigInt(300000)
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
                .addInput(utxos[0].utxo, utxos[0].amount, keys[0].secret)
                .addInput(utxos[1].utxo, utxos[1].amount, keys[1].secret)
                .addInput(utxos[2].utxo, utxos[2].amount, keys[2].secret)
                .assignPayload(vote_data)
                .addOutput(new boasdk.PublicKey(boasdk.TxPayloadFee.CommonsBudgetAddress), fee)
                .sign(boasdk.TxType.Payment)

        let expected_object = {
            "type": 0,
            "inputs": [
                {
                    "utxo": "0x81a326afa790003c32517a2a2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c229b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c7497",
                    "unlock": {
                        "bytes": "ZMRoVYQ252Dx3pLE1QMANfSxtvw0UKGoDv2Zf+JN8S2JSztAUEJuj3hXAg1dVT8eyxusQBxy22fVDRfIuAL5Aw=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0xb82cb96710af2e9804c59d1f1e1679f8b8b69f4c0f6cd79c8c12f365dd766c09aaa4febcc18b3665d33301cb248ac7afd343ac7b98b27beaf246ad12d3b3219a",
                    "unlock": {
                        "bytes": "rD8Bc4ZUHQSifFT2xfib1oz/KXslkBPHgci64e7zuJ3C4s7gOAZ6g1RKvekqeu3JXXD2LJ0kR8Ln2XFyPufbAg=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0x4028965b7408566a66e4cf8c603a1cdebc7659a3e693d36d2fdcb39b196da967914f40ef4966d5b4b1f4b3aae00fbd68ffe8808b070464c2a101d44f4d7b0170",
                    "unlock": {
                        "bytes": "1c3C5C4JfMJKPqLQ47nuB97cGGfMJ9kXI4Ah+F1vrE8vXbNmJyN5WIwhyHTh255T+P0ouWwfZ3dVUNB4n69TBw=="
                    },
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "500000",
                    "lock": {
                        "type": 0,
                        "bytes": "nMY5oTUvd/IlFgxC/4kaavpbRqEaaalJIIbXeAZ29Co="
                    }
                },
                {
                    "value": "100000",
                    "lock": {
                        "type": 0,
                        "bytes": "KkpengSTntVIh037afPquSSwuq/KlbhEr/ydUPM4no4="
                    }
                }
            ],
            "payload": "0x617461642065746f76",
            "lock_height": "0"
        };

        assert.deepStrictEqual(
            JSON.stringify(vote_tx),
            JSON.stringify(expected_object));

        // Verify the signature
        for (let idx = 0; idx < vote_tx.inputs.length; idx++)
            assert.ok(keys[idx].address.verify(new boasdk.Signature(vote_tx.inputs[idx].unlock.bytes),
                boasdk.hashFull(vote_tx).data));
    });

    it ('Test saving a vote data', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let utxo = {
            utxo: new boasdk.Hash("0x81a326afa790003c32517a2a2556613004e61" +
                "47edac28d576cf7bcc2daadf4bb60be1f644c229b775e789484" +
                "4ec66b2d70ddf407b8196b46bc1dfe42061c7497"),
            amount : JSBI.BigInt(100000000)
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
    });

    it ('Test saving a vote data with `UTXOManager`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let key_pair = boasdk.KeyPair.fromSeed(new boasdk.Seed("SBUC7CPSZVNHNNYO3SY7ZNBT3K3X6RWOC3NC4FVU4GOJXC3H5BUBC7YE"));
        let block_height = await boa_client.getBlockHeight();
        let utxos = await boa_client.getUTXOs(key_pair.address);

        let vote_data = new boasdk.DataPayload("0x617461642065746f76");
        let payload_fee = boasdk.TxPayloadFee.getFee(vote_data.data.length);
        let tx_fee = JSBI.BigInt(0);

        let builder = new boasdk.TxBuilder(key_pair);

        // Create UTXOManager
        let utxo_manager = new boasdk.UTXOManager(utxos);
        // Get UTXO for the amount to need.
        utxo_manager.getUTXO(JSBI.add(JSBI.add(payload_fee, tx_fee), JSBI.BigInt(1)), block_height)
            .forEach((u:boasdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

        let expected =
            {
                "type": 0,
                "inputs": [
                    {
                        "utxo": "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        "unlock": {
                            "bytes": "ODMPbmbTEP1rLeAjCG1HBubfsWF2m7GzFpbUKuKJZDq+z5tb5m2QVkxUrEpihmUI8axkJUc11w6kaP34o4QqBg=="
                        },
                        "unlock_age": 0
                    },
                    {
                        "utxo": "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                        "unlock": {
                            "bytes": "ODMPbmbTEP1rLeAjCG1HBubfsWF2m7GzFpbUKuKJZDq+z5tb5m2QVkxUrEpihmUI8axkJUc11w6kaP34o4QqBg=="
                        },
                        "unlock_age": 0
                    },
                    {
                        "utxo": "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
                        "unlock": {
                            "bytes": "ODMPbmbTEP1rLeAjCG1HBubfsWF2m7GzFpbUKuKJZDq+z5tb5m2QVkxUrEpihmUI8axkJUc11w6kaP34o4QqBg=="
                        },
                        "unlock_age": 0
                    }
                ],
                "outputs": [
                    {
                        "value": "100000",
                        "lock": {
                            "type": 0,
                            "bytes": "2L1pan7b6W/iwgJYgbeuPqYliGn7UoBmGVZkWa6O8U8="
                        }
                    }
                ],
                "payload": "0x617461642065746f76",
                "lock_height": "0"
            };

        let tx = builder
            .assignPayload(vote_data)
            .sign(boasdk.TxType.Payment, tx_fee, payload_fee);

        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.strictEqual(JSON.stringify(tx), JSON.stringify(expected));

        let res = await boa_client.sendTransaction(tx);
        assert.ok(res);
    });

    it ('Test saving a vote data with `UTXOManager` - There is no output', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let key_pair = boasdk.KeyPair.fromSeed(new boasdk.Seed("SBUC7CPSZVNHNNYO3SY7ZNBT3K3X6RWOC3NC4FVU4GOJXC3H5BUBC7YE"));
        let block_height = await boa_client.getBlockHeight();
        let utxos = await boa_client.getUTXOs(key_pair.address);

        let vote_data = new boasdk.DataPayload("0x617461642065746f76");
        let payload_fee = JSBI.BigInt(200000);
        let tx_fee = JSBI.BigInt(0);

        let builder = new boasdk.TxBuilder(key_pair);

        // Create UTXOManager
        let utxo_manager = new boasdk.UTXOManager(utxos);
        // Get UTXO for the amount to need.
        // There can't be any output. An error occurs because the constraint of
        // the transaction is not satisfied that it must have at least one output.
        utxo_manager.getUTXO(JSBI.add(payload_fee, tx_fee), block_height)
            .forEach((u:boasdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

        assert.throws(() => {
            let tx = builder
                .assignPayload(vote_data)
                .sign(boasdk.TxType.Payment, tx_fee, payload_fee);
        });
    });

    it ('Test saving a vote data - There is at least one output', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let key_pair = boasdk.KeyPair.fromSeed(new boasdk.Seed("SBUC7CPSZVNHNNYO3SY7ZNBT3K3X6RWOC3NC4FVU4GOJXC3H5BUBC7YE"));
        let block_height = await boa_client.getBlockHeight();
        let utxos = await boa_client.getUTXOs(key_pair.address);

        let vote_data = new boasdk.DataPayload("0x617461642065746f76");
        let payload_fee = JSBI.BigInt(200000);
        let tx_fee = JSBI.BigInt(0);

        let builder = new boasdk.TxBuilder(key_pair);

        // Create UTXOManager
        let utxo_manager = new boasdk.UTXOManager(utxos);
        // Get UTXO for the amount to need.
        // The amount of the UTXO found is one greater than the fee, allowing at least one change output.
        utxo_manager.getUTXO(JSBI.add(JSBI.add(payload_fee, tx_fee), JSBI.BigInt(1)), block_height)
            .forEach((u:boasdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

        let tx = builder
            .assignPayload(vote_data)
            .sign(boasdk.TxType.Payment, tx_fee, payload_fee);

        let expected =
            {
                "type": 0,
                "inputs": [
                    {
                        "utxo": "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        "unlock": {
                            "bytes": "ZFYeW86bZ06qFwu+F6Bjegi/ZZElrwEpvlw3IkM5KyqlHzUbCx3kOXfSSo8+WUtAFbKBtzES9QxU+ywfx6RUBQ=="
                        },
                        "unlock_age": 0
                    },
                    {
                        "utxo": "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                        "unlock": {
                            "bytes": "ZFYeW86bZ06qFwu+F6Bjegi/ZZElrwEpvlw3IkM5KyqlHzUbCx3kOXfSSo8+WUtAFbKBtzES9QxU+ywfx6RUBQ=="
                        },
                        "unlock_age": 0
                    }
                ],
                "outputs": [
                    {
                        "value": "200000",
                        "lock": {
                            "type": 0,
                            "bytes": "2L1pan7b6W/iwgJYgbeuPqYliGn7UoBmGVZkWa6O8U8="
                        }
                    }
                ],
                "payload": "0x617461642065746f76",
                "lock_height": "0"
            };

        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.strictEqual(JSON.stringify(tx), JSON.stringify(expected));

        let res = await boa_client.sendTransaction(tx);
        assert.ok(res);
    });

    it('Test calculating fees of the transaction', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());
        let fees = await boa_client.getTransactionFee(0);
        assert.strictEqual(fees.medium, "100000");
        assert.strictEqual(fees.low, "100000");
        assert.strictEqual(fees.high, "110000");

        fees = await boa_client.getTransactionFee(500);
        assert.strictEqual(fees.medium, "100000");
        assert.strictEqual(fees.low, "100000");
        assert.strictEqual(fees.high, "110000");

        fees = await boa_client.getTransactionFee(1_000);
        assert.strictEqual(fees.medium, "200000");
        assert.strictEqual(fees.low, "180000");
        assert.strictEqual(fees.high, "220000");

        fees = await boa_client.getTransactionFee(100_000);
        assert.strictEqual(fees.medium, "20000000");
        assert.strictEqual(fees.low, "18000000");
        assert.strictEqual(fees.high, "22000000");
    });

    it ('Test applying accurate transaction fee', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let key_pair = boasdk.KeyPair.fromSeed(new boasdk.Seed("SBUC7CPSZVNHNNYO3SY7ZNBT3K3X6RWOC3NC4FVU4GOJXC3H5BUBC7YE"));
        let block_height = await boa_client.getBlockHeight();
        let utxos = await boa_client.getUTXOs(key_pair.address);

        let vote_data = new boasdk.DataPayload("0x617461642065746f76");
        let payload_fee = boasdk.TxPayloadFee.getFee(vote_data.data.length);

        let builder = new boasdk.TxBuilder(key_pair);

        // Create UTXOManager
        let utxo_manager = new boasdk.UTXOManager(utxos);

        let output_address = "GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW";
        let output_count = 2;
        let estimated_tx_fee = JSBI.BigInt(boasdk.Utils.FEE_FACTOR *
            boasdk.Transaction.getEstimatedNumberOfBytes(0, output_count, vote_data.data.length));

        let send_boa = JSBI.BigInt(200000);
        let total_fee = JSBI.add(payload_fee, estimated_tx_fee);
        let total_send_amount = JSBI.add(total_fee, send_boa);

        let in_utxos = utxo_manager.getUTXO(total_send_amount, block_height,
            JSBI.BigInt(boasdk.Utils.FEE_FACTOR * boasdk.TxInput.getEstimatedNumberOfBytes()));
        in_utxos.forEach((u: boasdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));
        estimated_tx_fee = JSBI.BigInt(boasdk.Utils.FEE_FACTOR *
            boasdk.Transaction.getEstimatedNumberOfBytes(in_utxos.length, output_count, vote_data.data.length));

        // Build a transaction
        let tx = builder
            .addOutput(new boasdk.PublicKey(output_address), send_boa)
            .assignPayload(vote_data)
            .sign(boasdk.TxType.Payment, estimated_tx_fee, payload_fee);

        // Get the size of the transaction
        let tx_size = tx.getNumberOfBytes();

        // Fees based on the transaction size is obtained from Stoa.
        let fees = await boa_client.getTransactionFee(tx_size);

        // Select medium
        let tx_fee = JSBI.BigInt(fees.medium);

        let sum_amount_utxo = in_utxos.reduce<JSBI>((sum, n) => JSBI.add(sum, n.amount), JSBI.BigInt(0));
        total_fee = JSBI.add(payload_fee, tx_fee);
        total_send_amount = JSBI.add(total_fee, send_boa);

        // If the value of LockType in UTXO is not a 'LockType.Key', the size may vary. The code below is for that.
        if (JSBI.lessThan(sum_amount_utxo, total_send_amount))
        {
            //  Add additional UTXO for the required amount.
            in_utxos.push(
                ...utxo_manager.getUTXO(JSBI.subtract(total_send_amount, sum_amount_utxo),
                    block_height,
                    JSBI.BigInt(boasdk.Utils.FEE_FACTOR * boasdk.TxInput.getEstimatedNumberOfBytes()))
            );
            in_utxos.forEach((u: boasdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));
            estimated_tx_fee = JSBI.BigInt(boasdk.Utils.FEE_FACTOR *
                boasdk.Transaction.getEstimatedNumberOfBytes(in_utxos.length, output_count, vote_data.data.length));

            // Build a transaction
            tx = builder
                .addOutput(new boasdk.PublicKey(output_address), send_boa)
                .assignPayload(vote_data)
                .sign(boasdk.TxType.Payment, estimated_tx_fee, payload_fee);

            // Get the size of the transaction
            tx_size = tx.getNumberOfBytes();

            // Fees based on the transaction size is obtained from Stoa.
            fees = await boa_client.getTransactionFee(tx_size);

            // Select medium
            tx_fee = JSBI.BigInt(fees.medium);
        }

        in_utxos.forEach((u: boasdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));
        tx = builder
            .addOutput(new boasdk.PublicKey(output_address), send_boa)
            .assignPayload(vote_data)
            .sign(boasdk.TxType.Payment, tx_fee, payload_fee);

        let expected = {
            "type": 0,
            "inputs": [
                {
                    "utxo": "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                    "unlock": {
                        "bytes": "D7ADPkzI0kwSxrGTyQXCsE8Z2jlSmQQUW++CzorlTzcAVgddL/CvksFudgZgMZDHDe6p9JjAlhA1W/3nzAzBBg=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                    "unlock": {
                        "bytes": "D7ADPkzI0kwSxrGTyQXCsE8Z2jlSmQQUW++CzorlTzcAVgddL/CvksFudgZgMZDHDe6p9JjAlhA1W/3nzAzBBg=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
                    "unlock": {
                        "bytes": "D7ADPkzI0kwSxrGTyQXCsE8Z2jlSmQQUW++CzorlTzcAVgddL/CvksFudgZgMZDHDe6p9JjAlhA1W/3nzAzBBg=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0xd44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92",
                    "unlock": {
                        "bytes": "D7ADPkzI0kwSxrGTyQXCsE8Z2jlSmQQUW++CzorlTzcAVgddL/CvksFudgZgMZDHDe6p9JjAlhA1W/3nzAzBBg=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0xc3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314",
                    "unlock": {
                        "bytes": "D7ADPkzI0kwSxrGTyQXCsE8Z2jlSmQQUW++CzorlTzcAVgddL/CvksFudgZgMZDHDe6p9JjAlhA1W/3nzAzBBg=="
                    },
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "200000",
                    "lock": {
                        "type": 0,
                        "bytes": "x9iUwUUAUTrwBrnguo84lfyvTZHHT46ge180pVV6WNU="
                    }
                },
                {
                    "value": "148000",
                    "lock": {
                        "type": 0,
                        "bytes": "2L1pan7b6W/iwgJYgbeuPqYliGn7UoBmGVZkWa6O8U8="
                    }
                }
            ],
            "payload": "0x617461642065746f76",
            "lock_height": "0"
        };

        assert.strictEqual(JSON.stringify(tx), JSON.stringify(expected));
    });

    it ('Test a function of the BOA Client - `getWalletTransactionsHistory`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new boasdk.PublicKey("GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I");
        let data = await boa_client.getWalletTransactionsHistory(public_key, 10, 1, ["payment", "freeze"]);
        assert.deepStrictEqual(data, sample_txs_history);
    });

    it ('Test a function of the BOA Client - `getWalletTransactionOverview`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let tx_hash = new boasdk.Hash("0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814");
        let data = await boa_client.getWalletTransactionOverview(tx_hash);
        assert.deepStrictEqual(data, sample_tx_overview);
    });

    it ('Test a function of the BOA Client - `getWalletTransactionsPending`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        let public_key = new boasdk.PublicKey("GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I");
        let data = await boa_client.getWalletTransactionsPending(public_key);
        assert.deepStrictEqual(data, sample_txs_pending);
    });

    it ('Test a function of the BOA Client - `getPendingTransaction`', async () =>
    {
        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let tx_hash = new boasdk.Hash(
            "0x4c1d71415c9ec7b182438e8bb669e324dde9be93b9c223a2ca831689d2e9598" +
            "c628d07c84d3ee0941e9f6fb597faf4fe92518fa35e577ba12125919c0501d4bd");
        let tx = await boa_client.getPendingTransaction(tx_hash);
        assert.deepStrictEqual(tx, boasdk.Transaction.reviver("", sample_tx));
    });
});
