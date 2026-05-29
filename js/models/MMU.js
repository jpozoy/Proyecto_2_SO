import Page, { PAGE_SIZE } from './Page.js';
import Process from './Process.js';

export const TOTAL_FRAMES = 100; // 100 marcos x 4 KB = 400 KB de RAM

export default class MMU {
  constructor(algorithm, stats) {
    this.algorithm = algorithm;
    this.stats = stats;

    this.realMemory = new Array(TOTAL_FRAMES).fill(null); 
    this.virtualMemory = [];                              
    this.ptrMap = new Map();                              
    this.processes = new Map();                          
    this.nextPageId = 1;   
    this.nextDiskAddr = 1; 
    this.lastOpResult = new Map();
  }

  /** Solicita memoria nueva. El ptr ya viene asignado por OperationManager. */
  handleNew(pid, ptr, size) {
    this.lastOpResult = new Map();
    const process = this._getOrCreateProcess(pid);

    const numPages = Math.max(1, Math.ceil(size / PAGE_SIZE));
    const pages = [];
    const pinned = new Set();

    for (let i = 0; i < numPages; i++) {
      const isLast = i === numPages - 1;
      const pageSize = isLast ? size - PAGE_SIZE * i : PAGE_SIZE;

      const page = new Page(this.nextPageId++, pid, ptr, Math.max(0, pageSize));
      pages.push(page);

      this.stats.registerFault();
      this._loadToReal(page, pinned);
      pinned.add(page);
      this.lastOpResult.set(page.id, 'F');
      this._recordAccess(page);
    }

    this.ptrMap.set(ptr, pages);
    process.addPtr(ptr);
    return ptr;
  }

  /** Usa un puntero: garantiza que todas sus páginas estén en RAM. */
  handleUse(ptr) {
    this.lastOpResult = new Map();
    const pages = this.ptrMap.get(ptr);
    if (!pages) return; 

    const pinned = new Set(pages); 

    for (const page of pages) {
      if (page.loaded) {
        this.stats.registerHit();
        this.lastOpResult.set(page.id, 'H');
      } else {
        this.stats.registerFault();
        this._removeFromVirtual(page);
        this._loadToReal(page, pinned);
        this.lastOpResult.set(page.id, 'F');
      }
      this._recordAccess(page);
    }
  }

  /** Borra un puntero: libera todas sus páginas y lo elimina del mapa. */
  handleDelete(ptr) {
    this.lastOpResult = new Map();
    const pages = this.ptrMap.get(ptr);
    if (!pages) return;

    for (const page of pages) this._removePage(page);
    this.ptrMap.delete(ptr);

    for (const process of this.processes.values()) {
      if (process.hasPtr(ptr)) { process.removePtr(ptr); break; }
    }
  }

  /** Mata un proceso: libera todas sus páginas y punteros. */
  handleKill(pid) {
    this.lastOpResult = new Map();
    const process = this._getOrCreateProcess(pid);

    for (const ptr of process.getPtrs()) {
      const pages = this.ptrMap.get(ptr);
      if (pages) { for (const page of pages) this._removePage(page); }
      this.ptrMap.delete(ptr);
    }
    process.kill();
  }

  hasFreeFrame() { return this.realMemory.includes(null); }

  getFreeFrameIndex() { return this.realMemory.indexOf(null); }

  /** Páginas actualmente en RAM. */
  getLoadedPages() { return this.realMemory.filter(p => p !== null); }

  /** Todas las páginas activas en el sistema (RAM + disco). */
  getAllPages() {
    const all = [];
    for (const pages of this.ptrMap.values()) {
      for (const p of pages) all.push(p);
    }
    return all;
  }

  /** Cantidad de procesos vivos (todavía no matados). */
  getActiveProcessCount() {
    let n = 0;
    for (const p of this.processes.values()) if (p.alive) n++;
    return n;
  }

  _getOrCreateProcess(pid) {
    if (!this.processes.has(pid)) this.processes.set(pid, new Process(pid));
    return this.processes.get(pid);
  }

  /**
   * Registra un acceso a una página (hit o recién cargada).
   * La MMU centraliza la metadata de tiempo/frecuencia porque es el
   * único punto donde ocurren los accesos y conoce el reloj. Así
   * FIFO/LRU/LFU no necesitan listas internas: solo leen estos campos.
   */
  _recordAccess(page) {
    page.lastUsedAt = this.stats.clock; // LRU
    page.accessCount += 1;              // LFU
    this.algorithm.notifyAccess(page);  // SC: marca referenceBit y encola
  }

  /** Coloca una página en RAM; si no hay marco libre, pide una víctima. */
  _loadToReal(page) {
    if (!this.hasFreeFrame()) {
      const victim = this.algorithm.selectVictim(this.getLoadedPages());
      this._moveToVirtual(victim);
    }
    const frame = this.getFreeFrameIndex();
    this.realMemory[frame] = page;
    page.loaded = true;
    page.physicalAddr = frame;
    page.diskAddr = null;
    page.loadedAt = this.stats.clock; // FIFO
  }

  /** Expulsa una página de RAM a disco (memoria virtual). */
  _moveToVirtual(page) {
    if (page.physicalAddr !== null) this.realMemory[page.physicalAddr] = null;
    page.loaded = false;
    page.physicalAddr = null;
    page.diskAddr = this.nextDiskAddr++;
    this.virtualMemory.push(page);
    this.lastOpResult.set(page.id, 'V'); 
    // Notificar al algoritmo que la página salió de RAM (evita desincronización).
    this.algorithm.notifyRemove(page);
  }

  _removeFromVirtual(page) {
    const i = this.virtualMemory.indexOf(page);
    if (i !== -1) this.virtualMemory.splice(i, 1);
  }

  /** Elimina por completo una página del sistema (delete / kill). */
  _removePage(page) {
    if (page.loaded) {
      if (page.physicalAddr !== null) this.realMemory[page.physicalAddr] = null;
    } else {
      this._removeFromVirtual(page);
    }
    this.algorithm.notifyRemove(page);
  }
}