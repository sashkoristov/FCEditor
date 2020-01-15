import BaseFunction from "./BaseFunction";

class Switch extends BaseFunction {

    constructor(name) {
        super(name);

        this.dataEval = null;
    }

    getDataEval() {
        return this.dataEval;
    }

    setDataEval(dataEval) {
        this.dataEval = dataEval;
    }

}

export default Switch;