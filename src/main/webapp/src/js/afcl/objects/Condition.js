class Condition {
    constructor() {
        this.data1 = '';
        this.data2 = '';
        this.operator = '';
        this.negation = false;
    }

    getData1() {
        return this.data1;
    }

    setData1(data1) {
        this.data1 = data1;
    }

    getData2() {
        return this.data2;
    }

    setData2(data2) {
        this.data2 = data2;
    }

    getOperator() {
        return this.operator;
    }

    setOperator(operator) {
        this.operator = operator;
    }

    getNegation() {
        return this.negation;
    }

    setNegation(negation) {
        this.negation = negation;
    }
}

export default Condition;