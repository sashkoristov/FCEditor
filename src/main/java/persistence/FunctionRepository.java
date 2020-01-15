package persistence;

import persistence.dto.Function;

public class FunctionRepository extends FileBasedRepository<Function> {

    public FunctionRepository(String fileName) {
        super(fileName);
    }

}
