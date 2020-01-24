class DataIns {
    constructor() {
        this.name = '';
        this.type = '';
        this.source = '';
        this.value = '';
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }

    getType() {
        return this.type;
    }

    setType(type) {
        this.type = type;
    }

    getSource() {
        return this.source;
    }

    setSource(source) {
        this.source = source;
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
    }
}

export default DataIns;