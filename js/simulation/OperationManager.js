import { Random } from '../utils/prng.js';

export default class OperationManager {
  constructor(seed) {
    this.seed = seed;
    this.rng = new Random(seed);
    this.operations = [];
    this.nextPtr = 1; // contador global de ptr; nunca se reutiliza
  }

  parseFile(content) {
    const ops = [];
    this.nextPtr = 1;
    const lines = (content || '').split(/\r?\n/);

    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;

      const m = line.match(/^([a-zA-Z]+)\s*\(\s*([^)]*)\)\s*$/);
      if (!m) continue;

      const cmd = m[1].toLowerCase();
      const args = m[2].split(',').map(s => s.trim()).filter(s => s.length > 0);

      if (cmd === 'new') {
        ops.push({ type: 'new', pid: Number(args[0]), ptr: this.nextPtr++, size: Number(args[1]) });
      } else if (cmd === 'use') {
        ops.push({ type: 'use', ptr: Number(args[0]) });
      } else if (cmd === 'delete') {
        ops.push({ type: 'delete', ptr: Number(args[0]) });
      } else if (cmd === 'kill') {
        ops.push({ type: 'kill', pid: Number(args[0]) });
      }
    }
    this.operations = ops;
    return ops;
  }

  generate(P, N) {
    const rng = this.rng;
    this.nextPtr = 1;

    const procs = [];
    for (let i = 1; i <= P; i++) {
      procs.push({ pid: i, ptrs: [], alive: true });
    }

    const ops = [];
    while (ops.length < N) {
      const alive = procs.filter(p => p.alive);
      if (alive.length === 0) break;

      const remaining = N - ops.length;
      // Hay que reservar una operación 'kill' por cada proceso vivo.
      const mustKill = remaining <= alive.length;
      const p = rng.pick(alive);

      if (mustKill) {
        ops.push({ type: 'kill', pid: p.pid });
        p.alive = false;
        continue;
      }

      // Kill voluntario ocasional (nunca al último proceso vivo).
      if (alive.length > 1 && rng.chance(0.06)) {
        ops.push({ type: 'kill', pid: p.pid });
        p.alive = false;
        continue;
      }

      // Operación regular
      let type;
      if (p.ptrs.length === 0) {
        type = 'new'; // sin ptrs solo se puede pedir memoria
      } else {
        const r = rng.float();
        type = r < 0.55 ? 'use' : (r < 0.80 ? 'new' : 'delete');
      }

      if (type === 'new') {
        const ptr = this.nextPtr++;

        const r = rng.float();
        let size;
        if (r < 0.60)      size = rng.int(50, 8192);       // 1-2 páginas
        else if (r < 0.90) size = rng.int(8193, 40960);    // 3-10 páginas
        else               size = rng.int(40961, 131072); // 11-32 páginas
        ops.push({ type: 'new', pid: p.pid, ptr, size });
        p.ptrs.push(ptr);
      } else if (type === 'use') {
        ops.push({ type: 'use', ptr: rng.pick(p.ptrs) });
      } else {
        const idx = rng.int(0, p.ptrs.length - 1);
        const ptr = p.ptrs[idx];
        p.ptrs.splice(idx, 1);
        ops.push({ type: 'delete', ptr });
      }
    }

    this.operations = ops;
    return ops;
  }

  exportToFile() {
    return this.operations.map(op => {
      switch (op.type) {
        case 'new':    return `new(${op.pid},${op.size})`;
        case 'use':    return `use(${op.ptr})`;
        case 'delete': return `delete(${op.ptr})`;
        case 'kill':   return `kill(${op.pid})`;
        default:       return '';
      }
    }).join('\n');
  }

  downloadFile() {
    const content = this.exportToFile();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operaciones_seed${this.seed}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}