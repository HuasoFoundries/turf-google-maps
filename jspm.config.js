SystemJS.config({
    paths: {
        "npm:": "jspm_packages/npm/",
        "github:": "jspm_packages/github/",
        "turfhelper-lib-js/": "src/"
    },
    browserConfig: {
        "baseURL": "/"
    },
    devConfig: {
        "map": {
            "events": "npm:jspm-nodelibs-events@0.2.2",
            "process": "npm:jspm-nodelibs-process@0.2.1",
            "child_process": "npm:jspm-nodelibs-child_process@0.2.1",
            "path": "npm:jspm-nodelibs-path@0.2.3",
            "buffer": "npm:jspm-nodelibs-buffer@0.2.3",
            "os": "npm:jspm-nodelibs-os@0.2.2",
            "util": "npm:jspm-nodelibs-util@0.2.2",
            "assert": "npm:jspm-nodelibs-assert@0.2.1",
            "crypto": "npm:jspm-nodelibs-crypto@0.2.1",
            "stream": "npm:jspm-nodelibs-stream@0.2.1",
            "vm": "npm:jspm-nodelibs-vm@0.2.1",
            "constants": "npm:jspm-nodelibs-constants@0.2.1",
            "string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.1"
        },
        "packages": {
            "npm:jspm-nodelibs-buffer@0.2.3": {
                "map": {
                    "buffer": "npm:buffer@5.0.7"
                }
            },
            "npm:buffer@5.0.7": {
                "map": {
                    "base64-js": "npm:base64-js@1.2.1",
                    "ieee754": "npm:ieee754@1.1.8"
                }
            },
            "npm:jspm-nodelibs-crypto@0.2.1": {
                "map": {
                    "crypto-browserify": "npm:crypto-browserify@3.11.1"
                }
            },
            "npm:jspm-nodelibs-os@0.2.2": {
                "map": {
                    "os-browserify": "npm:os-browserify@0.3.0"
                }
            },
            "npm:crypto-browserify@3.11.1": {
                "map": {
                    "create-hash": "npm:create-hash@1.1.3",
                    "create-hmac": "npm:create-hmac@1.1.6",
                    "browserify-sign": "npm:browserify-sign@4.0.4",
                    "diffie-hellman": "npm:diffie-hellman@5.0.2",
                    "pbkdf2": "npm:pbkdf2@3.0.13",
                    "browserify-cipher": "npm:browserify-cipher@1.0.0",
                    "public-encrypt": "npm:public-encrypt@4.0.0",
                    "create-ecdh": "npm:create-ecdh@4.0.0",
                    "inherits": "npm:inherits@2.0.3",
                    "randombytes": "npm:randombytes@2.0.5"
                }
            },
            "npm:create-hmac@1.1.6": {
                "map": {
                    "create-hash": "npm:create-hash@1.1.3",
                    "ripemd160": "npm:ripemd160@2.0.1",
                    "safe-buffer": "npm:safe-buffer@5.1.1",
                    "cipher-base": "npm:cipher-base@1.0.4",
                    "inherits": "npm:inherits@2.0.3",
                    "sha.js": "npm:sha.js@2.4.8"
                }
            },
            "npm:browserify-sign@4.0.4": {
                "map": {
                    "create-hash": "npm:create-hash@1.1.3",
                    "create-hmac": "npm:create-hmac@1.1.6",
                    "browserify-rsa": "npm:browserify-rsa@4.0.1",
                    "elliptic": "npm:elliptic@6.4.0",
                    "inherits": "npm:inherits@2.0.3",
                    "bn.js": "npm:bn.js@4.11.8",
                    "parse-asn1": "npm:parse-asn1@5.1.0"
                }
            },
            "npm:pbkdf2@3.0.13": {
                "map": {
                    "create-hash": "npm:create-hash@1.1.3",
                    "create-hmac": "npm:create-hmac@1.1.6",
                    "ripemd160": "npm:ripemd160@2.0.1",
                    "safe-buffer": "npm:safe-buffer@5.1.1",
                    "sha.js": "npm:sha.js@2.4.8"
                }
            },
            "npm:create-hash@1.1.3": {
                "map": {
                    "ripemd160": "npm:ripemd160@2.0.1",
                    "cipher-base": "npm:cipher-base@1.0.4",
                    "inherits": "npm:inherits@2.0.3",
                    "sha.js": "npm:sha.js@2.4.8"
                }
            },
            "npm:public-encrypt@4.0.0": {
                "map": {
                    "create-hash": "npm:create-hash@1.1.3",
                    "browserify-rsa": "npm:browserify-rsa@4.0.1",
                    "randombytes": "npm:randombytes@2.0.5",
                    "bn.js": "npm:bn.js@4.11.8",
                    "parse-asn1": "npm:parse-asn1@5.1.0"
                }
            },
            "npm:diffie-hellman@5.0.2": {
                "map": {
                    "miller-rabin": "npm:miller-rabin@4.0.0",
                    "randombytes": "npm:randombytes@2.0.5",
                    "bn.js": "npm:bn.js@4.11.8"
                }
            },
            "npm:create-ecdh@4.0.0": {
                "map": {
                    "elliptic": "npm:elliptic@6.4.0",
                    "bn.js": "npm:bn.js@4.11.8"
                }
            },
            "npm:cipher-base@1.0.4": {
                "map": {
                    "safe-buffer": "npm:safe-buffer@5.1.1",
                    "inherits": "npm:inherits@2.0.3"
                }
            },
            "npm:ripemd160@2.0.1": {
                "map": {
                    "inherits": "npm:inherits@2.0.3",
                    "hash-base": "npm:hash-base@2.0.2"
                }
            },
            "npm:browserify-rsa@4.0.1": {
                "map": {
                    "randombytes": "npm:randombytes@2.0.5",
                    "bn.js": "npm:bn.js@4.11.8"
                }
            },
            "npm:randombytes@2.0.5": {
                "map": {
                    "safe-buffer": "npm:safe-buffer@5.1.1"
                }
            },
            "npm:browserify-cipher@1.0.0": {
                "map": {
                    "browserify-des": "npm:browserify-des@1.0.0",
                    "evp_bytestokey": "npm:evp_bytestokey@1.0.3",
                    "browserify-aes": "npm:browserify-aes@1.0.8"
                }
            },
            "npm:jspm-nodelibs-stream@0.2.1": {
                "map": {
                    "stream-browserify": "npm:stream-browserify@2.0.1"
                }
            },
            "npm:miller-rabin@4.0.0": {
                "map": {
                    "bn.js": "npm:bn.js@4.11.8",
                    "brorand": "npm:brorand@1.1.0"
                }
            },
            "npm:elliptic@6.4.0": {
                "map": {
                    "bn.js": "npm:bn.js@4.11.8",
                    "inherits": "npm:inherits@2.0.3",
                    "brorand": "npm:brorand@1.1.0",
                    "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1",
                    "hmac-drbg": "npm:hmac-drbg@1.0.1",
                    "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
                    "hash.js": "npm:hash.js@1.1.3"
                }
            },
            "npm:browserify-des@1.0.0": {
                "map": {
                    "cipher-base": "npm:cipher-base@1.0.4",
                    "inherits": "npm:inherits@2.0.3",
                    "des.js": "npm:des.js@1.0.0"
                }
            },
            "npm:hash-base@2.0.2": {
                "map": {
                    "inherits": "npm:inherits@2.0.3"
                }
            },
            "npm:parse-asn1@5.1.0": {
                "map": {
                    "create-hash": "npm:create-hash@1.1.3",
                    "pbkdf2": "npm:pbkdf2@3.0.13",
                    "browserify-aes": "npm:browserify-aes@1.0.8",
                    "evp_bytestokey": "npm:evp_bytestokey@1.0.3",
                    "asn1.js": "npm:asn1.js@4.9.1"
                }
            },
            "npm:stream-browserify@2.0.1": {
                "map": {
                    "inherits": "npm:inherits@2.0.3",
                    "readable-stream": "npm:readable-stream@2.3.3"
                }
            },
            "npm:evp_bytestokey@1.0.3": {
                "map": {
                    "safe-buffer": "npm:safe-buffer@5.1.1",
                    "md5.js": "npm:md5.js@1.3.4"
                }
            },
            "npm:browserify-aes@1.0.8": {
                "map": {
                    "cipher-base": "npm:cipher-base@1.0.4",
                    "create-hash": "npm:create-hash@1.1.3",
                    "inherits": "npm:inherits@2.0.3",
                    "safe-buffer": "npm:safe-buffer@5.1.1",
                    "evp_bytestokey": "npm:evp_bytestokey@1.0.3",
                    "buffer-xor": "npm:buffer-xor@1.0.3"
                }
            },
            "npm:sha.js@2.4.8": {
                "map": {
                    "inherits": "npm:inherits@2.0.3"
                }
            },
            "npm:md5.js@1.3.4": {
                "map": {
                    "hash-base": "npm:hash-base@3.0.4",
                    "inherits": "npm:inherits@2.0.3"
                }
            },
            "npm:des.js@1.0.0": {
                "map": {
                    "inherits": "npm:inherits@2.0.3",
                    "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
                }
            },
            "npm:hmac-drbg@1.0.1": {
                "map": {
                    "hash.js": "npm:hash.js@1.1.3",
                    "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
                    "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1"
                }
            },
            "npm:hash-base@3.0.4": {
                "map": {
                    "inherits": "npm:inherits@2.0.3",
                    "safe-buffer": "npm:safe-buffer@5.1.1"
                }
            },
            "npm:hash.js@1.1.3": {
                "map": {
                    "inherits": "npm:inherits@2.0.3",
                    "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
                }
            },
            "npm:readable-stream@2.3.3": {
                "map": {
                    "inherits": "npm:inherits@2.0.3",
                    "safe-buffer": "npm:safe-buffer@5.1.1",
                    "util-deprecate": "npm:util-deprecate@1.0.2",
                    "core-util-is": "npm:core-util-is@1.0.2",
                    "string_decoder": "npm:string_decoder@1.0.3",
                    "process-nextick-args": "npm:process-nextick-args@1.0.7",
                    "isarray": "npm:isarray@1.0.0"
                }
            },
            "npm:asn1.js@4.9.1": {
                "map": {
                    "inherits": "npm:inherits@2.0.3",
                    "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
                    "bn.js": "npm:bn.js@4.11.8"
                }
            },
            "npm:jspm-nodelibs-string_decoder@0.2.1": {
                "map": {
                    "string_decoder": "npm:string_decoder@0.10.31"
                }
            },
            "npm:string_decoder@1.0.3": {
                "map": {
                    "safe-buffer": "npm:safe-buffer@5.1.1"
                }
            }
        }
    },
    transpiler: "plugin-babel",
    packages: {
        "turfhelper-lib-js": {
            "main": "dist/index.js",
            "format": "amd",
            "meta": {
                "*.js": {
                    "loader": "plugin-babel"
                }
            }
        }
    }
});

SystemJS.config({
    packageConfigPaths: [
        "npm:@*/*.json",
        "npm:*.json",
        "github:*/*.json"
    ],
    map: {
        "fs": "npm:jspm-nodelibs-fs@0.2.1",
        "plugin-babel": "npm:systemjs-plugin-babel@0.0.25"
    },
    packages: {}
});
