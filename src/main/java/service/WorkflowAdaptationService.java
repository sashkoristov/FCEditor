package service;

import afcl.Function;
import afcl.Workflow;
import afcl.functions.*;
import afcl.functions.objects.*;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class WorkflowAdaptationService {

    public static Workflow getAdaptedWorkflow(Workflow wf, Map<String, Integer> adaptationMap) {

        try {

        for (Map.Entry<String, Integer> e : adaptationMap.entrySet()) {
            Function fn = getFunctionWithName(wf, e.getKey());
            List<Function> parentList = getListContainingFunction(wf, fn);

            if (fn instanceof ParallelFor) {
                ParallelFor parFor = (ParallelFor)fn;
                List<Object> dataItemsUsed = getDataItemsWithSource(parFor, parentList.subList(parentList.indexOf(fn), parentList.size()));

                Parallel par = new Parallel();
                par.setName("parallel_" + fn.getName());
                par.setParallelBody(new ArrayList<>());
                par.setDataOuts(new ArrayList<>());

                // 1. move data ins from inner parallelFor to new parallel compound
                moveDataIns(parFor, par);

                // 2. data flow from parallel to inner parallelFor
                generateDataFlow(par, parFor, DataIns.class, DataIns.class, true);

                // 3. prepare dataOuts to collect all output data from inner parallelFor's
                DataOuts dataOuts = new DataOuts();
                dataOuts.setType("collection");
                dataOuts.setName("OutVal");
                String[] dataOutsSource = new String[e.getValue()];

                // 4. multiply parallelFor according to given input
                for (int i = 0; i < e.getValue(); i++) {
                    Section s = new Section();
                    List<Function> fl = new ArrayList<>();
                    ParallelFor cloneFn = cloneObject(parFor);
                    cloneFn.setName(cloneFn.getName() + "_" + i);
                    fl.add(cloneFn);
                    s.setSection(fl);
                    par.getParallelBody().add(s);
                    if (cloneFn.getDataOuts() != null && cloneFn.getDataOuts().size() > 0) {
                        dataOutsSource[i] = cloneFn.getName() + "/" + cloneFn.getDataOuts().get(0).getName();
                    }
                }

                // 5. set dataOuts of parallel compound
                dataOuts.setSource(String.join(",", dataOutsSource));
                par.getDataOuts().add(dataOuts);

                // 6. adjust all dataIns / dataOuts with the new source which have used dataIns / dataOuts of parallelFor before adaptation
                for (Object dataObj : dataItemsUsed) {
                    dataObj.getClass().getMethod("setSource", String.class).invoke(dataObj, par.getName() + "/" + dataOuts.getName());
                }

                int index = parentList.indexOf(fn);
                parentList.set(index, par);
            }
        }


        } catch (Exception e) {
            System.out.println("error while adapting workflow");
            System.out.println(e);
            e.printStackTrace();
        }

        return wf;
    }

    /**
     * moves dataIns from f1 to f2
     * @param f1
     * @param f2
     */
    public static void moveDataIns(Function f1, Function f2) {
        // since checking for correct type (compound or atomic) of f1 and f2
        // and their combinations check for the method to get/set dataIns/dataOuts using reflection
        try {
            Method getDataInsF1 = f1.getClass().getMethod("getDataIns");
            Method setDataInsF1 = f1.getClass().getMethod("setDataIns", List.class);
            Method setDataInsF2 = f2.getClass().getMethod("setDataIns", List.class);

            List<DataIns> dataInsF1 = (List<DataIns>)getDataInsF1.invoke(f1);
            setDataInsF2.invoke(f2, dataInsF1);
            setDataInsF1.invoke(f1, new ArrayList<>());
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException | ClassCastException e) {
            System.out.println("error moving dataIns");
            System.out.println(e);
        }
    }

    public static void generateDataFlow(Function f1, Function f2, Class sourcePort, Class targetPort, Boolean replace) {
        try {
            Method getDataF1 = f1.getClass().getMethod("get" + sourcePort.getSimpleName());

            Method getDataF2 = f2.getClass().getMethod("get" + targetPort.getSimpleName());
            Method setDataF2 = f2.getClass().getMethod("set" + targetPort.getSimpleName(), List.class);

            List dataF1 = (List<Object>)getDataF1.invoke(f1);
            List dataF2 = (List<Object>) getDataF2.invoke(f2);

            if (dataF1 != null) {
                if (replace) {
                    dataF2 = new ArrayList<>();
                }
                for (Object dataItem : dataF1) {
                    Object newDataItem = cloneObject(dataItem);
                    String dataItemName = (String)dataItem.getClass().getMethod("getName").invoke(dataItem);
                    String dataItemType = (String)dataItem.getClass().getMethod("getType").invoke(dataItem);
                    Boolean dataItemPassing = (Boolean)dataItem.getClass().getMethod("getPassing").invoke(dataItem);

                    newDataItem.getClass().getMethod("setSource", String.class).invoke(newDataItem, f1.getName() + "/" + dataItemName);
                    newDataItem.getClass().getMethod("setName", String.class).invoke(newDataItem, dataItemName);
                    newDataItem.getClass().getMethod("setType", String.class).invoke(newDataItem, dataItemType);
                    newDataItem.getClass().getMethod("setPassing", Boolean.class).invoke(newDataItem, dataItemPassing);

                    dataF2.add(newDataItem);
                }
            }

            setDataF2.invoke(f2, dataF2);

        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            System.out.println("error generating data flow");
            System.out.println(e);
        }
    }

    /**
     * Returns a deep copy of given Object
     *
     * @param obj
     * @return
     */
    public static <T extends Object> T cloneObject(Object obj) {
        ObjectMapper om = new ObjectMapper();
        T o = null;
        try {
            o = (T) om.readValue(om.writeValueAsString(obj), obj.getClass());
        } catch (Exception e) {
            System.out.println("error cloning object");
            System.out.println(e);
        }
        return o;
    }

    /**
     * Returns the List which contains given Function by searching
     * AFCL structure of parent object (Workflow or Compound) recursively
     *
     * @param wf
     * @param fn
     * @return
     */
    public static List<Function> getListContainingFunction(Workflow wf, Function fn) {
        Object parentObj = getParentObject(wf, fn);
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

    /**
     * returns a list containing all data items (dataIns / dataOuts) having given Function as source
     *
     * @param sourceFn
     * @param functionList
     *
     * @return
     */
    public static List<Object> getDataItemsWithSource(Function sourceFn, List<Function> functionList) {
        List<Object> currentList = new ArrayList<>();
        if (functionList == null) {
            return currentList;
        }
        for (Function functionItem : functionList) {
            if (functionItem instanceof AtomicFunction) {
                if (((AtomicFunction)functionItem).getDataIns() != null) {
                    for (DataIns dataIns : ((AtomicFunction) functionItem).getDataIns()) {
                        if (dataIns.getSource().contains(sourceFn.getName())) {
                            currentList.add(dataIns);
                        }
                    }
                }
            }
            if (functionItem instanceof Compound) {
                if (((Compound)functionItem).getDataIns() != null) {
                    for (DataIns dataIns : ((Compound) functionItem).getDataIns()) {
                        if (dataIns.getSource().contains(sourceFn.getName())) {
                            currentList.add(dataIns);
                        }
                    }
                }
                if (((Compound)functionItem).getDataOuts() != null) {
                    for (DataOuts dataOuts : ((Compound) functionItem).getDataOuts()) {
                        if (dataOuts.getSource().contains(sourceFn.getName())) {
                            currentList.add(dataOuts);
                        }
                    }
                }
            }
            if (functionItem instanceof IfThenElse) {
                currentList.addAll(getDataItemsWithSource(sourceFn, ((IfThenElse)functionItem).getThen()));
                currentList.addAll(getDataItemsWithSource(sourceFn, ((IfThenElse)functionItem).getElse()));
            }
            if (functionItem instanceof Switch) {
                for (Case c : ((Switch)functionItem).getCases()) {
                    currentList.addAll(getDataItemsWithSource(sourceFn, c.getFunctions()));
                }
            }
            if (functionItem instanceof Parallel) {
                for (Section s : ((Parallel)functionItem).getParallelBody()) {
                    currentList.addAll(getDataItemsWithSource(sourceFn, s.getSection()));
                }
            }
            if (functionItem instanceof ParallelFor) {
                currentList.addAll(getDataItemsWithSource(sourceFn, ((ParallelFor)functionItem).getLoopBody()));
            }
        }
        return currentList;
    }
}
