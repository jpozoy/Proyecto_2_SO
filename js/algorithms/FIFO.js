import ReplacementAlgorithm from './ReplacementAlgorithm.js';

export default class FIFO extends ReplacementAlgorithm {
  selectVictim(loadedPages) {
    let victima = loadedPages[0];

    for (let i = 1; i < loadedPages.length; i++) {
      const p = loadedPages[i];
      if (p.loadedAt < victima.loadedAt) {
        victima = p;
      } else if (p.loadedAt === victima.loadedAt && p.id < victima.id) {
        victima = p;
      }
    }

    return victima;
  }
}