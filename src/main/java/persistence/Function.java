package persistence;

import java.io.Serializable;

public class Function implements Serializable {

    public String name;
    public String id;

    public Function(String id, String name) {
        this.id = id;
        this.name = name;
    }
}