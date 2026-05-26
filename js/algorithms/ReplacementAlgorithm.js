export default class ReplacementAlgorithm {
  selectVictim(loadedPages) {
    throw new Error('selectVictim() debe implementarse en la subclase');
  }
  notifyAccess(page) { /* sin acción */ }

  notifyRemove(page) { /* sin acción */ }

  notifyStep(operationIndex) { /* sin acción */ }
}
