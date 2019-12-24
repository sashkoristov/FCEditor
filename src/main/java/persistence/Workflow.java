package persistence;

public class Workflow extends DomainObject {

    public String name;
    public String body;

    public Workflow(String id, String name, String body) {
        super(id);
        this.name = name;
        this.body = body;
    }
}
