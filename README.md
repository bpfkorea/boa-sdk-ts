# boa-sdk-ts
SDK to interface with the BOSAGORA blockchain
boa-sdk-ts is a TypeScript/JavaScript library for communicating with the Stoa API server.
It also has utility functions such as hashing and pre-image validation.

## Install
```bash
$ npm install --save boa-sdk-ts
```

## Import the your library
```import * as BoaSdk from "boa-sdk-ts";```

## Usage
```TypeScript
// Create BOA Client
let boa_client = new BoaSdk.BOAClient("http://localhost:3836");

// Query
boa_client.getValidator("GA3DMXTREDC4AIUTHRFIXCKWKF7BDIXRWM2KLV74OPK2OKDM2VJ235GN", 10)
.then((validators: Array<BoaSdk.Validator>) =>
{
    // On Success
})
.catch(err =>
{
    // On Error
});
```

## Testing
```bash
$ git clone https://github.com/bpfkorea/boa-sdk-ts.git
$ npm install
$ npm run build
$ npm test
```