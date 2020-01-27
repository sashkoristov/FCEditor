import BaseFunction from "./BaseFunction";
import DataEval from "../objects/DataEval";

class Switch extends BaseFunction {

    constructor(name) {
        super(name);

        this.dataEval = new DataEval();
    }

    getDataEval() {
        return this.dataEval;
    }

    setDataEval(dataEval) {
        this.dataEval = dataEval;
    }

}

export default Switch;