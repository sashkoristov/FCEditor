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

    addProperty(property) {
        this.properties.push(property);
    }

    getProperty(index) {
        return this.properties[index];
    }

    getPropertyByName(name) {
        return this.properties.find(p => p.name == name);
    }

    setProperty(index, property) {
        this.properties[index] = property;
    }

    removeProperty(index) {
        this.properties = this.properties.filter((p, i) => index != i);
    }

    setProperties(properties) {
        this.properties = properties;
    }

    getConstraints() {
        return this.constraints;
    }

    addConstraint(cstr) {
        this.constraints.push(cstr);
    }

    getConstraint(index) {
        return this.constraints[index];
    }

    getConstraintByName(name) {
        return this.constraints.find(c => c.name == name);
    }

    setConstraint(index, constraint) {
        this.constraints[index] = constraint;
    }

    removeConstraint(index) {
        this.constraints = this.constraints.filter((c, i) => index != i);
    }

    setConstraints(constraints) {
        this.constraints = constraints;
    }

}

export default BaseFunction;