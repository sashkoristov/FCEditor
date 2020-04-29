package servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLGenerator;

import persistence.*;
import service.*;

@WebServlet(name = "Api", urlPatterns = { "/api/*" })
public class Api extends HttpServlet {

    private Repository<persistence.dto.Function> functionRepository = new FunctionRepository("functions.ser");

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        String pathInfo = req.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")){

            sendResponseText(resp, "ACFL Toolkit API", HttpServletResponse.SC_OK);
            return;
        }

        if (pathInfo.equals("/function")) {
            sendResponseJson(resp, functionRepository.findAll());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        String[] pathSegments = pathInfo.split("/");
        ObjectMapper om = new ObjectMapper();
        YAMLFactory yf = new YAMLFactory();
        yf.disable(YAMLGenerator.Feature.USE_NATIVE_TYPE_ID);
        ObjectMapper yamlOm = new ObjectMapper(yf);


        if (pathInfo.equals("/")) {
            sendResponse(resp, HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            return;
        }

        String payload = getRequestPayload(req);

        if (pathInfo.equals("/function")) {

            persistence.dto.Function f = null;

            try {
                f = om.readValue(payload, persistence.dto.Function.class);
                f.id = UUID.randomUUID().toString();
            } catch (JsonParseException jpe) {
                sendResponseMessage(resp, "Could not parse request body: " + jpe.getLocalizedMessage(), HttpServletResponse.SC_BAD_REQUEST);
                return;
            } catch (JsonMappingException jme) {
                sendResponseMessage(resp, "Invalid data given: " + jme.getLocalizedMessage(), HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            functionRepository.add(f);
            sendResponseJson(resp, f);
        }
        if (pathInfo.contains("/workflow")) {

            String targetType = req.getHeader("Accept");
            Map<String, Object> requestData = null;

            try {
                requestData = om.readValue(payload, new TypeReference<Map<String, Object>>() {});
            } catch (JsonParseException jpe) {
                sendResponseMessage(resp, "Could not parse request body: " + jpe.getLocalizedMessage(), HttpServletResponse.SC_BAD_REQUEST);
                return;
            } catch (JsonMappingException jme) {
                sendResponseMessage(resp, "Invalid data given: " + jme.getLocalizedMessage(), HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            afcl.Workflow w = null;
            Object workflowData = null;
            try {
                workflowData = requestData.get("workflow");
            } catch (NullPointerException npe) {
                sendResponseMessage(resp, "no workflow data found", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (pathSegments[pathSegments.length-1].equals("fromEditorXml")) {
                try {
                    w = WorkflowConversionService.fromGraphXml((String)workflowData);
                } catch (Exception e) {
                    sendResponseMessage(resp, "could not parse from Editor XML:" + e.getLocalizedMessage(), HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }
            }
            if (pathSegments[pathSegments.length-1].equals("fromYaml")) {
                try {
                    w = yamlOm.readValue((String)workflowData, afcl.Workflow.class);
                } catch (Exception e) {
                    sendResponseMessage(resp, "could not parse from AFCL YAML: " + e.getLocalizedMessage(), HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }
            }
            if (pathSegments[pathSegments.length-1].equals("fromJson")) {
                try {
                    w = om.convertValue(workflowData, afcl.Workflow.class);
                } catch (IllegalArgumentException iae) {
                    sendResponseMessage(resp, "could not parse from AFCL JSON: " + iae.getLocalizedMessage(), HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }
            }

            if (w == null) {
                sendResponseMessage(resp, "Could not read workflow. Invalid format", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (pathInfo.contains("/workflow/convert")) {

                switch (targetType) {
                    case "application/x-yaml":
                    case "text/x-yaml":
                    case "text/yaml":
                    case "text/vnd.yaml":
                        sendResponseText(resp, yamlOm.writeValueAsString(w), HttpServletResponse.SC_OK);
                        return;
                    case "application/json":
                        sendResponseJson(resp, w);
                        return;
                    default:
                        break;
                }

            }

            if (pathInfo.contains("/workflow/adapt")) {

                Map<String, List> adaptations = null;
                try {
                    adaptations = om.convertValue(requestData.get("adaptations"), new TypeReference<Map<String, List>>() {});
                } catch (IllegalArgumentException iae) {
                    sendResponseMessage(resp, "invalid adaptations given: " + iae.getLocalizedMessage(), HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }

                afcl.Workflow adaptedWorkflow = WorkflowAdaptationService.getAdaptedWorkflow(w, adaptations);

                sendResponseJson(resp, adaptedWorkflow);
                return;
            }

            sendResponse(resp, HttpServletResponse.SC_BAD_REQUEST);
        }

    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")) {
            sendResponse(resp, HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            return;
        }

        if (pathInfo.contains("/function/")) {

            String[] pathSegments = pathInfo.split("/");

            if (pathSegments.length != 3) {
                sendResponseMessage(resp, "Invalid path", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String id = pathSegments[pathSegments.length-1];

            if (functionRepository.findOne(id) == null) {
                sendResponse(resp, HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            functionRepository.remove(id);
            sendResponse(resp, HttpServletResponse.SC_OK);
        }
    }

    private void sendResponse(HttpServletResponse resp, int code) throws IOException {
        resp.setStatus(code);
    }

    private void sendResponseMessage(HttpServletResponse resp, String error, int status) throws IOException {
        Map<String, Object> errObj = Map.of("message", error);
        sendResponseJson(resp, errObj, status);
    }

    private void sendResponseJson(HttpServletResponse resp, Object obj) throws IOException {
        sendResponseJson(resp, obj, HttpServletResponse.SC_OK);
    }

    private void sendResponseJson(HttpServletResponse resp, Object obj, int status) throws IOException {
        resp.setContentType("application/json");
        resp.setStatus(status);

        if (obj != null) {
            PrintWriter out = resp.getWriter();
            out.print(new ObjectMapper().writeValueAsString(obj));
            out.close();
        }
    }

    private void sendResponseText(HttpServletResponse resp, String content, int status) throws IOException {
        resp.setContentType("text/plain");
        resp.setStatus(status);

        if (content != null) {
            PrintWriter out = resp.getWriter();
            out.print(content);
            out.close();
        }
    }

    private String getRequestPayload(HttpServletRequest req) throws IOException {
        StringBuilder buffer = new StringBuilder();
        BufferedReader reader = req.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            buffer.append(line + System.lineSeparator());
        }

        return buffer.toString();
    }
}
