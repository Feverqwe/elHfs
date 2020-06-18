/**
 * @param {number} limit
 * @param {Array} items
 * @param {function(*, number, Array)} callback
 * @return {Promise<Array>}
 */
const parallel = (limit, items, callback) => {
  limit = Math.min(limit, items.length);
  let index = 0;
  let canceled = false;
  const results = new Array(items.length);

  const runThread = () => {
    if (canceled || index >= items.length) return;

    const idx = index++;
    const item = items[idx];

    return promiseTry(() => callback(item, idx, items)).then((result) => {
      results[idx] = result;
      return runThread();
    }, (err) => {
      canceled = true;
      throw err;
    });
  };

  const threads = new Array(limit);
  for (let i = 0; i < limit; i++) {
    threads[i] = runThread();
  }
  return Promise.all(threads).then(() => results);
};

const promiseTry = (callback) => {
  return new Promise(r => r(callback()));
};

module.exports = parallel;