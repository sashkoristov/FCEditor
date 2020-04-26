import Compound from './Compound';
import LoopCounter from '../objects/LoopCounter';

class ParallelFor extends Compound {

    static name = 'ParallelFor';

    constructor(name) {
        super(name);

        this.loopCounter = new LoopCounter();
    }

    getLoopCounter() {
        return this.loopCounter;
    }

    setLoopCount(loopCounter) {
        this.loopCounter = loopCounter;
    }

}

export default ParallelFor;