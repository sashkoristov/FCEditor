import DataItem from './DataItem';

class DataOuts extends DataItem {
    constructor() {
        super();

        this.passing = false;
        this.saveTo = '';
    }

    getSaveTo() {
        return this.saveTo;
    }

    setSaveTo(saveTo) {
        this.saveTo = saveTo;
    }

}

export default DataOuts;