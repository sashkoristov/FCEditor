import Compound from "./Compound";

class ParallelFor extends Compound {

    constructor(name) {
        super(name);

        this.loopCount = 0;
    }

    getLoopCount() {
        return loopCount;
    }

    setLoopCount(loopCount) {
        this.loopCount = loopCount;
    }

}

export default ParallelFor;