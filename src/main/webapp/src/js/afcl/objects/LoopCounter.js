class LoopCounter {

    static name = 'LoopCounter';

    constructor() {
        this.type = '';
        this.from = '';
        this.to = '';
        this.step = '';
    }

    getType() {
        return this.type;
    }

    setType(type) {
        this.type = type;
    }

    getFrom() {
        return this.from;
    }

    setFrom(from) {
        this.from = from;
    }

    getTo() {
        return this.to;
    }

    setTo(to) {
        this.to = to;
    }

    getStep() {
        return this.step;
    }

    setStep(step) {
        this.step = step;
    }
}

export default LoopCounter;