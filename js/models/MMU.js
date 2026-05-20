import Page, { PAGE_SIZE } from './Page.js';
import Process from './Process.js';

class MMU {
    constructor(algorithm, stats) {
    this.algorithm = algorithm;
    this.stats = stats;

    // RAM: array de 100 slots, cada uno contiene una Page o null
    this.realMemory = new Array(TOTAL_FRAMES).fill(null);

    // Disco: lista de páginas en memoria virtual
    this.virtualMemory = [];

    // ptr → Page[] (cada ptr puede tener múltiples páginas)
    this.ptrMap = new Map();

    // Contadores globales que NUNCA se resetean
    this.nextPtrId = 1;
    this.nextPageId = 1;

    // PID → Process
    this.processes = new Map();
    }

    handleNew(pid, size) {
        // Crear proceso si no existe
        if (!this.processes.has(pid)) {
        this.processes.set(pid, new Process(pid));
        }
        const process = this.processes.get(pid);
    
        // Asignar ptr único
        const ptr = this.nextPtrId++;
    
        // Calcular cuántas páginas se necesitan
        const numPages = Math.ceil(size / PAGE_SIZE);
        const pages = [];
    
        for (let i = 0; i < numPages; i++) {
        // Calcular bytes reales de esta página (la última puede ser parcial)
        const isLastPage = i === numPages - 1;
        const pageSize = isLastPage ? size - (PAGE_SIZE * i) : PAGE_SIZE;
    
        // Crear la página
        const page = new Page(this.nextPageId++, pid, ptr, pageSize);
        pages.push(page);
    
        // Página nueva = siempre fallo
        this.stats.registerFault();
    
        // Colocar en RAM (si no hay espacio, pedir reemplazo)
        this.loadPageToRAM(page);
        }
    
        // Registrar en el mapa de punteros
        this.ptrMap.set(ptr, pages);
    
        // Registrar ptr en la tabla de símbolos del proceso
        process.addPtr(ptr);
    
        return ptr;
    }

}