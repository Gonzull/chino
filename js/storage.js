const store = (() => {
  let mem = {};
  let ok = true;
  try {
    localStorage.setItem('__t', '1');
    localStorage.removeItem('__t');
  } catch (e) {
    ok = false;
  }
  return {
    get(k, d) {
      try {
        if (ok) {
          const v = localStorage.getItem(k);
          return v === null ? d : JSON.parse(v);
        }
        return k in mem ? mem[k] : d;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        if (ok) localStorage.setItem(k, JSON.stringify(v));
        else mem[k] = v;
      } catch (e) {
        mem[k] = v;
      }
    },
    remove(k) {
      try {
        if (ok) localStorage.removeItem(k);
        else delete mem[k];
      } catch (e) {}
    }
  };
})();

export { store };
