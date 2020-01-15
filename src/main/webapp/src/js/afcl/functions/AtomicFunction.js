import BaseFunction from './BaseFunction';

class AtomicFunction extends BaseFunction {

    constructor(name, type = null) {
        super(name);

        this.type = type;
    }

    getType() {
        return this.type;
    }

    setType(type) {
        this.type = type;
    }


}

export default AtomicFunction;