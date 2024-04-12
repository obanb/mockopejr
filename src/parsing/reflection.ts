import { generator } from './generator.js';
import { Expression } from './types.js';
import { MimicMode } from '../core/types.js';

type JsonPrimitive = string | number | boolean | null;

// the order depends
const reflectAndGenerate = async (expressionParseFn, schema, mimicMode: MimicMode) => {
  const keepOriginalPrimitive = mimicMode !== 'randomize';
  for (const [key, elem] of Object.entries(schema)) {
    if(Array.isArray(elem)) {
      if(typeof elem[0] === 'object' && elem !== null){
        if(elem[0] && elem[0]["#REPEAT"] && elem[1]){
          if(isJsonPrimitive(elem[1])){
            const count = Number(elem[0]["#REPEAT"])
            for (let i = 0; i < count; i++) {
              elem[i] = keepOriginalPrimitive ? elem[1]: generator.generateFromJsonPrimitive(elem[1]);
            }
          }else if(typeof elem[1] === 'object' && elem !== null){
            const count = Number(elem[0]["#REPEAT"])
            // deep clone jam
            const clone = structuredClone(elem[1])
            for (let i = 0; i < count; i++) {
              elem[i] = await reflectAndGenerate(expressionParseFn, structuredClone(clone), mimicMode);
            }
          }
        }
      }else {
        for (let i = 0; i < (elem as Record<string,unknown>[]).length; i++) {
          elem[i] = await reflectAndGenerate(expressionParseFn, elem[i], mimicMode);
        }
      }

    // if (isNotEmptyPrimitiveArray(elem)) {
    //   if(elem[0] && elem[0]["#REPEAT"] && elem[1]) {
    //     const count = Number(elem[0]["#REPEAT"])
    //     // deep clone jam
    //     for (let i = 0; i < count; i++) {
    //       elem[i] = keepOriginalPrimitive ? elem[i]: generator.generateFromJsonPrimitive(elem[i]);
    //     }
    //   }else {
    //     for (let i = 0; i < (elem as JsonPrimitive[]).length; i++) {
    //       elem[i] = keepOriginalPrimitive ? elem[i] : generator.generateFromJsonPrimitive(elem[i] as JsonPrimitive);
    //     };
    //   }
    // } else if (isNotEmptyObjectArray(elem)) {
    //   if(elem[0] && elem[0]["#REPEAT"] && elem[1]) {
    //     const count = Number(elem[0]["#REPEAT"])
    //     // deep clone jam
    //     const clone = structuredClone(elem[1])
    //     for (let i = 0; i < count; i++) {
    //       elem[i] = await reflectAndGenerate(expressionParseFn, structuredClone(clone), mimicMode);
    //     }
    //   }
    //   else {
    //     for (let i = 0; i < (elem as Record<string,unknown>[]).length; i++) {
    //       elem[i] = await reflectAndGenerate(expressionParseFn, elem[i], mimicMode);
    //     }
    //   }
    } else if (isNonNullableObject(elem)) {
      schema[key] = await reflectAndGenerate(expressionParseFn, elem, mimicMode);
    } else if (isJsonPrimitive(elem)) {
      if (isExpression(elem)) {
        schema[key] = await expressionParseFn(elem);
      } else {
        schema[key] = keepOriginalPrimitive ? elem : generator.generateFromJsonPrimitive(elem);
      }
    }
  };
  return schema;
};

// // if element 0 is #REPEAT flag object, then
// const arrayDeepJam = async(arr: unknown[], parseFn: (input: string) => Promise<unknown>) => {
//     const count = Number(arr[0]["#REPEAT"])
//     // deep clone jam
//     const clone = structuredClone(arr[1])
//     for (let i = 0; i < count; i++) {
//       arr[i] = await reflectAndGenerate(parseFn, structuredClone(clone));
//     }
// }

const isExpression = (elem: unknown): elem is Expression => {
  if(isString(elem)) {
    return elem.startsWith('#')
  }
  return false
}

const isJsonPrimitive = (elem: unknown): elem is JsonPrimitive =>
  isNumber(elem) || isString(elem) || isBoolean(elem) || elem === null;

const isNotEmptyPrimitiveArray = (elem: unknown): elem is JsonPrimitive[] => {
  if (Array.isArray(elem)) {
    const elem0 = elem[0];

    if (isJsonPrimitive(elem0)) {
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

    if (elem0 && !Array.isArray(elem0) && isNonNullableObject(elem0)) {
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

const isNonNullableObject = (val: unknown): val is Record<string, JsonPrimitive> =>
  typeof val === 'object' && val !== null;


export const reflection = {
  reflectAndGenerate,
  isString,
  isNumber,
  isNumberString,
  isDateString,
  isNull,
  isBoolean,
  isObject,
  isNonNullableObject,
  isNotEmptyObjectArray
};
