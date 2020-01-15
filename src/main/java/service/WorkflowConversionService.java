package service;

import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.xml.parsers.*;
import javax.xml.xpath.*;

import afcl.functions.AtomicFunction;
import afcl.functions.IfThenElse;
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
                switch (el.getAttribute("type")) {
                    case "start":
                        System.out.println("Start");
                        Node edge = getNode(doc, "/mxGraphModel/root/Cell[@source='" + el.getAttribute("id") + "']");
                        generateFunctions(edge, doc, functionsList);
                        break;
                    case "AtomicFunction":
                        System.out.println("AtomicFunction");
                        Element fnEl = getDirectChild(el, "AtomicFunction");
                        AtomicFunction f = generateAtomicFunction(fnEl);
                        functionsList.add(f);
                        // follow the edges
                        NodeList edges = getNodes(doc, "/mxGraphModel/root/Cell[@source='" + el.getAttribute("id") + "']");
                        for (int i = 0; i < edges.getLength(); i++) {
                           generateFunctions(edges.item(i), doc, functionsList);
                        }
                        break;
                    case "IfThenElse":
                        System.out.println("IfThenElse");
                        Element iteEl = (Element) getDirectChild(el,"IfThenElse");
                        IfThenElse ite = generateIfThenElse(iteEl);
                        functionsList.add(ite);

                        Node thenNode = getNode(doc, "/mxGraphModel/root/Cell[@source='" + el.getAttribute("id") + "'][@value='then']");
                        ite.setThen(generateFunctions(thenNode, thenNode.getOwnerDocument(), null));
                        Node elseNode = getNode(doc, "/mxGraphModel/root/Cell[@source='" + el.getAttribute("id") + "'][@value='else']");
                        ite.setElse(generateFunctions(elseNode, elseNode.getOwnerDocument(), null));
                        break;
                    case "Switch":
                    case "merge":
                    case "join":
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