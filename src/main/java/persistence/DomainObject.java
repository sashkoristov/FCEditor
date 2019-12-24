package persistence;

import java.io.Serializable;

public class DomainObject implements Serializable {
    public String id;

    public DomainObject(String id) {
        this.id = id;
    }
}
