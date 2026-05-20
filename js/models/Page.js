const PAGE_SIZE = 4096;

export default class Page {
  constructor(id, pid, ptr, size) {
    this.id = id;              
    this.pid = pid;            
    this.ptr = ptr;            
    this.loaded = false;       // esta en RAM?
    this.physicalAddr = null;  // índice del frame en RAM (0-99), null si está en disco

    // Metadata para uso de algoritmos de reemplazo
    this.loadedAt = null;       // timestamp de cuándo entró a RAM (FIFO)
    this.lastUsedAt = null;     // timestamp del último acceso (MRU)
    this.referenceBit = 0;      // bit R para Second Chance (0 o 1)

  }

  get internalFragmentation() {
    return PAGE_SIZE - this.size;

  }
}

export { PAGE_SIZE };