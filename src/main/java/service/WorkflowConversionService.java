package service;

import afcl.Function;
import afcl.Workflow;
import afcl.functions.*;
import afcl.functions.objects.*;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

import javax.annotation.Nullable;
import javax.validation.constraints.Null;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.*;
import java.io.IOException;
import java.io.StringReader;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class WorkflowConversionService {

    /**
     * parses and converts given workflow xml structure to an afcl workflow
     *
     * @param xml
     * @return
     * @throws Exception
     */
    public static @Nullable Workflow fromGraphXml(String xml) throws Exception {

        Workflow w = new Workflow();

        try {
            Document doc = getDocumentFromXmlString(xml);

            Node workflowNode = getNode(doc, "/Workflow");
            if (workflowNode instanceof Element) {
                Element workflowEl = (Element)workflowNode;
                setPrimitiveFields(workflowEl, w);
                setCommonProperties(workflowEl, w);
            }

            Node startNode = getNode(doc, "/Workflow/*/Cell[@type='start']");
            List<Function> functions = generateFunctions(startNode, doc, null);

            w.setWorkflowBody(functions);

        } catch (Exception e) {
            throw new Exception("an internal error occured while parsing graph xml");
        }

        return w;
    }

    /**
     * generates a function list by starting at node n out of xml document doc, recursively
     *
     * @param n
     * @param doc
     * @param functionsList
     * @return
     * @throws Exception
     */
    protected static List<Function> generateFunctions(Node n, Document doc, List<Function> functionsList) throws Exception {
        if (functionsList == null) {
            functionsList = new ArrayList<>();
        }
        if (n != null && n.getNodeType() == Node.ELEMENT_NODE) {
            Element el = (Element) n;
            if (el.hasAttribute("vertex")) {
                Node edge = getNode(doc, "/Workflow/*/Cell[@source='" + el.getAttribute("id") + "']");
                NodeList edges = getNodes(doc, "/Workflow/*/Cell[@source='" + el.getAttribute("id") + "']");
                switch (el.getAttribute("type")) {
                    case "start":
                        generateFunctions(edge, doc, functionsList);
                        break;
                    case "AtomicFunction": {
                        Element fnEl = getDirectChild(el, "AtomicFunction");
                        AtomicFunction fn = generateAtomicFunction(fnEl);
                        functionsList.add(fn);
                        generateFunctions(edge, doc, functionsList);
                        break;
                    }
                    case "IfThenElse": {
                        Element iteEl = getDirectChild(el, "IfThenElse");
                        IfThenElse ite = generateIfThenElse(iteEl);
                        Node thenNode = getNode(doc, "/Workflow/*/Cell[@source='" + el.getAttribute("id") + "'][@value='then']");
                        ite.setThen(generateFunctions(thenNode, doc, null));
                        Node elseNode = getNode(doc, "/Workflow/*/Cell[@source='" + el.getAttribute("id") + "'][@value='else']");
                        ite.setElse(generateFunctions(elseNode, doc, null));
                        functionsList.add(ite);
                        // get next merge node and continue there
                        Node mergeNode = getNextNodeWithAttributeByFollowingEdges(el, "type", "merge");
                        if (mergeNode != null && mergeNode.getNodeType() == Node.ELEMENT_NODE) {
                            Element mergeEl = (Element) mergeNode;
                            Node outgoingEdgeOfMerge = getNode(doc, "/Workflow/*/Cell[@source='" + mergeEl.getAttribute("id") + "']");
                            generateFunctions(outgoingEdgeOfMerge, doc, functionsList);
                        }
                        break;
                    }
                    case "Switch": {
                        Element switchEl = getDirectChild(el, "Switch");
                        Switch sw = generateSwitch(switchEl);
                        // follow the edges
                        List<Case> cases = new ArrayList<>();
                        for (int i = 0; i < edges.getLength(); i++) {
                            Element caseEl = (Element) edges.item(i);
                            cases.add(new Case(caseEl.getAttribute("value"), generateFunctions(edges.item(i), doc, null)));
                        }
                        sw.setCases(cases);
                        functionsList.add(sw);
                        // get next merge node and continue there
                        Node mergeNode = getNextNodeWithAttributeByFollowingEdges(el, "type", "merge");
                        if (mergeNode != null && mergeNode.getNodeType() == Node.ELEMENT_NODE) {
                            Element mergeEl = (Element) mergeNode;
                            Node outgoingEdgeOfMerge = getNode(doc, "/Workflow/*/Cell[@source='" + mergeEl.getAttribute("id") + "']");
                            generateFunctions(outgoingEdgeOfMerge, doc, functionsList);
                        }
                        break;
                    }
                    case "Parallel": {
                        Element parEl = getDirectChild(el, "Parallel");
                        Parallel par = generateParallel(parEl);
                        List<Section> parallelSection = new ArrayList<>();

                        Element pForkEl = (Element) getNode(doc, "/Workflow/*/Cell[@parent='" + el.getAttribute("id") + "'][@type='fork']");
                        NodeList pForkEdges = getNodes(doc, "/Workflow/*/Cell[@source='" + pForkEl.getAttribute("id") + "']");
                        for (int i = 0; i < pForkEdges.getLength(); i++) {
                            parallelSection.add(new Section(generateFunctions(pForkEdges.item(i), doc, null)));
                        }
                        par.setParallelBody(parallelSection);
                        functionsList.add(par);
                        generateFunctions(edge, doc, functionsList);
                        break;
                    }
                    case "ParallelFor": {
                        Element parForEl = getDirectChild(el, "ParallelFor");
                        ParallelFor parFor = generateParallelFor(parForEl);

                        // get the start node of parallel loop body: the first node with no incoming edges
                        Element parForStartNode = null;
                        NodeList parForSubNodes = getNodes(doc, "/Workflow/*/Cell[@parent='" + el.getAttribute("id") + "']");
                        for (int i = 0; i < parForSubNodes.getLength(); i++) {
                            Element curEl = (Element) parForSubNodes.item(i);
                            NodeList incomingEdges = getNodes(doc, "/Workflow/*/Cell[@target='" + curEl.getAttribute("id") + "']");
                            if (incomingEdges.getLength() == 0) {
                                parForStartNode = curEl;
                                break;
                            }
                        }
                        if (parForStartNode != null) {
                            parFor.setLoopBody(generateFunctions(parForStartNode, doc, null));
                        }
                        functionsList.add(parFor);
                        generateFunctions(edge, doc, functionsList);
                        break;
                    }
                    case "fork": {
                        for (int i = 0; i < edges.getLength(); i++) {
                            generateFunctions(edges.item(i), doc, functionsList);
                        }
                        break;
                    }
                    case "merge":
                    case "join":
                    case "end":
                        return functionsList;

                }
            }
            if (el.hasAttribute("edge")) {
                Node t = getNode(doc, "/Workflow/*/Cell[@id='" + el.getAttribute("target") + "']");
                generateFunctions(t, doc, functionsList);
            }
        }
        return functionsList;
    }

    /**
     * returns the next found node in the xml structure which matches given attribute
     * by following the edge information in the xml structure recursively
     *
     * @param n
     * @param attrName
     * @param attrValue
     * @return
     */
    protected static @Nullable Node getNextNodeWithAttributeByFollowingEdges(Node n, String attrName, String attrValue) {
        if (n != null && n.getNodeType() == Node.ELEMENT_NODE) {
            Element curEl = (Element) n;
            if (curEl.getAttribute(attrName).equals(attrValue)) {
                return curEl;
            }
            try {
                Node edge = getNode(n.getOwnerDocument(), "/Workflow/*/Cell[@source='" + curEl.getAttribute("id") + "']");
                Element edgeEl = (Element) edge;
                Node t = getNode(n.getOwnerDocument(), "/Workflow/*/Cell[@id='" + edgeEl.getAttribute("target") + "']");
                return getNextNodeWithAttributeByFollowingEdges(t, attrName, attrValue);
            } catch (Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * sets primitive fields (string, integer, boolean) on afcl object using reflection
     * for each field given xml element is searched for a corresponding attribute
     *
     * @param fnEl
     * @param afclObj
     */
    protected static void setPrimitiveFields(Element fnEl, Object afclObj) {
        List<Field> primitiveFields = getAllDeclaredFields(new ArrayList<>(), afclObj.getClass());
        for (Field primitiveField : primitiveFields) {
            if (
                primitiveField.getType().equals(String.class) ||
                primitiveField.getType().equals(Integer.class) ||
                primitiveField.getType().equals(Boolean.class)
            ) {
                String value = fnEl.getAttribute(primitiveField.getName());
                if (!value.isEmpty()) {
                    try {
                        primitiveField.setAccessible(true);
                        primitiveField.set(afclObj, transformValue(value, primitiveField.getType()));
                    } catch (IllegalAccessException iae) {
                        System.out.println("Could not set primitive field " + primitiveField.getName() + " on " + afclObj.getClass().getName());
                    }
                }
            }
        }
    }

    /**
     * transforms xml string to target class type
     *
     * @param s
     * @param type
     * @return
     */
    protected static Object transformValue(String s, Class<?> type) {
        if (type.equals(Boolean.class))
            return s.equals("1") || s.toLowerCase().equals("true");
        if (type.equals(Integer.class))
            return Integer.parseInt(s);
        return s;
    }

    /**
     * sets constraints and properties as well as dataIns and dataOuts from xml structure
     * to given afcl object by using reflection
     *
     * @param fnEl
     * @param afclObj
     */
    protected static void setCommonProperties(Element fnEl, Object afclObj) {
        for (Node propNode = fnEl.getFirstChild(); propNode != null; propNode = propNode.getNextSibling()) {
            if (propNode instanceof Element) {
                Element propEl = (Element) propNode;
                Method setterMethod = null;
                Object setterArg = null;
                try {
                    switch (propEl.getAttribute("as")) {
                        case "constraints":
                        case "properties":
                            List<PropertyConstraint> pList = new ArrayList<>();
                            for (Node pNode = propNode.getFirstChild(); pNode != null; pNode = pNode.getNextSibling()) {
                                if (pNode.getNodeName().equals("Object") && pNode instanceof Element) {
                                    PropertyConstraint pc = new PropertyConstraint();
                                    setPrimitiveFields((Element) pNode, pc);
                                    pList.add(pc);
                                }
                            }
                            if (!pList.isEmpty()) {
                                setterMethod = afclObj.getClass().getMethod("set" + propEl.getAttribute("as").substring(0, 1).toUpperCase() + propEl.getAttribute("as").substring(1), List.class);
                                setterArg = pList;
                            }
                            break;
                        case "dataIns":
                            List<DataIns> dataInsList = new ArrayList<>();
                            for (Node dataInsNode = propNode.getFirstChild(); dataInsNode != null; dataInsNode = dataInsNode.getNextSibling()) {
                                if (dataInsNode.getNodeName().equals("DataIns") && dataInsNode instanceof Element) {
                                    dataInsList.add(generateDataIns((Element) dataInsNode));
                                }
                            }
                            if (!dataInsList.isEmpty()) {
                                setterMethod = afclObj.getClass().getMethod("setDataIns", List.class);
                                setterArg = dataInsList;
                            }
                            break;
                        case "dataOuts":
                            List<DataOuts> dataOutsList = new ArrayList<>();
                            for (Node dataOutsNode = propNode.getFirstChild(); dataOutsNode != null; dataOutsNode = dataOutsNode.getNextSibling()) {
                                if (dataOutsNode.getNodeName().equals("DataOuts") && dataOutsNode instanceof Element) {
                                    dataOutsList.add(generateDataOuts((Element) dataOutsNode));
                                }
                            }
                            if (!dataOutsList.isEmpty()) {
                                setterMethod = afclObj.getClass().getMethod("setDataOuts", List.class);
                                setterArg = dataOutsList;
                            }
                            break;
                    }
                    if (setterMethod != null) {
                        setterMethod.invoke(afclObj, setterArg);
                    }
                } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException ignored) {
                    System.out.println("could not call method " + setterMethod.getName() + " on object ");
                    System.out.println(afclObj);
                }
            }
        }
    }

    /**
     * converts xml element to an AtomicFunction instance
     *
     * @param fnEl
     * @return
     */
    protected static AtomicFunction generateAtomicFunction(Element fnEl) {
        AtomicFunction f = new AtomicFunction();
        setPrimitiveFields(fnEl, f);
        setCommonProperties(fnEl, f);
        return f;
    }

    /**
     * converts xml element to an IfThenElse a instance
     * @param iteEl
     * @return
     */
    protected static IfThenElse generateIfThenElse(Element iteEl) {
        IfThenElse ite = new IfThenElse();
        Element compCondEl = getDirectChild(iteEl, "CompositeCondition");
        if (compCondEl != null) {
            Condition compCond = new Condition();
            List<ACondition> conditionsList = new ArrayList<>();
            Node condNodesArray = getDirectChild(compCondEl, "Array");
            if (condNodesArray != null) {
                NodeList condNodes = condNodesArray.getChildNodes();
                for (int i = 0; i < condNodes.getLength(); i++) {
                    Node condNode = condNodes.item(i);
                    if (condNode instanceof Element) {
                        ACondition cond = new ACondition();
                        setPrimitiveFields((Element) condNode, cond);
                        conditionsList.add(cond);
                    }
                }
            }
            if (!conditionsList.isEmpty())
                compCond.setConditions(conditionsList);
            setPrimitiveFields(compCondEl, compCond);
            ite.setCondition(compCond);
        }
        setPrimitiveFields(iteEl, ite);
        setCommonProperties(iteEl, ite);
        return ite;
    }

    /**
     * converts xml element to a Switch instance
     *
     * @param switchEl
     * @return
     */
    protected static Switch generateSwitch(Element switchEl) {
        Switch sw = new Switch();
        Element dataEvalEl = getDirectChild(switchEl, "DataEval");
        if (dataEvalEl != null) {
            DataEval dataEval = new DataEval();
            setPrimitiveFields(dataEvalEl, dataEval);
            sw.setDataEval(dataEval);
        }
        setPrimitiveFields(switchEl, sw);
        setCommonProperties(switchEl, sw);
        return sw;
    }

    /**
     * converts xml element to a Parallel instance
     *
     * @param parEl
     * @return
     */
    protected static Parallel generateParallel(Element parEl) {
        Parallel par = new Parallel();
        setPrimitiveFields(parEl, par);
        setCommonProperties(parEl, par);
        return par;
    }

    /**
     * converts xml element to a ParallelFor instance
     *
     * @param parForEl
     * @return
     */
    protected static ParallelFor generateParallelFor(Element parForEl) {
        ParallelFor parFor = new ParallelFor();
        Element loopCounterEl = getDirectChild(parForEl, "LoopCounter");
        if (loopCounterEl != null) {
            LoopCounter loopCounter = new LoopCounter();
            setPrimitiveFields(loopCounterEl, loopCounter);
            parFor.setLoopCounter(loopCounter);
        }
        setPrimitiveFields(parForEl, parFor);
        setCommonProperties(parForEl, parFor);
        return parFor;
    }

    /**
     * converts xml element to a DataIns instance
     *
     * @param dataInsEl
     * @return
     */
    protected static DataIns generateDataIns(Element dataInsEl) {
        DataIns dataIns = new DataIns();
        setPrimitiveFields(dataInsEl, dataIns);
        setCommonProperties(dataInsEl, dataIns);
        return dataIns;
    }

    /**
     * converts xml element to a DataOuts instance
     *
     * @param dataOutsEl
     * @return
     */
    protected static DataOuts generateDataOuts(Element dataOutsEl) {
        DataOuts dataOuts = new DataOuts();
        setPrimitiveFields(dataOutsEl, dataOuts);
        setCommonProperties(dataOutsEl, dataOuts);
        return dataOuts;
    }

    /**
     * returns the first direct child with given tag name
     *
     * @param parent
     * @param tagName
     * @return
     */
    protected static Element getDirectChild(Element parent, String tagName) {
        for (Node child = parent.getFirstChild(); child != null; child = child.getNextSibling()) {
            if (child instanceof Element && tagName.equals(child.getNodeName())) return (Element) child;
        }
        return null;
    }

    /**
     * returns all nodes, which match given xPath expression
     *
     * @param doc
     * @param xPathExpr
     * @return
     * @throws XPathException
     */
    protected static NodeList getNodes(Document doc, String xPathExpr) throws XPathException {
        XPathFactory xPathFactory = XPathFactory.newInstance();
        XPath xPath = xPathFactory.newXPath();
        XPathExpression xPathExpression = xPath.compile(xPathExpr);

        return (NodeList) xPathExpression.evaluate(doc, XPathConstants.NODESET);
    }

    /**
     * returns the first node, which matches given xPath expression
     *
     * @param doc
     * @param xPathExpr
     * @return
     * @throws XPathException
     */
    protected static Node getNode(Document doc, String xPathExpr) throws XPathException {
        XPathFactory xPathFactory = XPathFactory.newInstance();
        XPath xPath = xPathFactory.newXPath();
        XPathExpression xPathExpression = xPath.compile(xPathExpr);

        return (Node) xPathExpression.evaluate(doc, XPathConstants.NODE);
    }

    /**
     * returns xml document from string
     *
     * @param xml
     * @return
     * @throws SAXException
     * @throws IOException
     * @throws ParserConfigurationException
     */
    protected static Document getDocumentFromXmlString(String xml) throws SAXException, IOException, ParserConfigurationException {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();

        return builder.parse(new InputSource(new StringReader(xml)));
    }

    /**
     * returns all declared fields of the given class type, including all inherited fields
     *
     * @param fields
     * @param type
     * @return
     */
    public static List<Field> getAllDeclaredFields(List<Field> fields, Class<?> type) {
        fields.addAll(Arrays.asList(type.getDeclaredFields()));

        if (type.getSuperclass() != null) {
            getAllDeclaredFields(fields, type.getSuperclass());
        }

        return fields;
    }

}
