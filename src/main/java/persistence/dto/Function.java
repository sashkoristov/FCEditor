package persistence.dto;

import persistence.DomainObject;

public class Function extends DomainObject {

    public String name;
    public String type;
    public String provider;
    public String url;

    public Function(String id, String name) {
        super(id);
        this.name = name;
    }
}