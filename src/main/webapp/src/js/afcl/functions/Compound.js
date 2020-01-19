import BaseFunction from "./BaseFunction";

class Compound extends BaseFunction {

    constructor(name = '') {
        super(name);
        this.dataIn = '';
        this.dataOut = '';
    }

    getDataIn() {
        return this.dataIn;
    }

    setDataIn(dataIn) {
        this.dataIn = dataIn;
    }

    getDataOut() {
        return this.dataOut;
    }

    setDataOut(dataOut) {
        this.dataOut = dataOut;
    }

}

export default Compound;