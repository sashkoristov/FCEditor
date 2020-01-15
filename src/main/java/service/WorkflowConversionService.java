package service;

import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import javax.xml.parsers.*;
import javax.xml.xpath.*;

import afcl.functions.AtomicFunction;
import afcl.functions.IfThenElse;
import org.xml.sax.InputSource;
import org.w3c.dom.*;

import afcl.*;

public class WorkflowConversionService {

    static ArrayList<Function> workflowBody = new ArrayList();

    public static Workflow fromXml(String xml) {

        workflowBody.clear();

        try {
            Document doc = getDocument(xml);

            Node startNode = getNode(doc, "/mxGraphModel/root/Cell[@type='start']");

            processNode(startNode, doc);

        } catch (Exception e) {
            e.printStackTrace();
        }

        Workflow w = new Workflow();
        w.setWorkflowBody(workflowBody);

        return w;
    }

    public static String toXml(Workflow w) {
        return "";
    }

    protected static void processNode(Node n, Document doc) throws Exception {
        if (n.getNodeType() == Node.ELEMENT_NODE) {
            Element el = (Element)n;
            if (el.hasAttribute("vertex")) {
                switch (el.getAttribute("type")) {
                    case "start":
                        System.out.println("Start");
                    case "AtomicFunction":
                        Element fnEl = (Element) el.getElementsByTagName("AtomicFunction").item(0);
                        AtomicFunction f = generateAtomicFunction(fnEl);
                        workflowBody.add(f);
                        // follow the edges
                        NodeList edges = getNodes(doc, "/mxGraphModel/root/Cell[@source='" + el.getAttribute("id") + "']");
                        for (int i = 0; i < edges.getLength(); i++) {
                            processNode(edges.item(i), doc);
                        }
                    case "IfThenElse":
                        Element iteEl = (Element) el.getElementsByTagName("IfThenElse").item(0);
                        IfThenElse ite = generateIfThenElse(iteEl);
                    case "Switch":
                    case "merge":
                }
            }
            if (el.hasAttribute("edge")) {
                System.out.println("Following edge to target " + el.getAttribute("target"));
                Node t = getNode(doc, "/mxGraphModel/root/Cell[@id='" + el.getAttribute("target") + "']");
                processNode(t, doc);
            }
        } else {
            System.out.println("Node is not an element: ");
            System.out.println(n);
        }
    }

    protected static AtomicFunction generateAtomicFunction(Element fnEl) {
        AtomicFunction f = new AtomicFunction();
        f.setName(fnEl.getAttribute("name"));
        return f;
    }

    protected static AtomicFunction generateIfThenElse(Element iteEl) {
        IfThenElse ite = new IfThenElse();
        Node thenNode = getNode(iteEl.getOwnerDocument(), "/mxGraphModel/root/Cell[@source='" + iteEl.getAttribute("id") + "'][@value='then']");

        return f;
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
