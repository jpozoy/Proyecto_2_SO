export default class Process {
  constructor(pid) {
    this.pid = pid;
    this.symbolTable = new Set();  // conjunto de ptrs activos
    this.alive = true;             // false después de kill
  }

  addPtr(ptr) {
    this.symbolTable.add(ptr);
  }

  removePtr(ptr) {
    this.symbolTable.delete(ptr);
  }
   
  hasPtr(ptr) {
    return this.symbolTable.has(ptr);
  }
   
  getPtrs() {
    return [...this.symbolTable];
  }

  kill() {
    this.alive = false;
    this.symbolTable.clear();
  }

}