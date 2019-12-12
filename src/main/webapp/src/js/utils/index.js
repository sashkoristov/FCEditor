function jsonStringifyWithoutCircular(obj, depth = 4) {
    return JSON.stringify(
        obj,
        ( key, value) => {
            if((key === 'parent' || key == 'source' || key == 'target') && value !== null) {
                return value.id;
            } else if(key === 'value' && value !== null && value.localName) {
                let results = {};
                Object.keys(value.attributes).forEach(
                    (attrKey)=>{
                        const attribute = value.attributes[attrKey];
                        results[attribute.nodeName] = attribute.nodeValue;
                    }
                )
                return results;
            }
            return value;
        },
        depth
    );
}

export { jsonStringifyWithoutCircular }