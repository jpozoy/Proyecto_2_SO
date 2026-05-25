export const PAGE_SIZE = 4096; // bytes por página

export default class Page {
  constructor(id, pid, ptr, size) {
    this.id = id;              // ID único global de la página (lo asigna la MMU)
    this.pid = pid;            // PID del proceso dueño
    this.ptr = ptr;            // Puntero lógico al que pertenece la página
    this.size = size;          // Bytes reales usados en esta página
    this.loaded = false;       // true = en RAM, false = en disco (V-RAM)
    this.physicalAddr = null;  // índice de marco en RAM (0-99); null si está en disco
    this.diskAddr = null;      // segmento en disco; null si está en RAM  (D-ADDR)

    // Metadata para los algoritmos de reemplazo
    this.loadedAt = null;      // Para FIFO
    this.lastUsedAt = null;    // Para LRU
    this.accessCount = 0;      // Para LFU
    this.referenceBit = 0;     // bit de referencia (0 o 1) para Second Chance
  }

  /** Bytes desperdiciados por fragmentación interna en esta página. */
  get internalFragmentation() {
    return Math.max(0, PAGE_SIZE - this.size);
  }
}
