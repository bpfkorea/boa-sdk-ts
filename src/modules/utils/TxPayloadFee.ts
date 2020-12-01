/*******************************************************************************

    Contains a class to calculate the fees used to store the data

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

/**
 * A class for calculating the fee of transaction data payload
 */
export class TxPayloadFee
{
    /**
     * The address of commons budget
     */
    public static CommonsBudgetAddress: string
        = "GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU";

    /**
     * The maximum size of data payload
     */
    public static TxPayloadMaxSize: number = 1024;

    /**
     * The factor to calculate for the fee of data payload
     */
    public static TxPayloadFeeFactor: number = 200;

    /**
     * Calculates the fee of data payloads
     * @data_size The size of the data
     */
    public static getFee(data_size: number): bigint
    {
        if (data_size < 0)
            throw(new Error("Data size cannot be negative."));

        if (data_size > TxPayloadFee.TxPayloadMaxSize)
            throw(new Error("Data size cannot be greater than maximum."));

        const decimal = 100;
        return BigInt(
            Math.round(
                (
                    Math.exp(data_size / TxPayloadFee.TxPayloadFeeFactor) -
                    1.0
                ) *
                decimal
            ) * 10000000 / decimal
        );
    }
}
