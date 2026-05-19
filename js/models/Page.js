class Page {
  constructor(id, pid, ptr, size) {
    this.id = id;              
    this.pid = pid;            
    this.ptr = ptr;            
    this.loaded = false;       // esta en RAM?
    this.physicalAddr = null;  // índice del frame en RAM (0-99), null si está en disco
  }
}