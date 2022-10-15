
const madge = require('madge');

madge('..build/src/main.js').then((res) => {
  console.log(res.obj());
});
