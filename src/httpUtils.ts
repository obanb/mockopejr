import axios from 'axios/index.js';

const post = async (url: string, data: unknown) => {
  console.log('CALL POST', url);
  const resp = await axios.default.post<unknown>(url, data, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  console.log(`axios POST with status:`);
  return resp;
};

const get = async (url: string) => {
  const resp = await axios.default.get<unknown>(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  console.log(`axios GET with status: ${resp.status}`);
  return resp;
};

export const httpUtils = {
  post,
  get,
};
