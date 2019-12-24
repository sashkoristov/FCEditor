package persistence;

import java.util.Collection;

public class FunctionRepository extends FileBasedRepository<Function> {

    public FunctionRepository(String fileName) {
        super(fileName);
    }

}
