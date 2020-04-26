class Workflow {

    static name = 'Workflow';

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

export default Workflow;