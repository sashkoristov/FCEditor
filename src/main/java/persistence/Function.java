package persistence;

import java.io.Serializable;

public class Function extends DomainObject {

    public String name;

    public Function(String id, String name) {
        super(id);
        this.name = name;
    }
}