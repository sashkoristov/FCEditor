package service;

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import javax.xml.parsers.*;
import javax.xml.xpath.*;

import afcl.functions.*;
import afcl.functions.objects.Section;
import org.xml.sax.InputSource;
import org.w3c.dom.*;

import afcl.*;

public class WorkflowConversionService {

    public static Workflow fromXml(String xml) {

        Workflow w = new Workflow();

        try {
            Document doc = getDocument(xml);

            Node startNode = getNode(doc, "/mxGraphModel/root/Cell[@type='start']");

            List<Function> functions = generateFunctions(startNode, doc, null);
            w.setWorkflowBody(functions);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return w;
    }

    public static String toXml(Workflow w) {
        return "";
    }

    protected static List<Function> generateFunctions(Node n, Document doc, List<Function> functionsList) throws Exception {
        if (functionsList == null) {
            functionsList = new ArrayList<>();
        }
        if (n.getNodeType() == Node.ELEMENT_NODE) {
            Element el = (Element)n;
            if (el.hasAttribute("vertex")) {
                System.out.println(el.getAttribute("type"));
                Node edge = getNode(doc, "/mxGraphModel/root/Cell[@source='" + el.getAttribute("id") + "']");
                NodeList edges = getNodes(doc, "/mxGraphModel/root/Cell[@source='" + el.getAttribute("id") + "']");
                switch (el.getAttribute("type")) {
                    case "start":
                        generateFunctions(edge, doc, functionsList);
                        break;
                    case "AtomicFunction":
                        Element fnEl = getDirectChild(el, "AtomicFunction");
                        AtomicFunction fn = generateAtomicFunction(fnEl);
                        functionsList.add(fn);
                        generateFunctions(edge, doc, functionsList);
                        break;
                    case "IfThenElse":
                        Element iteEl = (Element) getDirectChild(el,"IfThenElse");
                        IfThenElse ite = generateIfThenElse(iteEl);
                        Node thenNode = getNode(doc, "/mxGraphModel/root/Cell[@source='" + el.getAttribute("id") + "'][@value='then']");
                        ite.setThen(generateFunctions(thenNode, doc, null));
                        Node elseNode = getNode(doc, "/mxGraphModel/root/Cell[@source='" + el.getAttribute("id") + "'][@value='else']");
                        ite.setElse(generateFunctions(elseNode, doc, null));
                        functionsList.add(ite);
                        break;
                    case "Switch":
                        Element switchEl = (Element) getDirectChild(el, "Switch");
                        Switch sw = generateSwitch(switchEl);
                        // follow the edges
                        for (int i = 0; i < edges.getLength(); i++) {
                            //generateFunctions(edges.item(i), doc, functionsList);
                        }
                        functionsList.add(sw);
                        break;
                    case "Parallel":
                        Element parEl = (Element) getDirectChild(el, "Parallel");
                        Parallel par = generateParallel(parEl);
                        List<Section> parallelSection = new ArrayList<>();

                        Element pForkEl = (Element) getNode(doc, "/mxGraphModel/root/Cell[@parent='" + el.getAttribute("id") + "'][@type='fork']");
                        NodeList pForkEdges = getNodes(doc, "/mxGraphModel/root/Cell[@source='" + pForkEl.getAttribute("id") + "']");
                        for (int i = 0; i < pForkEdges.getLength(); i++) {
                            parallelSection.add(new Section(generateFunctions(pForkEdges.item(i), doc, null)));
                        }
                        par.setParallelBody(parallelSection);
                        functionsList.add(par);
                        break;
                    case "ParallelFor":
                        Element parForEl = (Element) getDirectChild(el, "ParallelFor");
                        ParallelFor parFor = generateParallelFor(parForEl);

                        Node forkNode = getNode(doc, "/mxGraphModel/root/Cell[@parent='" + el.getAttribute("id") + "'][@type='fork']");
                        parFor.setLoopBody(generateFunctions(forkNode, doc, null));
                        functionsList.add(parFor);
                        break;
                    case "fork":
                        for (int i = 0; i < edges.getLength(); i++) {
                            generateFunctions(edges.item(i), doc, functionsList);
                        }
                        break;
                    case "merge":
                    case "join":
                    case "end":
                        return functionsList;

                }
            }
            if (el.hasAttribute("edge")) {
                System.out.println("Following edge to target " + el.getAttribute("target"));
                Node t = getNode(doc, "/mxGraphModel/root/Cell[@id='" + el.getAttribute("target") + "']");
                generateFunctions(t, doc, functionsList);
            }
        } else {
            System.out.println("Node is not an element: ");
            System.out.println(n);
        }
        return functionsList;
    }

    protected static AtomicFunction generateAtomicFunction(Element fnEl) {
        AtomicFunction f = new AtomicFunction();
        f.setName(fnEl.getAttribute("label"));
        return f;
    }

    protected static IfThenElse generateIfThenElse(Element iteEl) {
        IfThenElse ite = new IfThenElse();
        return ite;
    }

    protected static Switch generateSwitch(Element switchEl) {
        Switch sw = new Switch();
        return sw;
    }

    protected static Parallel generateParallel(Element parEl) {
        Parallel par = new Parallel();
        return par;
    }

    protected static ParallelFor generateParallelFor(Element parForEl) {
        ParallelFor parFor = new ParallelFor();
        return parFor;
    }

    protected static Element getDirectChild(Element parent, String tagName)
    {
        for(Node child = parent.getFirstChild(); child != null; child = child.getNextSibling())
        {
            if(child instanceof Element && tagName.equals(child.getNodeName())) return (Element) child;
        }
        return null;
    }

    protected static NodeList getNodes(Document doc, String xPathExpr) throws XPathException {
        XPathFactory xPathFactory = XPathFactory.newInstance();
        XPath xPath = xPathFactory.newXPath();
        XPathExpression xPathExpression = xPath.compile(xPathExpr);

        return (NodeList) xPathExpression.evaluate(doc, XPathConstants.NODESET);
    }

    protected static Node getNode(Document doc, String xPathExpr) throws XPathException {
        XPathFactory xPathFactory = XPathFactory.newInstance();
        XPath xPath = xPathFactory.newXPath();
        XPathExpression xPathExpression = xPath.compile(xPathExpr);

        return (Node) xPathExpression.evaluate(doc, XPathConstants.NODE);
    }

    protected static Document getDocument(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();

        return builder.parse(new InputSource(new StringReader(xml)));
    }

}
