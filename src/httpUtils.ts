import axios from 'axios/index.js';

const post = (url: string, data: unknown) => axios.default.post<unknown>(url, data, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

const get =  (url: string) => axios.default.get<unknown>(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

export const httpUtils = {
  post,
  get,
};
