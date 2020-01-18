import BaseFunction from "./BaseFunction";

class IfThenElse extends BaseFunction {

    constructor(name) {
        super(name);

        this.condition = '';
    }

    getCondition() {
        return this.condition;
    }

    setCondition(condition) {
        this.condition = condition;
    }

}

export default IfThenElse;