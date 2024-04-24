import Joi from 'joi';
import { describe, it, expect } from 'vitest';

import { convertJoiToJsonSchema } from './index.js';

describe('#convertJoiToJsonSchema', () => {
  it('should throw if not Joi', () => {
    expect(() => convertJoiToJsonSchema({})).toThrowError('Not a Joi schema');
  });

  describe('string', () => {
    it('should convert Joi.string to JSON Schema', () => {
      const joiSchema = Joi.string();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'string' });
    });

    it('should convert Joi.string.min to JSON Schema with minLength', () => {
      const joiSchema = Joi.string().min(8);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'string', minLength: 8 });
    });

    it('should convert Joi.string.max to JSON Schema with maxLength', () => {
      const joiSchema = Joi.string().max(32);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'string', maxLength: 32 });
    });

    it('should convert Joi.string.email to JSON Schema with format email', () => {
      const joiSchema = Joi.string().email();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'string', format: 'email' });
    });

    it('should convert Joi.string.uri to JSON Schema with format uri', () => {
      const joiSchema = Joi.string().uri();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'string', format: 'uri' });
    });

    it('should convert Joi.string.guid to JSON Schema with format uuid', () => {
      const joiSchema = Joi.string().guid({ version: 'uuidv4' });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'string', format: 'uuid' });
    });

    describe('regex', () => {
      it('should convert Joi.string.regex(d) to JSON Schema with converted pattern', () => {
        const joiSchema = Joi.string().regex(/^\d+$/);
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({ type: 'string', pattern: '^[0-9]+$' });
      });

      it('should convert Joi.string.regex(*) to JSON Schema with given pattern', () => {
        const joiSchema = Joi.string().regex(/^[a-z0-9-]+$/);
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({ type: 'string', pattern: '^[a-z0-9-]+$' });
      });

      it('should convert Joi.string.regex(*, invert) to JSON Schema with no pattern', () => {
        const joiSchema = Joi.string().regex(/<.*?>/, { invert: true });
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({ type: 'string' });
      });

      it('should convert Joi.string.regex.message to JSON Schema with errorMessage', () => {
        const joiSchema = Joi.string().regex(/abc/).message('{{:#label}} failed custom validation');
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({
          type: 'string',
          pattern: 'abc',
          errorMessage: '{{:#label}} failed custom validation',
        });
      });
    });

    describe('allow', () => {
      it('should convert Joi.string.allow(empty) to JSON Schema with no enum', () => {
        const joiSchema = Joi.string().allow('');
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({ type: 'string' });
      });

      it('should convert Joi.string.allow(*) to JSON Schema with enum', () => {
        const joiSchema = Joi.string().allow('Hello');
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({ type: 'string', enum: ['Hello'] });
      });
    });
  });

  describe('number', () => {
    it('should convert Joi.number to JSON Schema', () => {
      const joiSchema = Joi.number();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'number' });
    });

    it('should convert Joi.number.integer to JSON Schema with type integer', () => {
      const joiSchema = Joi.number().integer();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'integer' });
    });

    it('should convert Joi.number.positive to JSON Schema with minimum 1', () => {
      const joiSchema = Joi.number().positive();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'number', minimum: 1 });
    });

    it('should convert Joi.number.negative to JSON Schema with maximum -1', () => {
      const joiSchema = Joi.number().negative();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'number', maximum: -1 });
    });

    it('should convert Joi.number.min to JSON Schema with minimum', () => {
      const joiSchema = Joi.number().min(0);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'number', minimum: 0 });
    });

    it('should convert Joi.number.max to JSON Schema with maximum', () => {
      const joiSchema = Joi.number().max(150);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'number', maximum: 150 });
    });
  });

  describe('array', () => {
    it('should convert Joi.array to JSON Schema', () => {
      const joiSchema = Joi.array();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'array' });
    });

    it('should convert Joi.array.min to JSON Schema with minItems', () => {
      const joiSchema = Joi.array().min(3);
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'array', minItems: 3 });
    });

    it('should convert Joi.array.unique to JSON Schema with uniqueItems', () => {
      const joiSchema = Joi.array().unique();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({ type: 'array', uniqueItems: true });
    });

    describe('items', () => {
      it('should convert Joi.array.items(string) to JSON Schema with items string', () => {
        const joiSchema = Joi.array().items(Joi.string());
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({ type: 'array', items: { type: 'string' } });
      });

      it('should convert Joi.array.items(number) to JSON Schema with items number', () => {
        const joiSchema = Joi.array().items(Joi.number());
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({ type: 'array', items: { type: 'number' } });
      });

      it('should convert Joi.array.items(object) to JSON Schema with items object', () => {
        const joiSchema = Joi.array().items(Joi.object());
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({ type: 'array', items: { type: 'object' } });
      });

      it('should convert Joi.array.items(array) to JSON Schema with items array', () => {
        const joiSchema = Joi.array().items(Joi.array());
        const jsonSchema = convertJoiToJsonSchema(joiSchema);
        expect(jsonSchema).toEqual({ type: 'array', items: { type: 'array' } });
      });
    });
  });

  describe('object', () => {
    it('should convert Joi.object to JSON Schema', () => {
      const joiSchema = Joi.object();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(joiSchema.validate({ name: 'John', age: 30, additional: 'property' }).error).toBeUndefined();
      expect(jsonSchema).toEqual({ type: 'object' });
    });

    it('should convert Joi.object.keys to JSON Schema with no additionalProperties', () => {
      const joiSchema = Joi.object({});
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(joiSchema.validate({ additional: 'property' }).error).toBeDefined();
      expect(jsonSchema).toEqual({ type: 'object', additionalProperties: false });
    });

    it('should convert Joi.object.keys.unknown to JSON Schema with additionalProperties', () => {
      const joiSchema = Joi.object({}).unknown();
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(joiSchema.validate({ additional: 'property' }).error).toBeUndefined();
      expect(jsonSchema).toEqual({ type: 'object', additionalProperties: true });
    });

    it('should convert Joi.object.keys to JSON Schema with properties', () => {
      const joiSchema = Joi.object({
        name: Joi.string(),
        age: Joi.number(),
      });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        additionalProperties: false,
      });
    });

    it('should convert Joi.object.keys.required to JSON Schema with required properties', () => {
      const joiSchema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number(),
      });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
        additionalProperties: false,
      });
    });

    it('should convert Joi.object with nested Joi.object to nested JSON Schema', () => {
      const joiSchema = Joi.object({
        address: Joi.object({
          street: Joi.string(),
          city: Joi.string(),
        }),
      });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({
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
      });
    });

    it('should convert Joi.object with nested Joi.array to nested JSON Schema', () => {
      const joiSchema = Joi.object({
        addresses: Joi.array().items(Joi.string()),
      });
      const jsonSchema = convertJoiToJsonSchema(joiSchema);
      expect(jsonSchema).toEqual({
        type: 'object',
        properties: {
          addresses: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      });
    });
  });
});
