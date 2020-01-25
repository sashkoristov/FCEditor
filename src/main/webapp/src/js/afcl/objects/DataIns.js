class DataIns {
    constructor() {
        this.name = '';
        this.type = '';
        this.source = '';
        this.value = '';
        this.properties = [];
        this.constraints = [];
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

    getProperties() {
        return this.properties;
    }

    addProperty(name, value) {
        this.properties.push({
            name: name,
            value: value
        });
    }

    getProperty(name) {
        return this.properties.find(p => p.name == name);
    }

    setProperty(index, property) {
        this.properties[index] = property;
    }

    removeProperty(index) {
        delete this.properties[index];
    }

    setProperties(properties) {
        this.properties = properties;
    }

    getConstraints() {
        return this.constraints;
    }

    addConstraint(name, value) {
        this.constraints.push({
            name: name,
            value: value
        });
    }

    getConstraint(name) {
        return this.constraints.find(c => c.name == name);
    }

    setConstraint(index, constraint) {
        this.constraints[index] = constraint;
    }

    removeConstraint(index) {
        delete this.constraints[index];
    }

    setConstraints(constraints) {
        this.constraints = constraints;
    }
}

export default DataIns;