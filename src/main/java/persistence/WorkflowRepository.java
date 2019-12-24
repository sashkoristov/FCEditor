package persistence;

public class WorkflowRepository extends FileBasedRepository<Workflow> {

    public WorkflowRepository(String filePath) {
        super(filePath);
    }
}
