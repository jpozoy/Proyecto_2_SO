
import { PAGE_SIZE } from '../models/Page.js';
import { TOTAL_FRAMES } from '../models/MMU.js';
 
const TOTAL_RAM_KB = (TOTAL_FRAMES * PAGE_SIZE) / 1024; // 400KB

export default class SimulationStats {
  constructor() {
    this.clock = 0;           // Tiempo total de simulación en segundos
    this.thrashingTime = 0;   // Tiempo gastado en fallos de página
    this.pageFaults = 0;      // Cantidad total de fallos
    this.pageHits = 0;        // Cantidad total de hits
  }
 
  /**
   * Registra un hit de página.
   * La página ya estaba en RAM → +1s al reloj.
   */
  registerHit() {
    this.clock += 1;
    this.pageHits++;
  }
 
  /**
   * Registra un fallo de página.
   * La página estaba en disco (o es nueva) → +5s al reloj y al thrashing.
   */
  registerFault() {
    this.clock += 5;
    this.thrashingTime += 5;
    this.pageFaults++;
  }
}