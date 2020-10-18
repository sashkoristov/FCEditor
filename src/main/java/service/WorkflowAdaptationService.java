package service;

import afcl.Function;
import afcl.Workflow;
import afcl.functions.*;
import afcl.functions.objects.*;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.annotation.Nullable;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.BiConsumer;

public class WorkflowAdaptationService {

    /**
     *
     * @param wf
     * @param adaptations
     * @return
     *
     */
    public static @Nullable
    Workflow getAdaptedWorkflow(Workflow wf, Map<String, List> adaptations) {

        try {

            for (Map.Entry<String, List> e : adaptations.entrySet()) {

                int numberOfDivides = e.getValue().size();

                Function fn = getFunctionByName(wf, e.getKey());

                if (fn instanceof ParallelFor) {
                    ParallelFor parFor = (ParallelFor) fn;
                    List<Function> parentList = getListContainingFunction(wf, parFor);
                    List<Object> dataItemsUsed = getDataItemsBySource(parFor, parentList.subList(parentList.indexOf(parFor), parentList.size()));

                    // 1. create a new parallel compound
                    Parallel par = new Parallel();
                    par.setName("parallelized_" + fn.getName());
                    par.setParallelBody(new ArrayList<>());
                    par.setDataIns(new ArrayList<>());
                    par.setDataOuts(new ArrayList<>());

                    // 2. replace parallelFor with our new parallel compound
                    parentList.set(parentList.indexOf(parFor), par);

                    // 3. move data ins from parallelFor to new parallel compound
                    moveDataItems(parFor, par, DataIns.class);

                    // 4. data flow from parallel to (inner) parallelFor
                    generateDataFlow(par, parFor, DataIns.class, DataIns.class, true);

                    // 5. prepare dataOuts to collect all output data from inner parallelFor's
                    DataOuts dataOuts = new DataOuts();
                    dataOuts.setType("collection");
                    dataOuts.setName("OutVal");
                    dataOuts.setConstraints(Collections.singletonList(new PropertyConstraint("aggregation", "+")));
                    String[] dataOutsSource = new String[numberOfDivides];

                    // 6. multiply parallelFor according to given input
                    int iterationsOffset = 0;
                    for (int i = 0; i < numberOfDivides; i++) {
                        Section s = new Section();
                        List<Function> fl = new ArrayList<>();
                        ParallelFor cloneFn = cloneObject(parFor);

                        // set loop counter according to input
                        if (cloneFn.getLoopCounter() == null) {
                            cloneFn.setLoopCounter(new LoopCounter());
                        }
                        Map<String, Integer> loopCounterInfo = (Map) e.getValue().get(i);
                        cloneFn.getLoopCounter().setFrom(loopCounterInfo.get("from").toString());
                        cloneFn.getLoopCounter().setTo(loopCounterInfo.get("to").toString());
                        cloneFn.getLoopCounter().setStep(loopCounterInfo.get("step").toString());
                        int iterations = getTotalIterations(cloneFn.getLoopCounter());

                        if (cloneFn.getDataIns() != null) {
                            for (DataIns dataIns : cloneFn.getDataIns()) {
                                if (!dataIns.getType().equals("collection") || dataIns.getConstraints() == null) {
                                    continue;
                                }
                                PropertyConstraint distribution =
                                        getPropertyConstraintByName(dataIns.getConstraints(), "distribution");
                                if (distribution == null || !distribution.getValue().contains("BLOCK")) {
                                    continue;
                                }
                                int blockSize = Integer.parseInt(distribution.getValue().replaceAll("[^0-9?!.]", ""));

                                // assign a subset of the collection to the current loop by using an element-index
                                // constraint, note that we assume that the collection size is blockSize*iterations
                                int startIndex = iterationsOffset * blockSize;
                                int endIndex = startIndex + iterations * blockSize - 1;
                                String elementIndexExpr = startIndex != endIndex
                                        ? startIndex + ":" + endIndex
                                        : String.valueOf(startIndex);
                                dataIns.getConstraints().add(new PropertyConstraint("element-index", elementIndexExpr));
                            }
                        }
                        iterationsOffset += iterations;

                        fl.add(cloneFn);
                        s.setSection(fl);
                        par.getParallelBody().add(s);

                        // rename all functions in that inner branch (including parallelFor)
                        final int idx = i;
                        traverseFunctions(fl, (fx, parent) -> renameFunction(wf, fx, fx.getName() + "_" + idx));

                        // add the output data to the output data collection of the new parallel
                        if (cloneFn.getDataOuts() != null && cloneFn.getDataOuts().size() > 0) {
                            dataOutsSource[i] = cloneFn.getName() + "/" + cloneFn.getDataOuts().get(0).getName();
                        }
                    }

                    // 7. set dataOuts of parallel compound
                    dataOuts.setSource(String.join(",", dataOutsSource));
                    par.getDataOuts().add(dataOuts);

                    // 8. adjust all dataIns / dataOuts with the new source which have used dataIns / dataOuts of parallelFor before adaptation
                    for (Object dataObj : dataItemsUsed) {
                        dataObj.getClass().getMethod("setSource", String.class).invoke(dataObj, par.getName() + "/" + dataOuts.getName());
                    }

                    // 9. clear properties and constraints of new parallel compound dataIns
                    if (par.getDataIns() != null) {
                        par.getDataIns().forEach(dataIns -> {
                            dataIns.setConstraints(new ArrayList<>());
                            dataIns.setProperties(new ArrayList<>());
                        });
                    }
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
     * traverses functions in the workflow recursively and applies consumer on each of it
     *
     * @param wf
     * @param consumer
     */
    public static void traverseWorkflow(Workflow wf, BiConsumer<Function, Object> consumer) {
        traverseFunctions(wf.getWorkflowBody(), consumer, wf);
    }

    public static void traverseFunctions(List<Function> functionsList, BiConsumer<Function, Object> consumer) {
        traverseFunctions(functionsList, consumer, null);
    }

    /**
     * traverses functions in the list recursively and applies consumer on each of it
     *
     * @param functionsList
     * @param consumer
     */
    public static void traverseFunctions(List<Function> functionsList, BiConsumer<Function, Object> consumer, Object currentParent) {
        if (functionsList == null) {
            return;
        }
        for (Function fn : functionsList) {
            consumer.accept(fn, currentParent);
            if (fn instanceof IfThenElse) {
                traverseFunctions(((IfThenElse) fn).getThen(), consumer, fn);
                traverseFunctions(((IfThenElse) fn).getElse(), consumer, fn);
            }
            if (fn instanceof Switch) {
                for (Case c : ((Switch) fn).getCases()) {
                    traverseFunctions(c.getFunctions(), consumer, fn);
                }
            }
            if (fn instanceof Parallel) {
                for (Section s : ((Parallel) fn).getParallelBody()) {
                    traverseFunctions(s.getSection(), consumer, fn);
                }
            }
            if (fn instanceof ParallelFor) {
                traverseFunctions(((ParallelFor) fn).getLoopBody(), consumer, fn);
            }
        }
    }

    /**
     * moves dataIns from f1 at port to f2 at port
     *
     * @param f1
     * @param f2
     */
    public static void moveDataItems(Function f1, Function f2, Class port) {
        // since checking for correct type (compound or atomic) of f1 and f2
        // and their combinations check for the method to get/set dataIns/dataOuts using reflection
        try {
            Method getDataF1 = f1.getClass().getMethod("get" + port.getSimpleName());
            Method setDataF1 = f1.getClass().getMethod("set" + port.getSimpleName(), List.class);
            Method setDataF2 = f2.getClass().getMethod("set" + port.getSimpleName(), List.class);

            List<DataIns> dataInsF1 = (List<DataIns>) getDataF1.invoke(f1);
            setDataF2.invoke(f2, dataInsF1);
            setDataF1.invoke(f1, new ArrayList<>());
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException | ClassCastException e) {
            System.out.println("error moving data items");
            System.out.println(e);
        }
    }

    /**
     * generates data flow from f1 to f2, according to given ports (dataIns or dataOuts)
     *
     * @param f1
     * @param f2
     * @param sourcePort
     * @param targetPort
     * @param replace
     */
    public static void generateDataFlow(Function f1, Function f2, Class sourcePort, Class targetPort, Boolean replace) {
        try {
            Method getDataF1 = f1.getClass().getMethod("get" + sourcePort.getSimpleName());

            Method getDataF2 = f2.getClass().getMethod("get" + targetPort.getSimpleName());
            Method setDataF2 = f2.getClass().getMethod("set" + targetPort.getSimpleName(), List.class);

            List dataF1 = (List<Object>) getDataF1.invoke(f1);
            List dataF2 = (List<Object>) getDataF2.invoke(f2);

            if (dataF1 != null) {
                if (replace) {
                    dataF2 = new ArrayList<>();
                }
                for (Object dataItem : dataF1) {
                    Object newDataItem = cloneObject(dataItem);
                    String dataItemName = (String) dataItem.getClass().getMethod("getName").invoke(dataItem);
                    String dataItemType = (String) dataItem.getClass().getMethod("getType").invoke(dataItem);
                    Boolean dataItemPassing = (Boolean) dataItem.getClass().getMethod("getPassing").invoke(dataItem);

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

    public static List<Function> getListContainingFunction(Workflow wf, Function fn) {
        return getListContainingFunction(wf, fn, null);
    }

    /**
     * Returns the List which contains given Function by searching
     * parent object (Workflow or Compound) recursively and returning corresponding sub list
     *
     * @param wf
     * @param fn
     * @return
     */
    public static List<Function> getListContainingFunction(Workflow wf, Function fn, Object parentObj) {
        if (parentObj == null) {
            parentObj = getParentObject(wf, fn);
        }
        List<Function> parentList = null;
        if (parentObj instanceof Workflow) {
            parentList = ((Workflow) parentObj).getWorkflowBody();
        }
        if (parentObj instanceof IfThenElse) {
            IfThenElse iteParent = (IfThenElse) parentObj;
            if (iteParent.getThen().contains(fn)) {
                parentList = iteParent.getThen();
            }
            if (iteParent.getElse().contains(fn)) {
                parentList = iteParent.getElse();
            }
        }
        if (parentObj instanceof Switch) {
            Switch swParent = (Switch) parentObj;
            for (Case c : swParent.getCases()) {
                if (c.getFunctions().contains(fn)) {
                    parentList = c.getFunctions();
                    break;
                }
            }
        }
        if (parentObj instanceof Parallel) {
            Parallel parParent = ((Parallel) parentObj);
            for (Section s : parParent.getParallelBody()) {
                if (s.getSection().contains(fn)) {
                    parentList = s.getSection();
                    break;
                }
            }
        }
        if (parentObj instanceof ParallelFor) {
            parentList = ((ParallelFor) parentObj).getLoopBody();
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
        AtomicReference<Object> parentObjRef = new AtomicReference<>(currentParent);
        traverseFunctions(list, (functionItem, parentObj) -> {
            if (functionItem.equals(fn)) {
                parentObjRef.set(parentObj);
            }
        }, currentParent);
        return parentObjRef.get();
    }

    /**
     * Returns the first found function which name matches the given name
     * by searching given workflow structure recursively
     *
     * @param wf
     * @param name
     * @return
     */
    public static Function getFunctionByName(Workflow wf, String name) {
        return getFunctionByName(wf.getWorkflowBody(), name);
    }

    /**
     * Returns the first found function which name matches the given name
     * by searching given list structure recursively
     *
     * @param list
     * @param name
     * @return
     */
    public static Function getFunctionByName(List<Function> list, String name) {
        final AtomicReference<Function> foundFnRef = new AtomicReference<>();
        traverseFunctions(list, (fn, parentObj) -> {
            if (fn.getName() != null && fn.getName().equals(name)) {
                foundFnRef.set(fn);
            }
        });
        return foundFnRef.get();
    }

    /**
     * returns a list containing all data items (dataIns / dataOuts) having given Function as source
     *
     * @param sourceFn
     * @param functionList
     * @return
     */
    public static List<Object> getDataItemsBySource(Function sourceFn, List<Function> functionList) {
        List<Object> currentList = new ArrayList<>();
        if (functionList == null) {
            return currentList;
        }
        traverseFunctions(functionList, (functionItem, parentObj) -> {
            try {
                if (functionItem instanceof AtomicFunction) {
                    if (((AtomicFunction) functionItem).getDataIns() != null) {
                        for (DataIns dataIns : ((AtomicFunction) functionItem).getDataIns()) {
                            if (dataIns.getSource().startsWith(sourceFn.getName() + "/")) {
                                currentList.add(dataIns);
                            }
                        }
                    }
                }
                if (functionItem instanceof Compound) {
                    if (((Compound) functionItem).getDataIns() != null) {
                        for (DataIns dataIns : ((Compound) functionItem).getDataIns()) {
                            if (dataIns.getSource().startsWith(sourceFn.getName() + "/")) {
                                currentList.add(dataIns);
                            }
                        }
                    }
                    if (((Compound) functionItem).getDataOuts() != null) {
                        for (DataOuts dataOuts : ((Compound) functionItem).getDataOuts()) {
                            if (dataOuts.getSource().startsWith(sourceFn.getName() + "/")) {
                                currentList.add(dataOuts);
                            }
                        }
                    }
                }
            } catch (NullPointerException npe ) {}
        });
        return currentList;
    }

    /**
     * renames given function and updates all dataIns / dataOuts where that function was used as source
     *
     * @param wf
     * @param fn
     * @param newName
     */
    public static void renameFunction(Workflow wf, Function fn, String newName) {
        String oldName = fn.getName();
        Object parentObj = getParentObject(wf, fn);
        List<Function> remainingList = new ArrayList<>();
        if (parentObj instanceof Function) {
            remainingList.add((Function) parentObj);
        }
        List<Object> usedDataItems = getDataItemsBySource(fn, remainingList);
        fn.setName(newName);
        try {
            for (Object dataObj : usedDataItems) {
                String oldSource = (String) dataObj.getClass().getMethod("getSource").invoke(dataObj);
                dataObj.getClass().getMethod("setSource", String.class).invoke(dataObj, oldSource.replace(oldName, newName));
            }
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
        }
    }

    /**
     * Returns the total number of iterations of the given loop counter.
     *
     * @param loopCounter the loop counter
     * @return the total number of iterations
     */
    protected static int getTotalIterations(LoopCounter loopCounter) {
        int fromInclusive = Integer.parseInt(loopCounter.getFrom());
        int toExclusive = Integer.parseInt(loopCounter.getTo());

        if (fromInclusive >= toExclusive) {
            return 0;
        }

        int step = Integer.parseInt(loopCounter.getStep());
        if (step <= 0) {
            throw new IllegalArgumentException("Endless loop counter");
        }

        return (toExclusive - 1 - fromInclusive + step) / step;
    }

    /**
     * Returns the first property constraint with the given name or {@code null} if it does not exist.
     *
     * @param propertyConstraints the property constraints
     * @param name                the name of the property constraint to be searched for
     * @return the first property constraint with the given name or {@code null} if it does not exist
     */
    protected static PropertyConstraint getPropertyConstraintByName(List<PropertyConstraint> propertyConstraints, String name) {
        return propertyConstraints
                .stream()
                .filter(x -> x.getName().equals(name))
                .findFirst()
                .orElse(null);
    }
}
