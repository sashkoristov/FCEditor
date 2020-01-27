import DataItem from './DataItem';

class DataIns extends DataItem {
    constructor() {
        super();

        this.passing = false;
        this.value = '';
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
    }
}

export default DataIns;