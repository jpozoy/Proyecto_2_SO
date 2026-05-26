import ReplacementAlgorithm from './ReplacementAlgorithm.js';

export default class LFU extends ReplacementAlgorithm {
  selectVictim(loadedPages) {
    return loadedPages.reduce((victima, p) => {
      if (p.accessCount !== victima.accessCount) {
        return p.accessCount < victima.accessCount ? p : victima;
      }
      if (p.lastUsedAt !== victima.lastUsedAt) {
        return p.lastUsedAt < victima.lastUsedAt ? p : victima;
      }
      return p.id < victima.id ? p : victima; 
    });
  }
}