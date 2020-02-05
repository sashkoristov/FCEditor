class Workflow {
    constructor(name) {
        this.name = name;
        this.dataIns = [];
        this.dataOuts = [];
        this.body = null;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }

    getBody() {
        return this.body;
    }

    setBody(body) {
        this.body = body;
    }
}

export default Workflow;