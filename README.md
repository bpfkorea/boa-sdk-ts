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

TypeScript
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

In Browser
```JavaScript
<script type="text/javascript" src="boa-sdk.js"></script>
<script>
    BoaSdk.SodiumHelper.init()
        .then(function()
        {
            console.log("[Test for Hash]");
            var hash_abc = BoaSdk.hash(Uint8Array.fromString('abc'));
            console.assert(hash_abc.toString() === '0x239900d4ed8623b95a92f1dba8' +
                                        '8ad31895cc3345ded552c22d79ab' +
                                        '2a39c5877dd1a2ffdb6fbb124bb7' +
                                        'c45a68142f214ce9f6129fb69727' +
                                        '6a0d4d1c983fa580ba');

            console.log("[Test for KeyPair.fromSeed]");
            var address =
                'GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW';
            var seed =
                `SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ`;
            var kp = BoaSdk.KeyPair.fromSeed(BoaSdk.Seed.fromString(seed));
            console.assert(kp.address.toString() === address);
            var signature = kp.secret.sign(Uint8Array.fromString('Hello World'));
            console.assert(kp.address.verify(signature, Uint8Array.fromString('Hello World')));

            console.log("[Test for KeyPair.random]");
            var random_kp = BoaSdk.KeyPair.random();
            var random_kp_signature = random_kp.secret.sign(Uint8Array.fromString('Hello World'));
            console.assert(random_kp.address.verify(random_kp_signature, Uint8Array.fromString('Hello World')));
        });

    Uint8Array.fromString = function (str)
    {
        for (var arr = [], i = 0; i < str.length; i++)
            arr.push(str.charCodeAt(i));
        return new Uint8Array(arr);
    };
</script>
```

## Documentation
[BOA-SDK for TypeScript documentation](https://bpfkorea.github.io/boa-sdk-ts)

## Testing
```bash
$ git clone https://github.com/bpfkorea/boa-sdk-ts.git
$ npm install
$ npm run build
$ npm test
```