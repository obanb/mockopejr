import axios from 'axios/index.js';

const post = async (url: string, data: unknown[]) => {
  const resp = await axios.default.post<unknown>(url, data, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  console.log(`axios with status: ${resp.status}`);
  return  resp
};

const get = async (url: string) => {
  const resp = await axios.default.get<unknown>(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  console.log(`axios with status: ${resp.status}`);
  return  resp
};

export const httpUtils = {
  post,
  get
};
