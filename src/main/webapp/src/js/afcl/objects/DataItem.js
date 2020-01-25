class DataItem {
    constructor() {

        if (new.target === DataItem) {
          throw new TypeError('Cannot construct abstract DataItem instances directly');
        }

        this.name = '';
        this.type = '';
        this.source = '';
        this.passing = false;
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

    getPassing() {
        return this.passing;
    }

    setPassing(passing) {
        this.passing = passing;
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

export default DataItem;