export function mulberry32(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


export class Random {
  constructor(seed) {
    this.seed = seed;
    this._next = mulberry32(seed);
  }


  float() {
    return this._next();
  }


  int(min, max) {
    return Math.floor(this._next() * (max - min + 1)) + min;
  }

  pick(arr) {
    return arr[this.int(0, arr.length - 1)];
  }


  chance(p) {
    return this._next() < p;
  }
}