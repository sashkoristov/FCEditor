import BaseFunction from './BaseFunction';

class AtomicFunction extends BaseFunction {

    constructor(label, type = null) {
        super(label);

        this.type = type;
    }

    getType() {
        return this.type;
    }


}

export default AtomicFunction;