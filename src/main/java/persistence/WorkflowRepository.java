package persistence;

import persistence.dto.Workflow;

public class WorkflowRepository extends FileBasedRepository<Workflow> {

    public WorkflowRepository(String filePath) {
        super(filePath);
    }
}
