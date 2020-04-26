class CompositeCondition {

    static name = 'CompositeCondition';

    constructor() {
        this.combinedWith = '';
        this.conditions = [];
    }

    getCombinedWith() {
        return this.combinedWith;
    }

    setCombinedWith(combinedWith) {
        this.combinedWith = combinedWith;
    }

    getConditions() {
        return this.conditions;
    }

    addCondition(condition) {
        this.conditions.push(condition);
    }

    removeCondition(index) {
        delete this.conditions[index];
    }

    setConditions(conditions) {
        this.conditions = conditions;
    }

}

export default CompositeCondition;