import BaseFunction from "./BaseFunction";

class Compound extends BaseFunction {

    constructor(name = '') {
        super(name);
        this.dataIns = [];
        this.dataOuts = [];
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

export default Compound;