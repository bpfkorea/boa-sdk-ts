/*******************************************************************************

    Contains definition for the BOA Client of TypeScript.
    It is responsible for requesting and receiving responses from
    the BOA API server(Stoa).
    It also provides other functions.(Verification of signature and pre-image)

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hash } from '../data/Hash';
import { PublicKey } from '../data/KeyPair';
import { Request } from './Request';
import { UnspentTxOutput } from './response/UnspentTxOutput';
import { Validator } from './response/Validator';
import { Transaction } from "../data/Transaction";

import { AxiosResponse, AxiosError } from 'axios';
import uri from 'urijs';

/**
 * Define the BOA Client of TypeScript.
 * It is responsible for requesting and receiving responses from
 * the BOA API server(Stoa).
 * It also provides other functions. (Verification of signature and pre-image)
 */
export class BOAClient
{
    /**
     * The Stoa server URL
     */
    public readonly server_url: uri;

    /**
     * The Agora URL
     */
    public readonly agora_url: uri;


    /**
     * Constructor
     * @param server_url The Stoa server URL
     * @param agora_url  The Agora server URL
     */
    constructor (server_url: string, agora_url: string)
    {
        this.server_url = uri(server_url);
        this.agora_url = uri(agora_url);
    }

    /**
     * Request all valid validator at the block height.
     * If block height is not specified, it is the current height.
     * @param height The block height
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getAllValidators
        (height?: number): Promise<Array<Validator>>
    {
        return new Promise<Array<Validator>>((resolve, reject) =>
        {
            let url = uri(this.server_url)
                .directory("validators");

            if (height != undefined)
                url.addSearch("height", height);

            Request.get(url.toString())
            .then((response: AxiosResponse) =>
            {
                let validators: Array<Validator> = new Array<Validator>();
                if (response.status == 200)
                {
                    response.data.forEach((elem: any) =>
                    {
                        let validator = new Validator();
                        validator.fromJSON(elem);
                        validators.push(validator);
                    });
                    resolve(validators);
                }
                else if (response.status == 204)
                {
                    resolve(validators);
                }
                else
                {
                    // It is not yet defined in Stoa.
                    reject(new Error(response.statusText));
                }
            })
            .catch((reason: any) =>
            {
                reject(handleNetworkError(reason));
            });
        });
    }

    /**
     * Requests a valid validator for the address at the block height.
     * If block height is not specified, it is the current height.
     * @param address The public key
     * @param height  The block height
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getValidator
        (address: string, height?: number): Promise<Array<Validator>>
    {
        return new Promise<Array<Validator>>((resolve, reject) =>
        {
            let url = uri(this.server_url)
                .directory("validator")
                .filename(address);

            if (height != undefined)
                url.addSearch("height", height);

            Request.get(url.toString())
            .then((response: AxiosResponse) =>
            {
               let validators: Array<Validator> = new Array<Validator>();
               if (response.status == 200)
               {
                    response.data.forEach((elem: any) =>
                    {
                        let validator = new Validator();
                        validator.fromJSON(elem);
                        validators.push(validator);
                    });
                    resolve(validators);
                }
                else if (response.status == 204)
                {
                    resolve(validators);
                }
                else
                {
                    // It is not yet defined in Stoa.
                    reject(new Error(response.statusText));
                }
            })
            .catch((reason: any) =>
            {
                reject(handleNetworkError(reason));
            });
        });
    }

    /**
     * Check the validity of a new pre-image
     * @param original_image        The original pre-image hash
     * @param original_image_height The original pre-image height
     * @param new_image             The new pre-image hash to check
     * @param new_image_height      The new pre-image height
     * @returns
     * {result: true, message: "The pre-image is valid."} if the pre-image is valid,
     * otherwise the result is false and the message is the reason for invalid
     * See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/validation/PreImage.d#L50-L69
     */
    public isValidPreimage (
        original_image: Hash, original_image_height: number,
        new_image: Hash, new_image_height: number): IsValidPreimageResponse
    {
        if (!Number.isInteger(original_image_height) || (original_image_height < 0))
            return {
                result: false,
                message: "The original pre-image height is not valid."
            };

        if (!Number.isInteger(new_image_height) || (new_image_height < 0))
            return {
                result: false,
                message: "The new pre-image height is not valid."
            };

        if (new_image_height < original_image_height)
            return {
                result: false,
                message: "The height of new pre-image is smaller than that of original one."
            };

        let temp_hash = new Hash(new_image.data);
        for (let idx = original_image_height; idx < new_image_height; idx++)
            temp_hash = hash(temp_hash.data)

        if (!original_image.data.equals(temp_hash.data))
            return {
                result: false,
                message: "The pre-image has a invalid hash value."
            };

        return {
            result: true,
            message: "The pre-image is valid."
        };
    }

    /**
     * TODO As this might get influenced by future changes
     * Shell function to convert from time to height
     * @param when Unix epoch time
     * @returns height  (or expected height) of the designated time
     */
    public getHeightAt(when: Date): Promise<number>
    {
        return new Promise<number>((resolve, reject) =>
        {
            const baseDate: Date = new Date(Date.UTC(2020, 0, 1, 0, 0, 0));
            if (when.getTime() < baseDate.getTime())
            {
                reject(new Error("Dates prior to the chain Genesis date (January 1, 2020) are not valid"));
                return;
            }
            const milliseconds_per_block = 600000;
            let height = Math.floor((when.getTime() - baseDate.getTime()) / milliseconds_per_block);
            resolve(height);
        });
    }

    /**
     * Saves the data to the blockchain
     * @param tx The instance of the Transaction
     * @returns Returns true if success, otherwise returns false
     */
    public sendTransaction (tx: Transaction): Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) =>
        {
            try
            {
                let url = uri(this.agora_url)
                    .filename("transaction");

                Request.put(url.toString(), {tx: tx})
                    .then((response: AxiosResponse) =>
                    {
                        if (response.status == 200)
                            resolve(true);
                        else
                            reject(new Error(response.statusText));
                    })
                    .catch((reason: any) =>
                    {
                        reject(handleNetworkError(reason));
                    });
            } catch (err)
            {
                reject(err);
            }
        });
    }

    /**
     * Request UTXOs of public key
     * @param address The address of UTXOs
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public getUTXOs (address: PublicKey): Promise<Array<UnspentTxOutput>>
    {
        return new Promise<Array<UnspentTxOutput>>((resolve, reject) =>
        {
            let url = uri(this.server_url)
            .directory("utxo")
            .filename(address.toString());

            Request.get(url.toString())
            .then((response: AxiosResponse) =>
            {
                let utxos: Array<UnspentTxOutput> = new Array<UnspentTxOutput>();
                if (response.status == 200)
                {
                    response.data.forEach((elem: any) =>
                    {
                        let utxo = new UnspentTxOutput();
                        utxo.fromJSON(elem);
                        utxos.push(utxo);
                    });
                    resolve(utxos);
                }
                else
                {
                    // It is not yet defined in Stoa.
                    reject(new Error(response.statusText));
                }
            })
            .catch((reason: any) =>
            {
                reject(handleNetworkError(reason));
            });
        });
    }

    /**
     * Request an Stoa's current block height.
     */
    public getBlockHeight (): Promise<bigint>
    {
        let url = uri(this.server_url)
            .filename("/block_height");

        return Request.get(url.toString())
            .then((response: AxiosResponse) => {
                return BigInt(response.data);
            });
    }
}

export interface IsValidPreimageResponse
{
    result: boolean;
    message: string;
}

/**
 * @ignore
 * Check if parameter `reason` is type `AxiosError`.
 * @param reason This is why the error occurred
 * @returns {boolean}
 */
function isAxiosError (reason: any): reason is AxiosError
{
    return ((reason as AxiosError).isAxiosError);
}

/**
 * @ignore
 * Check if parameter `reason` is type `Error`.
 * @param reason This is why the error occurred
 * @returns {boolean}
 */
function isError (reason: any): reason is Error
{
    return ((reason as Error).message != undefined);
}

/**
 * @ignore
 * It is a common function that handles errors that occur
 * during network communication.
 * @param reason This is why the error occurred
 * @returns The instance of Error
 */
function handleNetworkError (reason: any): Error
{
    if (isAxiosError(reason))
    {
        let e = reason as AxiosError;
        if (e.response != undefined)
        {
            let message = "";
            if (e.response.statusText != undefined) message = e.response.statusText + ", ";
            if (e.response.data != undefined) message += e.response.data;
            return new Error(message);
        }
    }

    if (isError(reason))
    {
        return new Error((reason as Error).message);
    }
    else
    {
        return new Error("An unknown error has occurred.");
    }
}
