class MMU {
    constructor(algorithm) {
        this.algorithm = algorithm;
        this.realMemory = new Array(100).fill(null);
        this.virtualMemory = [];
    }
}