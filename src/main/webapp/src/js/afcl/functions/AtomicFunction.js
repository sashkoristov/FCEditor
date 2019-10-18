import BaseFunction from './BaseFunction';

class AtomicFunction extends BaseFunction {

    constructor(label, type = null) {
        super(label);

        this._type = type;
    }

    getType() {
        return this._type;
    }


}

export default AtomicFunction;