import BaseFunction from './BaseFunction';

class AtomicFunction extends BaseFunction {

    constructor(name, type = null) {
        super(name);

        this.type = type;
        this.dataIn = '';
        this.dataOut = '';
    }

    getType() {
        return this.type;
    }

    setType(type) {
        this.type = type;
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

export default AtomicFunction;