export default class SetupScreen {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.fileContent = null;
    this.fileName = null;
    this._startCb = null;
    this._genCb = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="setup-card">
        <h1 class="setup-title">Simulador de Paginación</h1>

        <div class="field">
          <label for="cfg-seed">Semilla aleatoria</label>
          <input type="number" id="cfg-seed" value="12345" />
        </div>

        <div class="field">
          <label for="cfg-alg">Algoritmo a simular</label>
          <select id="cfg-alg">
            <option value="FIFO">FIFO &mdash; First In, First Out</option>
            <option value="SC">SC &mdash; Second Chance</option>
            <option value="LRU">LRU &mdash; Least Recently Used</option>
            <option value="LFU">LFU &mdash; Least Frequently Used</option>
          </select>
        </div>

        <div class="field">
          <label for="cfg-file">Archivo de operaciones (opcional)</label>
          <input type="file" id="cfg-file" accept=".txt,.csv" />
          <small id="cfg-file-info">Si se carga un archivo, se ignoran P y N.</small>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="cfg-p">Procesos (P)</label>
            <input type="number" id="cfg-p" list="p-presets" min="1" step="1" value="10" />
            <small>Sugeridos: 10, 50, 100. Se puede escribir otro valor.</small>
          </div>
          <div class="field">
            <label for="cfg-n">Operaciones (N)</label>
            <input type="number" id="cfg-n" list="n-presets" min="1" step="1" value="500" />
            <small>Sugeridos: 500, 1000, 5000. Se puede escribir otro valor.</small>
          </div>
        </div>

        <div class="setup-actions">
          <button id="btn-generate" class="btn btn-ghost">Generar y descargar archivo</button>
          <button id="btn-start" class="btn btn-primary">Iniciar simulación</button>
        </div>
      </div>`;

    // Lectura del archivo seleccionado
    const fileInput = this.container.querySelector('#cfg-file');
    const fileInfo = this.container.querySelector('#cfg-file-info');
    fileInput.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) {
        this.fileContent = null;
        this.fileName = null;
        fileInfo.textContent = 'Si se carga un archivo, se ignoran P y N.';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result;
        this.fileName = f.name;
        fileInfo.textContent = `Archivo cargado: ${f.name} (P y N se ignoran).`;
      };
      reader.readAsText(f);
    });

    this.container.querySelector('#btn-start').addEventListener('click', () => {
      if (this._startCb) this._startCb(this.getConfig());
    });
    this.container.querySelector('#btn-generate').addEventListener('click', () => {
      if (this._genCb) this._genCb(this.getConfig());
    });
  }

  getConfig() {
    return {
      seed: parseInt(this.container.querySelector('#cfg-seed').value, 10) || 1,
      algorithm: this.container.querySelector('#cfg-alg').value,
      fileContent: this.fileContent,
      P: parseInt(this.container.querySelector('#cfg-p').value, 10),
      N: parseInt(this.container.querySelector('#cfg-n').value, 10),
    };
  }

  onStart(cb) { this._startCb = cb; }
  onGenerateFile(cb) { this._genCb = cb; }

  show() { this.container.style.display = ''; }
  hide() { this.container.style.display = 'none'; }
}
