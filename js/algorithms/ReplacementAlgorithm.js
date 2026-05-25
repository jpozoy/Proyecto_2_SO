export default class ReplacementAlgorithm {
  selectVictim(loadedPages) {
    throw new Error('selectVictim() debe implementarse en la subclase');
  }
  // Se llama cada vez que una página es accedida (hit o recién cargada).
  notifyAccess(page) { /* sin acción */ }

  // Se llama cuando una página deja la RAM (expulsión o delete/kill). 
  notifyRemove(page) { /* sin acción */ }

  // Se llama una vez por operación, antes de ejecutarla. Solo el optimo lo usa. 
  notifyStep(operationIndex) { /* sin acción */ }
}
