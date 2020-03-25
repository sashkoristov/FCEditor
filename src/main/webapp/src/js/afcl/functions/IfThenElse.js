import Compound from './Compound';
import CompositeCondition from '../objects/CompositeCondition';

class IfThenElse extends Compound {

    constructor(name) {
        super(name);

        this.condition = new CompositeCondition();
    }

    getCondition() {
        return this.condition;
    }

    setCondition(condition) {
        this.condition = condition;
    }

}

export default IfThenElse;