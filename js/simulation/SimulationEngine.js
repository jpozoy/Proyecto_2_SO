import MMU from '../models/MMU.js';
import SimulationStats from './SimulationStats.js';
import FIFO from '../algorithms/FIFO.js';
import SecondChance from '../algorithms/SecondChance.js';
import LRU from '../algorithms/LRU.js';
import LFU from '../algorithms/LFU.js';
import Optimal from '../algorithms/Optimal.js';

/** Fábrica: crea el algoritmo elegido a partir de su nombre. */
function createAlgorithm(type) {
  switch ((type || '').toUpperCase()) {
    case 'FIFO': return new FIFO();
    case 'SC':   return new SecondChance();
    case 'LRU':  return new LRU();
    case 'LFU':  return new LFU();
    default:     return new FIFO();
  }
}

export default class SimulationEngine {
  constructor(operations, algorithmType) {
    this.operations = operations;
    this.algorithmType = (algorithmType || 'FIFO').toUpperCase();

    this.statsOpt = new SimulationStats();
    this.statsAlg = new SimulationStats();

    // OPT necesita la secuencia completa para preprocesar los usos futuros.
    this.mmuOpt = new MMU(new Optimal(operations), this.statsOpt);
    this.mmuAlg = new MMU(createAlgorithm(this.algorithmType), this.statsAlg);

    this.currentStep = 0;
    this.paused = false;
    this.speed = 150;
    this._interval = null;

    this.onStepCallback = null;
    this.onFinishCallback = null;
  }

  /** Ejecuta una operación en ambas MMU. Retorna false si ya no hay más. */
  step() {
    if (this.isFinished()) return false;

    const op = this.operations[this.currentStep];

    this.mmuOpt.algorithm.notifyStep(this.currentStep);
    this.mmuAlg.algorithm.notifyStep(this.currentStep);

    this._apply(this.mmuOpt, op);
    this._apply(this.mmuAlg, op);

    this.currentStep++;
    if (this.onStepCallback) this.onStepCallback(this);

    if (this.isFinished()) {
      this._stopInterval();
      if (this.onFinishCallback) this.onFinishCallback(this);
    }
    return true;
  }

  _apply(mmu, op) {
    switch (op.type) {
      case 'new':    mmu.handleNew(op.pid, op.ptr, op.size); break;
      case 'use':    mmu.handleUse(op.ptr); break;
      case 'delete': mmu.handleDelete(op.ptr); break;
      case 'kill':   mmu.handleKill(op.pid); break;
    }
  }

  /** Inicia la ejecución automática. */
  run() {
    this.paused = false;
    if (this._interval) return;
    this._interval = setInterval(() => {
      if (this.paused) return;
      if (!this.step()) this._stopInterval();
    }, this.speed);
  }

  pause() {
    this.paused = true;
    this._stopInterval();
  }

  resume() {
    if (!this.isFinished()) this.run();
  }

  _stopInterval() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  /** Cambia la velocidad; si está corriendo, reinicia el intervalo. */
  setSpeed(ms) {
    this.speed = ms;
    if (this._interval) {
      this._stopInterval();
      this.run();
    }
  }

  /** Reinicia la simulación al estado inicial (mismas operaciones). */
  reset() {
    this._stopInterval();
    this.statsOpt = new SimulationStats();
    this.statsAlg = new SimulationStats();
    this.mmuOpt = new MMU(new Optimal(this.operations), this.statsOpt);
    this.mmuAlg = new MMU(createAlgorithm(this.algorithmType), this.statsAlg);
    this.currentStep = 0;
    this.paused = false;
  }

  isRunning() { return this._interval !== null && !this.paused; }
  isFinished() { return this.currentStep >= this.operations.length; }
}