class Workflow {
    constructor(name) {
        this.name = name;
        this.dataIns = [];
        this.dataOuts = [];
        this.body = [];
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }

    getBody() {
        return this.body;
    }

    setBody(body) {
        this.body = body;
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

export default Workflow;