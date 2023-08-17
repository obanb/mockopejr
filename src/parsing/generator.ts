import { reflection } from './reflection.js';
import { JsonPrimitive } from './types.js';

const generateFromJsonPrimitive = (value: JsonPrimitive) => {
  const specialsReg = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  const vovelsReg = /[aeiou]/;
  const consonantsReg = /[bcdfghjklmnpqrstvwxyz]/;
  const upperCaseReg = /[A-Z]/;

  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const vovels = 'aeiou';

  if (reflection.isString(value) || reflection.isNumber(value)) {
    const stringify = String(value);
    const chars = stringify.split('');

    const r = chars.map((char) => {
      if (specialsReg.test(char)) {
        return char;
      } else if (reflection.isNumberString(char)) {
        return Math.floor(Math.random() * 10);
      } else {
        const isUpperCase = upperCaseReg.test(char);
        const lowerCase = char.toLowerCase();

        let pick = '';

        if (consonantsReg.test(lowerCase)) {
          pick = consonants[Math.floor(Math.random() * consonants.length)];
        } else if (vovelsReg.test(lowerCase)) {
          pick = vovels[Math.floor(Math.random() * vovels.length)];
        }

        return isUpperCase ? pick.toUpperCase() : pick;
      }
    });

    const join = r.join('');

    if (reflection.isNumber(value)) {
      return Number(join);
    }

    return join;
  } else if (reflection.isBoolean(value)) {
    return !Math.round(Math.random());
  } else if (reflection.isDateString(value)) {
    // TODO
    return new Date().toISOString();
  } else {
    return value;
  }
};

export const generator = {
  generateFromJsonPrimitive,
};
