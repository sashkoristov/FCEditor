import BaseFunction from './BaseFunction';

class AtomicFunction extends BaseFunction {

    constructor(name, type = '') {
        super(name);

        this.type = type;
        this.dataIns = [];
        this.dataOuts = [];
    }

    getType() {
        return this.type;
    }

    setType(type) {
        this.type = type;
    }

    getDataIns() {
        return this.dataIns;
    }

    setDataIns(dataIns) {
        this.dataIns = dataIns;
    }

    addDataIn(dataIn) {
        this.dataIns.push(dataIn);
    }

    removeDataIn(index) {
        delete this.dataIns[index];
    }

    getDataOuts() {
        return this.dataOuts;
    }

    setDataOuts(dataOuts) {
        this.dataOuts = dataOuts;
    }

    addDataOut(dataOut) {
        this.dataOuts.push(dataOut);
    }

    removeDataOut(index) {
        delete this.dataOuts[index];
    }

}

export default AtomicFunction;