class Process {
  constructor(pid) {
    this.pid = pid;
    this.symbolTable = new Set();  // conjunto de ptrs activos
    this.alive = true;             // false después de kill
  }
}