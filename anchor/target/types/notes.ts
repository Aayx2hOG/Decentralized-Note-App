/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/notes.json`.
 */
export type Notes = {
  "address": "CWKGia5HcweWHJLqYgAQPHGbebMQTN9XTbGYwfnvpnyH",
  "metadata": {
    "name": "notes",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createNote",
      "discriminator": [
        103,
        2,
        208,
        242,
        86,
        156,
        151,
        107
      ],
      "accounts": [
        {
          "name": "note",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "arg",
                "path": "title"
              }
            ]
          }
        },
        {
          "name": "author",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteNote",
      "discriminator": [
        182,
        211,
        115,
        229,
        163,
        88,
        108,
        217
      ],
      "accounts": [
        {
          "name": "note",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "account",
                "path": "note.title",
                "account": "note"
              }
            ]
          }
        },
        {
          "name": "author",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "updateNote",
      "discriminator": [
        103,
        129,
        251,
        34,
        33,
        154,
        210,
        148
      ],
      "accounts": [
        {
          "name": "note",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "account",
                "path": "note.title",
                "account": "note"
              }
            ]
          }
        },
        {
          "name": "author",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "content",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "note",
      "discriminator": [
        203,
        75,
        252,
        196,
        81,
        210,
        122,
        126
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "Title cannot be more than 100 characters."
    },
    {
      "code": 6001,
      "name": "contentTooLong",
      "msg": "Content cannot be more than 1000 characters."
    },
    {
      "code": 6002,
      "name": "titleEmpty",
      "msg": "Title cannot be empty."
    },
    {
      "code": 6003,
      "name": "contentEmpty",
      "msg": "Content cannot be empty."
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "unauthorized"
    }
  ],
  "types": [
    {
      "name": "note",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "lastUpdated",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
