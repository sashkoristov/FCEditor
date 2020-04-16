package service;

import afcl.Function;
import afcl.Workflow;
import afcl.functions.*;
import afcl.functions.objects.Case;
import afcl.functions.objects.Section;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class WorkflowAdaptationService {

    public static Workflow getAdaptedWorkflow(Workflow wf, Map<String, Integer> adaptationMap) {

        try {

        for (Map.Entry<String, Integer> e : adaptationMap.entrySet()) {
            Function fn = getFunctionWithName(wf, e.getKey());

            if (fn instanceof ParallelFor) {
                ParallelFor parFor = (ParallelFor)fn;
                Parallel par = new Parallel();
                par.setName("parallel_" + fn.getName());
                par.setParallelBody(new ArrayList());
                List<Function> parentList = getListContainingFunction(getParentObject(wf, fn), fn);

                for (int i = 0; i < e.getValue(); i++) {
                    Section s = new Section();
                    List<Function> fl = new ArrayList();
                    Function cloneFn = cloneFunction(fn);
                    cloneFn.setName(cloneFn.getName() + "_" + i);
                    fl.add(cloneFn);
                    s.setSection(fl);
                    par.getParallelBody().add(s);
                }

                int index = parentList.indexOf(fn);
                parentList.set(index, par);
            }
        }


        } catch (Exception e) {
            System.out.println(e);
        }

        return wf;
    }

    /**
     * Returns a deep copy of given Function
     *
     * @param fn
     * @return
     */
    public static Function cloneFunction(Function fn) {
        ObjectMapper om = new ObjectMapper();
        Function f = null;
        try {
            f = om.readValue(om.writeValueAsString(fn), fn.getClass());
        } catch (Exception e) {
            System.out.println("error cloning object");
        }
        return f;
    }

    /**
     * Returns the List which contains given Function by searching
     * AFCL structure of parent object (Workflow or Compound) recursively
     *
     * @param parentObj
     * @param fn
     * @return
     */
    public static List<Function> getListContainingFunction(Object parentObj, Function fn) {
        List<Function> parentList = null;
        if (parentObj instanceof Workflow) {
            parentList = ((Workflow)parentObj).getWorkflowBody();
        }
        if (parentObj instanceof IfThenElse) {
            IfThenElse iteParent = (IfThenElse)parentObj;
            if (iteParent.getThen().contains(fn)) {
                parentList = iteParent.getThen();
            }
            if (iteParent.getElse().contains(fn)) {
                parentList = iteParent.getElse();
            }
        }
        if (parentObj instanceof Switch) {
            Switch swParent = (Switch)parentObj;
            for (Case c : swParent.getCases()) {
                if (c.getFunctions().contains(fn)) {
                    parentList = c.getFunctions();
                    break;
                }
            }
        }
        if (parentObj instanceof Parallel) {
            Parallel parParent = ((Parallel)parentObj);
            for (Section s : parParent.getParallelBody()) {
                if (s.getSection().contains(fn)) {
                    parentList = s.getSection();
                    break;
                }
            }
        }
        if (parentObj instanceof ParallelFor) {
            parentList = ((ParallelFor)parentObj).getLoopBody();
        }
        return parentList;
    }

    /**
     * Returns the Parent Function object (Workflow or Compound)
     * which includes the given function in its structure
     *
     * @param wf
     * @param fn
     * @return
     */
    public static Object getParentObject(Workflow wf, Function fn) {
        return getParentObject(wf.getWorkflowBody(), fn, wf);
    }

    /**
     * Returns the Parent Function object (Workflow or Compound)
     * which includes the given function in its structure
     *
     * @param list
     * @param fn
     * @param currentParent
     * @return
     */
    public static Object getParentObject(List<Function> list, Function fn, Object currentParent) {
        for (Function f : list) {
            if (f.equals(fn)) {
                return currentParent;
            }
            Object foundFn = null;
            if (f instanceof IfThenElse) {
                foundFn = getParentObject(((IfThenElse)f).getThen(), fn, f);
                if (foundFn == null) {
                    foundFn = getParentObject(((IfThenElse)f).getElse(), fn, f);
                }
            }
            if (f instanceof Switch) {
                for (Case c : ((Switch)f).getCases()) {
                    foundFn = getParentObject(c.getFunctions(), fn, f);
                    if (!(foundFn == null)) { break; }
                }
            }
            if (f instanceof Parallel) {
                for (Section s : ((Parallel)f).getParallelBody()) {
                    foundFn = getParentObject(s.getSection(), fn, f);
                    if (!(foundFn == null)) { break; }
                }
            }
            if (f instanceof ParallelFor) {
                foundFn = getParentObject(((ParallelFor)f).getLoopBody(), fn, f);
            }
            if (!(foundFn == null)) {
                return f;
            }
        }
        return null;
    }

    /**
     * Returns the first found function which name matches the given name
     * by searching given workflow structure recursively
     *
     * @param wf
     * @param name
     * @return
     */
    public static Function getFunctionWithName(Workflow wf, String name) {
        return getFunctionWithName(wf.getWorkflowBody(), name);
    }

    /**
     * Returns the first found function which name matches the given name
     * by searching given list structure recursively
     *
     * @param list
     * @param name
     * @return
     */
    public static Function getFunctionWithName(List<Function> list, String name) {
        for (Function fn : list) {
            if (fn.getName() == null) {
                continue;
            }
            if (fn.getName().equals(name)) {
                return fn;
            }
            Function foundFn = null;
            if (fn instanceof IfThenElse) {
                foundFn = getFunctionWithName(((IfThenElse)fn).getThen(), name);
                if (foundFn == null) {
                    foundFn = getFunctionWithName(((IfThenElse)fn).getElse(), name);
                }
            }
            if (fn instanceof Switch) {
                for (Case c : ((Switch)fn).getCases()) {
                    foundFn = getFunctionWithName(c.getFunctions(), name);
                    if (!(foundFn == null)) { break; }
                }
            }
            if (fn instanceof Parallel) {
                for (Section s : ((Parallel)fn).getParallelBody()) {
                    foundFn = getFunctionWithName(s.getSection(), name);
                    if (!(foundFn == null)) { break; }
                }
            }
            if (fn instanceof ParallelFor) {
                foundFn = getFunctionWithName(((ParallelFor)fn).getLoopBody(), name);
            }
            if (!(foundFn == null)) {
                return foundFn;
            }
        }
        return null;
    }
}
