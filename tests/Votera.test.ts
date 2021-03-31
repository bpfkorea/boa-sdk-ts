/*******************************************************************************

    Testing for the proposal and ballot data contained in payloads

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';
import { SmartBuffer } from 'smart-buffer';
import express from 'express';
import http from 'http';
import URI from 'urijs';
import bodyParser from 'body-parser';

let sample_txs_history =
    [
        {
            display_tx_type: 'payload',
            address: 'GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '100',
            time: 1600353600,
            tx_hash: '0x4ba317a25e18ca19916f40f5fcaa5d4ef0e064b4661925c32664be1d5d878512bdbeb1ba8d0efbe300252a028932e30980a741bb76a72708a0632ca0ae1e6e4a',
            tx_type: 'payment',
            amount: '-3000000',
            unlock_height: '101',
            unlock_time: 1600354200
        },
        {
            display_tx_type: 'payload',
            address: 'GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 10,
            height: '8',
            time: 1600953600,
            tx_hash: '0x2ad019850d964384812a15fa5413a9a9ae6dc21d96c7bb93d7c50bafb63145e7ff4252c6126e617502c6e2ef89198b0d02d3450a6d4301aa8d25fa21c9964209',
            tx_type: 'payment',
            amount: '-1000000000',
            unlock_height: '9',
            unlock_time: 1600954200
        },
        {
            display_tx_type: 'payload',
            address: 'GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I',
            peer: 'GDO22PFYWMU3YFLKDYP2PVM4PLX2D4BLJ2IRQMIHWJHFS3TZ6ITJMGPU',
            peer_count: 1,
            height: '9',
            time: 1601553600,
            tx_hash: '0x9a7217177205fda7a0a2716fbe86a8928e624b10b0a19414b354b2bb84a12524a0993ba724b6c9c7e5afe3ed25860ce4e006e6a390933b4d38eb6de2da575f7e',
            tx_type: 'payment',
            amount: '-10000000000',
            unlock_height: '10',
            unlock_time: 1601554200
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

        this.app.get("/transaction/:hash",
            (req: express.Request, res: express.Response) =>
            {
                let hash: string = String(req.params.hash);
                let tx_hash: boasdk.Hash;
                try
                {
                    tx_hash = new boasdk.Hash(hash);
                    if (tx_hash.toString() === "0x9a7217177205fda7a0a2716fbe86a8928e624b10b0a19414b354b2bb84a12524a0993ba724b6c9c7e5afe3ed25860ce4e006e6a390933b4d38eb6de2da575f7e")
                    {
                        let tx = new boasdk.Transaction(
                            boasdk.TxType.Payment,
                            [
                                new boasdk.TxInput(new boasdk.Hash("0xc0abcbff07879bfdb1495b8fdb9a9e5d2b07a689c7b9b3c583459082259be35687c125a1ddd6bd28b4fe8533ff794d3dba466b5f91117bbf557c3f1b6ff50e5f"))
                            ],
                            [
                                new boasdk.TxOutput("100000000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU")))
                            ],
                            new boasdk.DataPayload(Buffer.from("CFBST1AtRkVFDElEMTIzNDU2Nzg5MA==", "base64"))
                        );
                        res.status(200).send(JSON.stringify(tx));
                    }
                    else if (tx_hash.toString() === "0x2ad019850d964384812a15fa5413a9a9ae6dc21d96c7bb93d7c50bafb63145e7ff4252c6126e617502c6e2ef89198b0d02d3450a6d4301aa8d25fa21c9964209")
                    {
                        let tx = new boasdk.Transaction(
                            boasdk.TxType.Payment,
                            [
                                new boasdk.TxInput(new boasdk.Hash("0xc0abcbff07879bfdb1495b8fdb9a9e5d2b07a689c7b9b3c583459082259be35687c125a1ddd6bd28b4fe8533ff794d3dba466b5f91117bbf557c3f1b6ff50e5f"))
                            ],
                            [
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDB22QJ4NHOHPOGWZG2Y5IFXKW6DCBEFX6QNBR6NSCT6E7CYU66IDGJJ"))),
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDD22H4TGRGS5ENN3DHBGMMCSZELKORKEZT4SZKTKHZESTVQMONREB2D"))),
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD"))),
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDF22EW2CZW2KVRSLFNGJQOTTDH5XWOK7MLINZPWO526WWXJMDXU3DPI"))),
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDA225RGC4GOCVASSAMROSWJSGNOZX2IGPXZG52ESDSKQW2VN6UJFKWI"))),
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDE22BZJPPMELAQUZBQR7GTILNHMSUHS5J2BVMKU36LPW3SSKQU737SP"))),
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDK223SKRC2QD3FFIXSZJRL6SKQI4MLJNVJB4FE356OEIVVGWGBAWLRM"))),
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDJ227UY64U4VLOW773KIT64RHHRZKRZFA7YS7MFMJK5WUDEQCEEEJUW"))),
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDP22NLZYRX2TBOBWTG46YCHB7WV76J56TMDZO5TDUQPIL7NCM4Q7TGU"))),
                            ],
                            new boasdk.DataPayload(Buffer.from("CFBST1BPU0FMAQxJRDEyMzQ1Njc4OTAFVGl0bGX96AP90gsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wCgck4YCQAA/wDodkgXAAAA/sD8mwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAx9iUwUUAUTrwBrnguo84lfyvTZHHT46ge180pVV6WNWcxjmhNS938iUWDEL/iRpq+ltGoRppqUkghtd4Bnb0Kg==", "base64"))
                        );
                        res.status(200).send(JSON.stringify(tx));
                    }
                    else
                    {
                        let tx = new boasdk.Transaction(
                            boasdk.TxType.Payment,
                            [
                                new boasdk.TxInput(new boasdk.Hash("0xc0abcbff07879bfdb1495b8fdb9a9e5d2b07a689c7b9b3c583459082259be35687c125a1ddd6bd28b4fe8533ff794d3dba466b5f91117bbf557c3f1b6ff50e5f"))
                            ],
                            [
                                new boasdk.TxOutput("3000000", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I")))
                            ],
                            new boasdk.DataPayload(Buffer.from("CEJBTExPVCAgDElEMTIzNDU2Nzg5MCnNDXqsIjf122wQG3k9SKb580hRF7MXqyls/Wjq7dxrztafXvbMlKQnLMWtIp2TBufIJIhInD6XvqjImZjxWdzHSZiNYVXVuKDmx60Co13nUDL3h+pKXCsG460FHRgDZWnJFfTYnch/tLj+gJaYAJGWUGjimvGZAq2HVp9kC3ClurMEA05RNDV484T/bh8I86ZoO4yFlkiLwOf+QOtUR0Qf65D2Rg2yq5V+YT05AAJkbTtR5m+izCVSoIcXz4+Nju9lq2K/FkcdJGrAsrYiRoPuerQHTl9HopfqdZDjFO4gcciSaI5x5mws87fLGSL9AQ==", "base64"))
                        );
                        res.status(200).send(JSON.stringify(tx));
                    }
                }
                catch (error)
                {
                    res.status(400).send(`Invalid value for parameter 'hash': ${hash}`);
                    return;
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

describe('Checking the proposal and ballot data', () =>
{
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

    it ('Test data for proposals and votes', async () =>
    {
        let expected_data = {
            proposal_type: boasdk.ProposalType.Fund,
            proposal_id: "ID1234567890",
            proposal_title: "Title",
            vote_start_height: boasdk.JSBI.BigInt(1000),
            vote_end_height: boasdk.JSBI.BigInt(3026),
            doc_hash: new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            fund_amount: boasdk.JSBI.BigInt(10000000000000),
            proposal_fee: boasdk.JSBI.BigInt(100000000000),
            vote_fee: boasdk.JSBI.BigInt(27000000),
            tx_hash_proposal_fee: new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            proposer_address: new boasdk.PublicKey("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW"),
            proposal_fee_address: new boasdk.PublicKey("GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU")
        }

        let validators =
            [
                "GDB22QJ4NHOHPOGWZG2Y5IFXKW6DCBEFX6QNBR6NSCT6E7CYU66IDGJJ",
                "GDD22H4TGRGS5ENN3DHBGMMCSZELKORKEZT4SZKTKHZESTVQMONREB2D",
                "GDG22B5FTPXE5THQMCTGDUC4LF2N4DFF44PGX2LIFG4WNUZZAT4L6ZGD",
                "GDF22EW2CZW2KVRSLFNGJQOTTDH5XWOK7MLINZPWO526WWXJMDXU3DPI",
                "GDA225RGC4GOCVASSAMROSWJSGNOZX2IGPXZG52ESDSKQW2VN6UJFKWI",
                "GDE22BZJPPMELAQUZBQR7GTILNHMSUHS5J2BVMKU36LPW3SSKQU737SP",
                "GDK223SKRC2QD3FFIXSZJRL6SKQI4MLJNVJB4FE356OEIVVGWGBAWLRM",
                "GDJ227UY64U4VLOW773KIT64RHHRZKRZFA7YS7MFMJK5WUDEQCEEEJUW",
                "GDP22NLZYRX2TBOBWTG46YCHB7WV76J56TMDZO5TDUQPIL7NCM4Q7TGU"
            ];

        // Set URL
        let stoa_uri = URI("http://localhost").port(stoa_port);
        let agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        let boa_client = new boasdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // It queries the last 10 transactions that have a data payload of a particular address.
        let public_key = new boasdk.PublicKey("GDML22LKP3N6S37CYIBFRANXVY7KMJMINH5VFADGDFLGIWNOR3YU7T6I");
        let history = await boa_client.getWalletTransactionsHistory(public_key, 10, 1, ["payload"]);

        for (let idx = 0; idx < history.length; idx++)
        {
            if (history[idx].display_tx_type === "payload")
            {
                let tx = await boa_client.getTransaction(new boasdk.Hash(history[idx].tx_hash));
                let header = tx.payload.data.slice(1, 9);
                if (Buffer.compare(Buffer.from(boasdk.ProposalFeeData.HEADER), header) === 0)
                {
                    // Exceptions should be handled in actual use.
                    assert.doesNotThrow(() => {
                        let payload = boasdk.ProposalFeeData.deserialize(SmartBuffer.fromBuffer(tx.payload.data));
                        // This verifies that the proposed ID is the same.
                        assert.strictEqual(payload.proposal_id, expected_data.proposal_id);
                        // This verifies that the deposit address and amount of the proposed fee are appropriate.
                        let find_idx = tx.outputs.findIndex((o) => (new boasdk.PublicKey(o.lock.bytes).toString() === expected_data.proposal_fee_address.toString()));
                        assert.ok(find_idx >= 0);
                        assert.ok(boasdk.JSBI.greaterThanOrEqual(tx.outputs[find_idx].value, expected_data.proposal_fee));
                    });
                }
                else if (Buffer.compare(Buffer.from(boasdk.ProposalData.HEADER), header) === 0)
                {
                    // Exceptions should be handled in actual use.
                    assert.doesNotThrow(() => {
                        // This verifies that the contents of the proposed data are the same.
                        let payload = boasdk.ProposalData.deserialize(SmartBuffer.fromBuffer(tx.payload.data));
                        assert.deepStrictEqual(payload.proposal_type, expected_data.proposal_type);
                        assert.deepStrictEqual(payload.proposal_id, expected_data.proposal_id);
                        assert.deepStrictEqual(payload.proposal_title, expected_data.proposal_title);
                        assert.deepStrictEqual(payload.vote_start_height, expected_data.vote_start_height);
                        assert.deepStrictEqual(payload.vote_end_height, expected_data.vote_end_height);
                        assert.deepStrictEqual(payload.doc_hash, expected_data.doc_hash);
                        assert.deepStrictEqual(payload.fund_amount, expected_data.fund_amount);
                        assert.deepStrictEqual(payload.proposal_fee, expected_data.proposal_fee);
                        assert.deepStrictEqual(payload.vote_fee, expected_data.vote_fee);
                        assert.deepStrictEqual(payload.tx_hash_proposal_fee, expected_data.tx_hash_proposal_fee);
                        assert.deepStrictEqual(payload.proposer_address, expected_data.proposer_address);
                        assert.deepStrictEqual(payload.proposal_fee_address, expected_data.proposal_fee_address);

                        let vote_cost = boasdk.JSBI.divide(expected_data.vote_fee, boasdk.JSBI.BigInt(validators.length));
                        // This verifies that the voting costs have been paid to all validators.
                        let sum_vote_cost = boasdk.JSBI.BigInt(0);
                        validators.forEach((validator) => {
                            let find_idx = tx.outputs.findIndex((o) => (new boasdk.PublicKey(o.lock.bytes).toString() === validator));
                            assert.ok(find_idx >= 0);
                            assert.ok(boasdk.JSBI.greaterThanOrEqual(tx.outputs[find_idx].value, vote_cost));
                            sum_vote_cost = boasdk.JSBI.add(sum_vote_cost, tx.outputs[find_idx].value);
                        });
                        // This verifies that the sum of the voting costs is appropriate.
                        assert.ok(boasdk.JSBI.greaterThanOrEqual(sum_vote_cost, expected_data.vote_fee));
                    });
                }
                else if (Buffer.compare(Buffer.from(boasdk.BallotData.HEADER), header) === 0)
                {
                    // Exceptions should be handled in actual use.
                    assert.doesNotThrow(() => {
                        let payload = boasdk.BallotData.deserialize(SmartBuffer.fromBuffer(tx.payload.data));

                        // This verifies the signature of the ballot.
                        assert.ok(payload.card.verify());
                        assert.ok(payload.verify());

                        let pre_image = new boasdk.Hash('0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328');
                        let app_name = "Votera";
                        let proposal_id = payload.proposal_id;
                        let key_agora_admin = boasdk.hashMulti(pre_image.data, Buffer.from(app_name));
                        let key_encrypt = boasdk.Encrypt.createKey(key_agora_admin.data, proposal_id);
                        assert.deepStrictEqual(boasdk.Encrypt.decrypt(payload.ballot, key_encrypt), Buffer.from([boasdk.BallotData.YES]));
                    });
                }
            }
        }
    });
});
