import Joi from 'joi';
import { findRule, hasFlag } from './utils.js';

export function convertJoiToJsonSchema(joiSchema) {
  if (!Joi.isSchema(joiSchema)) {
    throw new Error('Not a Joi schema');
  }

  return convertFromType(joiSchema.describe());
}

function convertFromType(joiDescribedSchema) {
  switch (joiDescribedSchema.type) {
    case 'string':
      return convertString(joiDescribedSchema);
    case 'number':
      return convertNumber(joiDescribedSchema);
    case 'array':
      return convertArray(joiDescribedSchema);
    case 'object':
      return convertObject(joiDescribedSchema);
    default:
      console.warn('Unsupported type', joiDescribedSchema.type);
  }
}

function convertString(joiStringDescribedSchema) {
  const jsonSchema = { type: 'string' };
  const rules = joiStringDescribedSchema.rules;

  const emailRule = findRule(rules, 'email');
  if (emailRule !== undefined) {
    jsonSchema.format = 'email';
  }

  const guidRule = findRule(rules, 'guid');
  if (guidRule !== undefined) {
    jsonSchema.format = 'uuid';
  }

  const uriRule = findRule(rules, 'uri');
  if (uriRule !== undefined) {
    jsonSchema.format = 'uri';
  }

  const minRule = findRule(rules, 'min');
  if (minRule !== undefined) {
    jsonSchema.minLength = minRule.args.limit;
  }

  const maxRule = findRule(rules, 'max');
  if (maxRule !== undefined) {
    jsonSchema.maxLength = maxRule.args.limit;
  }

  const patternRule = findRule(rules, 'pattern');
  if (patternRule) {
    if (!patternRule.args.options?.invert) {
      jsonSchema.pattern = patternRule.args.regex.toString().slice(1, -1).replace(/\\d/g, '[0-9]');

      if (rules?.find((rule) => rule.message?.template?.length > 0)) {
        jsonSchema.errorMessage = rules?.find((rule) => rule.message?.template?.length > 0).message.template;
      }
    }
  }

  if (joiStringDescribedSchema.allow?.length > 0) {
    const enumValues = joiStringDescribedSchema.allow.filter((allow) => allow.length > 0);
    if (enumValues.length > 0) {
      jsonSchema.enum = enumValues;
    }
  }

  return jsonSchema;
}

function convertNumber(joiNumberDescribedSchema) {
  const jsonSchema = { type: 'number' };
  const rules = joiNumberDescribedSchema.rules;

  const integerRule = findRule(rules, 'integer');
  if (integerRule !== undefined) {
    jsonSchema.type = 'integer';
  }

  const signRule = findRule(rules, 'sign');
  if (signRule !== undefined) {
    if (signRule.args.sign === 'positive') {
      jsonSchema.minimum = 1;
    } else {
      jsonSchema.maximum = -1;
    }
  }

  const minRule = findRule(rules, 'min');
  if (minRule !== undefined) {
    jsonSchema.minimum = minRule.args.limit;
  }

  const maxRule = findRule(rules, 'max');
  if (maxRule !== undefined) {
    jsonSchema.maximum = maxRule.args.limit;
  }

  return jsonSchema;
}

function convertArray(joiArrayDescribedSchema) {
  const jsonSchema = { type: 'array' };
  const rules = joiArrayDescribedSchema.rules;

  const minRule = findRule(rules, 'min');
  if (minRule !== undefined) {
    jsonSchema.minItems = minRule.args.limit;
  }

  const uniqueRule = findRule(rules, 'unique');
  if (uniqueRule !== undefined) {
    jsonSchema.uniqueItems = true;
  }

  if (joiArrayDescribedSchema.items) {
    jsonSchema.items = {};

    for (const item of joiArrayDescribedSchema.items) {
      if (item.type === 'alternatives') {
        if (item.matches.find((m) => m.ref)) {
          const match = item.matches.find((m) => m.ref);
          jsonSchema.items = { oneOf: match.switch.map((s) => convertObject(s.then)) };
        } else {
          jsonSchema.items = { oneOf: item.matches.map((match) => convertObject(match.schema)) };
        }
      } else {
        jsonSchema.items = convertFromType(item);
      }
    }
  }

  return jsonSchema;
}

function convertObject(joiObjectDescribedSchema) {
  const jsonSchema = { type: 'object' };

  if (joiObjectDescribedSchema.keys) {
    const properties = {};
    const required = [];

    for (const [key, value] of Object.entries(joiObjectDescribedSchema.keys)) {
      properties[key] = convertFromType(value);

      if (hasFlag(value?.flags, 'presence', 'required')) {
        required.push(key);
      }
    }

    if (properties && Object.keys(properties).length > 0) {
      jsonSchema.properties = properties;
    }

    if (required && required.length > 0) {
      jsonSchema.required = required;
    }

    jsonSchema.additionalProperties = hasFlag(joiObjectDescribedSchema.flags, 'unknown', true);
  }

  return jsonSchema;
}
