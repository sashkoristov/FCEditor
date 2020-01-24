import BaseFunction from './functions/BaseFunction';
import AtomicFunction from './functions/AtomicFunction';
import IfThenElse from './functions/IfThenElse';
import Switch from './functions/Switch';
import Compound from './functions/Compound';
import Parallel from './functions/Parallel';
import ParallelFor from './functions/ParallelFor';

let functions = {
    BaseFunction,
    AtomicFunction,
    IfThenElse,
    Switch,
    Compound,
    Parallel,
    ParallelFor,
};

import DataIns from './objects/DataIns';
import DataOuts from './objects/DataOuts';

let objects = {
    DataIns,
    DataOuts,
};

let types = {
    void: 'None',
    bool: 'Boolean',
    number: 'Number',
    string: 'String',
    collection: 'Collection'
};

export { functions, objects, types };
