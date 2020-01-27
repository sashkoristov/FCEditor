class BaseFunction {

    constructor(name = '') {
        this.name = name;
        this.properties = [];
        this.constraints = [];
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
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

export default BaseFunction;