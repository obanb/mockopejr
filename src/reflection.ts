import { generator } from './generator.js';
import { logr_expr_lang } from './logr_exp_lang.js';

type JsonPrimitives = string | number | boolean | null;

const reflectAndGenerate = (schema: unknown) => {
  Object.entries(schema).map(([key, elem]) => {
    if (isNotEmptyPrimitiveArray(elem)) {
      return elem.map(generator.generateFromJsonPrimitive);
    } else if (isNotEmptyObjectArray(elem)) {
      return elem.forEach(reflectAndGenerate);
    } else if(isObject(elem)){
        return reflectAndGenerate(elem)
    }
    else if (isPrimitive(elem)) {
      if (logr_expr_lang.isExpr(elem)) {
        const expr = logr_expr_lang.getExpr(elem);
        schema[key] = logr_expr_lang.executeExpr(expr);
      }
      else {
        schema[key] = generator.generateFromJsonPrimitive(elem);
      }
    }
  });
  return schema;
};

const isPrimitive = (elem: unknown) =>
  isNumber(elem) || isString(elem) || isBoolean(elem) || elem === null;

const isNotEmptyPrimitiveArray = (elem: unknown): elem is JsonPrimitives[] => {
  if (Array.isArray(elem)) {
    const elem0 = elem[0];

    if (isPrimitive(elem0)) {
      return true;
    }
  }

  return false;
};

const isNotEmptyObjectArray = (
  elem: unknown,
): elem is Record<string, unknown>[] => {
  if (Array.isArray(elem)) {
    const elem0 = elem[0];

    if (elem0 && !Array.isArray(elem0) && isObject(elem0)) {
      return true;
    }
  }

  return false;
};

const isNumber = (val: unknown): val is 'number' => typeof val === 'number';
const isString = (val: unknown): val is 'string' => typeof val === 'string';
const isNumberString = (val: unknown): val is 'numberString' =>
  isString(val) && parseFloat(val) == (val as unknown);
const isDateString = (val: unknown): val is 'dateString' =>
  isString(val) && !isNaN(Date.parse(val));
const isNull = (val: unknown): val is 'null' => val === null;
const isBoolean = (val: unknown): val is 'boolean' => typeof val === 'boolean';

const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object';

export const reflection = {
  reflectAndGenerate,
  isString,
  isNumber,
  isNumberString,
  isDateString,
  isNull,
  isBoolean,
};
