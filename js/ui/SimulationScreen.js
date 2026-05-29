export default class SimulationScreen {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.engine = null;
  }

  render(engine) {
    this.engine = engine;
    this.container.innerHTML = `
      <div class="sim-wrap">
        <header class="sim-header">
          <div class="sim-header-left">
            <h1>Simulador de Paginación</h1>
            <span class="sim-badge">OPT&nbsp;&nbsp;vs&nbsp;&nbsp;${engine.algorithmType}</span>
          </div>
          <div class="sim-controls">
            <button id="sim-playpause" class="btn btn-primary">&#9654; Iniciar</button>
            <button id="sim-step" class="btn btn-ghost">Paso &rsaquo;</button>
            <button id="sim-reset" class="btn btn-ghost">&#8635; Reiniciar</button>
            <button id="sim-restart" class="btn btn-ghost">&#8635; Nueva simulación</button>
          </div>
        </header>

        <div class="sim-progress">
          <div class="sim-progress-bar"><div id="sim-progress-fill"></div></div>
          <span id="sim-progress-text"></span>
        </div>

        <div class="sim-panels">
          ${this._panelTemplate('opt', 'Algoritmo Óptimo (OPT)', 'OPT')}
          ${this._panelTemplate('alg', 'Algoritmo: ' + engine.algorithmType, engine.algorithmType)}
        </div>

        <div id="sim-summary" class="sim-summary" style="display:none"></div>
      </div>`;

    this.elPlayPause = this.container.querySelector('#sim-playpause');
    this.elStep = this.container.querySelector('#sim-step');
    this.elReset = this.container.querySelector('#sim-reset');
    this.elRestart = this.container.querySelector('#sim-restart');
    this.elProgressFill = this.container.querySelector('#sim-progress-fill');
    this.elProgressText = this.container.querySelector('#sim-progress-text');
    this.elSummary = this.container.querySelector('#sim-summary');

    this.elPlayPause.addEventListener('click', () => {
      if (engine.isFinished()) return;
      if (engine.isRunning()) {
        engine.pause();
        this.elPlayPause.innerHTML = '&#9654; Reanudar';
      } else {
        engine.run();
        this.elPlayPause.innerHTML = '&#10073;&#10073; Pausar';
      }
    });

    this.elReset.addEventListener('click', () => {
      engine.reset();
      this.elPlayPause.innerHTML = '&#9654; Iniciar';
      this.elPlayPause.disabled = false;
      this.elStep.disabled = false;
      this.elSummary.style.display = 'none';
      this.elSummary.innerHTML = '';
      this.update(engine);
    });

    this.elStep.addEventListener('click', () => {
      if (engine.isRunning()) {
        engine.pause();
        this.elPlayPause.innerHTML = '&#9654; Reanudar';
      }
      engine.step();
    });

    engine.setSpeed(5);

    this.elRestart.addEventListener('click', () => location.reload());
  }

_panelTemplate(key, title, ramLabel) {
    return `
      <section class="panel">
        <h2 class="panel-title">${title}</h2>
        <div class="ram-block">
          <div class="block-caption">RAM &mdash; ${ramLabel}</div>
          <div class="ram-grid" id="ram-${key}"></div>
        </div>
        <div class="stats-grid" id="stats-${key}"></div>
        <div class="mmu-block">
          <div class="block-caption">Tabla de la MMU</div>
          <div class="mmu-table-scroll">
            <table class="mmu-table" id="mmu-${key}"></table>
          </div>
        </div>
      </section>`;
  }

  update(engine) {
    const total = engine.operations.length;
    const pct = total ? (engine.currentStep / total) * 100 : 0;
    this.elProgressFill.style.width = pct.toFixed(1) + '%';
    this.elProgressText.textContent = `Operación ${engine.currentStep} / ${total}`;

    this._renderRAM('ram-opt', engine.mmuOpt);
    this._renderRAM('ram-alg', engine.mmuAlg);
    this._renderStats('stats-opt', engine.statsOpt, engine.mmuOpt);
    this._renderStats('stats-alg', engine.statsAlg, engine.mmuAlg);
    this._renderMMU('mmu-opt', engine.mmuOpt);
    this._renderMMU('mmu-alg', engine.mmuAlg);

    if (engine.isFinished()) {
      this.elPlayPause.innerHTML = '&#10003; Finalizado';
      this.elPlayPause.disabled = true;
      this.elStep.disabled = true;
    }
  }

  onFinish(engine) {
    this.update(engine);
    this._renderSummary(engine);
  }

  _pidColor(pid) {
    return `hsl(${(pid * 47) % 360}, 62%, 64%)`;
  }

  _renderRAM(id, mmu) {
    const el = this.container.querySelector('#' + id);
    let html = '';
    for (let i = 0; i < mmu.realMemory.length; i++) {
      const page = mmu.realMemory[i];
      if (page) {
        html += `<div class="ram-cell occupied" style="background:${this._pidColor(page.pid)}"
          title="Marco ${i} · PID ${page.pid} · Página ${page.id} · ptr ${page.ptr}">${page.pid}</div>`;
      } else {
        html += `<div class="ram-cell" title="Marco ${i} libre"></div>`;
      }
    }
    el.innerHTML = html;
  }

  _renderStats(id, stats, mmu) {
    const el = this.container.querySelector('#' + id);
    const thr = stats.getThrashingPercent();
    const ramKB = stats.getRamUsageKB(mmu);
    const ramP = stats.getRamUsagePercent(mmu);
    const vramKB = stats.getVRamUsageKB(mmu);
    const vramP = stats.getVRamUsagePercent(mmu);
    const frag = stats.getFragmentationKB(mmu);

    const card = (label, value, cls) =>
      `<div class="stat-card ${cls || ''}">
         <span class="stat-label">${label}</span>
         <span class="stat-value">${value}</span>
       </div>`;

    el.innerHTML =
      card('Procesos corriendo', mmu.getActiveProcessCount()) +
      card('Tiempo de simulación', stats.clock + ' s') +
      card('RAM utilizada', `${ramKB} KB · ${ramP.toFixed(1)}%`) +
      card('V-RAM utilizada', `${vramKB} KB · ${vramP.toFixed(1)}%`) +
      card('Thrashing', `${stats.thrashingTime} s · ${thr.toFixed(1)}%`, thr > 50 ? 'danger' : '') +
      card('Fragmentación interna', frag.toFixed(2) + ' KB') +
      card('Hits de página', stats.pageHits) +
      card('Fallos de página', stats.pageFaults);
  }

  _renderMMU(id, mmu) {
    const el = this.container.querySelector('#' + id);
    const pages = mmu.getAllPages().sort((a, b) => a.id - b.id);

    let html = `<thead><tr>
      <th>PAGE&nbsp;ID</th><th>PID</th><th>LOADED</th><th>L-ADDR</th>
      <th>M-ADDR</th><th>D-ADDR</th><th>LOADED-T</th><th>MARK</th>
    </tr></thead><tbody>`;

    for (const p of pages) {
      const mark = mmu.lastOpResult.get(p.id) || '';
      html += `<tr style="background:${this._pidColor(p.pid)}">
        <td>${p.id}</td>
        <td>${p.pid}</td>
        <td>${p.loaded ? 'X' : ''}</td>
        <td>${p.ptr}</td>
        <td>${p.physicalAddr !== null ? p.physicalAddr : ''}</td>
        <td>${p.diskAddr !== null ? p.diskAddr : ''}</td>
        <td>${p.loadedAt !== null ? p.loadedAt + 's' : ''}</td>
        <td>${mark}</td>
      </tr>`;
    }
    html += '</tbody>';
    el.innerHTML = html;
  }

  _renderSummary(engine) {
    const o = engine.statsOpt;
    const a = engine.statsAlg;
    const diff = (x, y) => {
      const d = y - x;
      return (d > 0 ? '+' : '') + d;
    };
    this.elSummary.style.display = '';
    this.elSummary.innerHTML = `
      <h3>Resumen comparativo &mdash; simulación finalizada</h3>
      <table class="summary-table">
        <thead><tr>
          <th>Métrica</th><th>OPT</th><th>${engine.algorithmType}</th><th>Diferencia</th>
        </tr></thead>
        <tbody>
          <tr><td>Tiempo total</td><td>${o.clock}s</td><td>${a.clock}s</td><td>${diff(o.clock, a.clock)}s</td></tr>
          <tr><td>Fallos de página</td><td>${o.pageFaults}</td><td>${a.pageFaults}</td><td>${diff(o.pageFaults, a.pageFaults)}</td></tr>
          <tr><td>Hits de página</td><td>${o.pageHits}</td><td>${a.pageHits}</td><td>${diff(o.pageHits, a.pageHits)}</td></tr>
          <tr><td>Tiempo en thrashing</td><td>${o.thrashingTime}s</td><td>${a.thrashingTime}s</td><td>${diff(o.thrashingTime, a.thrashingTime)}s</td></tr>
        </tbody>
      </table>`;
  }

  show() { this.container.style.display = ''; }
  hide() { this.container.style.display = 'none'; }
}
