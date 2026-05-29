export const PAGE_SIZE = 4096;

export default class Page {
  constructor(id, pid, ptr, size) {
    this.id = id;
    this.pid = pid;
    this.ptr = ptr;
    this.size = size;
    this.loaded = false;
    this.physicalAddr = null;
    this.diskAddr = null;

    this.loadedAt = null;
    this.lastUsedAt = null;
    this.accessCount = 0;
    this.referenceBit = 0;  
  }

  /** Bytes desperdiciados por fragmentación interna en esta página. */
  get internalFragmentation() {
    return Math.max(0, PAGE_SIZE - this.size);
  }
}
