import ReplacementAlgorithm from './ReplacementAlgorithm.js';

export default class Optimal extends ReplacementAlgorithm {
  constructor(allOperations) {
    super();
    this.allOps = allOperations || [];
    // proximoUso[i] = siguiente índice donde se usa el mismo ptr
    this.proximoUso = new Array(this.allOps.length).fill(-1);

    // recorrer de atrás para adelante
    const ultimo = {}; // ptr -> último índice visto
    for (let i = this.allOps.length - 1; i >= 0; i--) {
      if (this.allOps[i].type === 'use') {
      const ptr = this.allOps[i].ptr;
      if (ultimo[ptr] !== undefined) {
      this.proximoUso[i] = ultimo[ptr];
    }
    ultimo[ptr] = i;
      }
    }
  }

  notifyStep(operationIndex) {
    this.currentStep = operationIndex;
  }

  selectVictim(loadedPages) {
    let victima = loadedPages[0];
    let usoMasLejano = -1;

    for (const page of loadedPages) {
        // buscar el próximo uso desde currentStep
        let proximoUso = -1;
        let i = this.ultimoIndice(page.ptr);
        while (i !== -1) {
        if (i > this.currentStep) { proximoUso = i; break; }
        i = this.proximoUso[i];
        }

        if (proximoUso === -1) return page;
        if (proximoUso > usoMasLejano) {
        usoMasLejano = proximoUso;
        victima = page;
        }
    }
    return victima;
  }

  ultimoIndice(ptr) {
    for (let i = 0; i < this.allOps.length; i++) {
        if (this.allOps[i].type === 'use' && this.allOps[i].ptr === ptr) return i;
    }
    return -1;
  }

  // notifyAccess / notifyRemove: no-op. OPT no necesita metadata por acceso.
}