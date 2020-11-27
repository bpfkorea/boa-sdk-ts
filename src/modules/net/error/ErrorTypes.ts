/*******************************************************************************

    Contains definition for error types

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

/**
 * The class used when a network error occurs
 */
export class NetworkError extends Error
{
    /**
     * The status code
     */
    public status: number;

    /**
     * The status text
     */
    public statusText: string;

    /**
     * The message of response
     */
    public statusMessage: string;

    /**
     * Constructor
     * @param status        The status code
     * @param statusText    The status text
     * @param statusMessage The message of response
     */
    constructor (status: number, statusText: string, statusMessage: string)
    {
        super(statusText);
        this.name = 'NetworkError';
        this.status = status;
        this.statusText = statusText;
        this.statusMessage = statusMessage;
    }
}

/**
 *  When status code is 404
 */
export class NotFoundError extends NetworkError
{
    /**
     * Constructor
     * @param status        The status code
     * @param statusText    The status text
     * @param statusMessage The message of response
     */
    constructor (status: number, statusText: string, statusMessage: string)
    {
        super(status, statusText, statusMessage);
        this.name = 'NotFoundError';
    }
}

/**
 *  When status code is 400
 */
export class BadRequestError extends NetworkError
{
    /**
     * Constructor
     * @param status        The status code
     * @param statusText    The status text
     * @param statusMessage The message of response
     */
    constructor (status: number, statusText: string, statusMessage: string)
    {
        super(status, statusText, statusMessage);
        this.name = 'BadRequestError';
    }
}
