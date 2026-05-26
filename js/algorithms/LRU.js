import ReplacementAlgorithm from './ReplacementAlgorithm.js';

export default class LRU extends ReplacementAlgorithm {
  selectVictim(loadedPages) {
    return loadedPages.reduce((victima, p) => {
      if (p.lastUsedAt !== victima.lastUsedAt) {
        return p.lastUsedAt < victima.lastUsedAt ? p : victima;
      }
      return p.id < victima.id ? p : victima; 
    });
  }
}