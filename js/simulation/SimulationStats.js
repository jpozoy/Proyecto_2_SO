import { PAGE_SIZE } from '../models/Page.js';
import { TOTAL_FRAMES } from '../models/MMU.js';

const TOTAL_RAM_KB = (TOTAL_FRAMES * PAGE_SIZE) / 1024; // 400 KB
const PAGE_KB = PAGE_SIZE / 1024;                       // 4 KB

export default class SimulationStats {
  constructor() {
    this.clock = 0;         
    this.thrashingTime = 0; 
    this.pageFaults = 0;    
    this.pageHits = 0;      
  }

  
  registerHit() {
    this.clock += 1;
    this.pageHits++;
  }

  registerFault() {
    this.clock += 5;
    this.thrashingTime += 5;
    this.pageFaults++;
  }



  getRamUsageKB(mmu) {
    return mmu.getLoadedPages().length * PAGE_KB;
  }

  getRamUsagePercent(mmu) {
    return (mmu.getLoadedPages().length / TOTAL_FRAMES) * 100;
  }

  getVRamUsageKB(mmu) {
    return mmu.virtualMemory.length * PAGE_KB;
  }

 
  getVRamUsagePercent(mmu) {
    return (this.getVRamUsageKB(mmu) / TOTAL_RAM_KB) * 100;
  }

  getThrashingPercent() {
    // Avisar el paso actual a ambos algoritmos (solo OPT lo aprovecha).
    return this.clock > 0 ? (this.thrashingTime / this.clock) * 100 : 0;
  }

  getFragmentationKB(mmu) {
    let bytes = 0;
    for (const page of mmu.getAllPages()) {
      bytes += page.internalFragmentation;
    }
    return bytes / 1024;
  }
}