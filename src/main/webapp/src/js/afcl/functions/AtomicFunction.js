import BaseFunction from './BaseFunction';

class AtomicFunction extends BaseFunction {

    static name = 'AtomicFunction';

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

    removeDataInByName(name) {
        this.dataIns = this.dataIns.filter(d => d.name != name);
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

    removeDataOutByName(name) {
        this.dataOuts = this.dataOuts.filter(d => d.name != name);
    }

}

export default AtomicFunction;