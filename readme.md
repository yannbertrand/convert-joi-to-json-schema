# convert-joi-to-json-schema

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Twitter: _YannBertrand](https://img.shields.io/twitter/follow/_YannBertrand.svg?style=social)](https://twitter.com/_YannBertrand)

**Stability: 1 - Experimental**

Convert Joi schema to JSON schema

## How to use?

```js
const joiSchema = Joi.object({
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
  }),
});

const jsonSchema = convertJoiToJsonSchema(joiSchema);

/**
  {
    type: 'object',
    properties: {
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  }
*/
```
