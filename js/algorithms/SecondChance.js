import ReplacementAlgorithm from './ReplacementAlgorithm.js';

export default class SecondChance extends ReplacementAlgorithm {
  constructor() {
    super();
    this.queue = []; // Page[] ordenada por entrada a RAM
  }

  selectVictim(loadedPages) {
    // Robustez: descartar de la cola páginas que ya no estén en RAM.
    const loadedSet = new Set(loadedPages);
    this.queue = this.queue.filter(p => loadedSet.has(p));

    let guard = this.queue.length * 2 + 1; // evita bucles infinitos
    while (this.queue.length > 0 && guard-- > 0) {
      const page = this.queue.shift();
      if (page.referenceBit === 1) {
        page.referenceBit = 0;   // consume su segunda oportunidad
        this.queue.push(page);   // y va al final de la cola
      } else {
        return page;             // bit 0 -> víctima
      }
    }
    return this.queue.shift() || loadedPages[0]; // fallback defensivo
  }

  notifyAccess(page) {
    page.referenceBit = 1;
    if (!this.queue.includes(page)) this.queue.push(page);
  }

  notifyRemove(page) {
    const i = this.queue.indexOf(page);
    if (i !== -1) this.queue.splice(i, 1);
  }
}