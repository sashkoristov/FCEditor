package servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.UUID;

import afcl.utils.Utils;
import com.google.gson.Gson;
import persistence.*;
import service.WorkflowConversionService;

@WebServlet(name = "Api", urlPatterns = { "/api/*" })
public class Api extends HttpServlet {

    private Gson gson = new Gson();
    private Repository<persistence.dto.Function> functionRepository = new FunctionRepository("functions.ser");
    //private Repository<Workflow> workflowRepository = new WorkflowRepository("workflows.ser");

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        String pathInfo = req.getPathInfo();

        if(pathInfo == null || pathInfo.equals("/")){

            sendResponseJson(resp, "Serverless Workflow API");
            return;
        }

        if (pathInfo.equals("/function")) {
            sendResponseJson(resp, functionRepository.findAll());
            return;
        }

        /*
        if (pathInfo.equals("/workflow")) {
            sendResponseJson(resp, workflowRepository.findAll());
            return;
        }
         */

    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")) {
            sendResponseJson(resp, "Not allowed", HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            return;
        }

        StringBuilder buffer = new StringBuilder();
        BufferedReader reader = req.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            buffer.append(line);
        }

        String payload = buffer.toString();

        if (pathInfo.equals("/function")) {
            persistence.dto.Function f = gson.fromJson(payload, persistence.dto.Function.class);
            f.id = UUID.randomUUID().toString();

            if (f == null) {
                sendResponseJson(resp, "Bad Request", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            functionRepository.add(f);

            sendResponseJson(resp, f);
        }
        if (pathInfo.contains("/workflow")) {
            persistence.dto.Workflow wDto = gson.fromJson(payload, persistence.dto.Workflow.class);

            if (wDto == null) {
                sendResponseJson(resp, "Bad Request", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (pathInfo.contains("/workflow/save")) {

                afcl.Workflow w = WorkflowConversionService.fromXml(wDto.body);

                Utils.writeYamlNoValidation(w, wDto.name + ".yaml");

                sendResponseJson(resp);
            }

            if (pathInfo.contains("/workflow/load")) {
                afcl.Workflow w = Utils.readYAMLNoValidation("workflow.yaml");

                String xml = WorkflowConversionService.toXml(w);

                sendResponseXml(resp, xml);

            }
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")) {
            sendResponseJson(resp, "Not allowed", HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            return;
        }

        if (pathInfo.contains("/function/")) {

            String[] pathSegments = pathInfo.split("/");

            if (pathSegments.length != 3) {
                sendResponseJson(resp, "Bad Request", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String id = pathSegments[pathSegments.length-1];

            if (!functionRepository.has(id)) {
                sendResponseJson(resp, "Not Found", HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            functionRepository.remove(id);
            sendResponseJson(resp, "Deleted");
        }
    }

    private void sendResponseXml(HttpServletResponse resp, String text) throws IOException {
        resp.setContentType("text/xml");
        resp.setStatus(HttpServletResponse.SC_OK);

        if (text != null) {
            PrintWriter out = resp.getWriter();
            out.print(text);
            out.flush();
        }
    }

    private void sendResponseJson(HttpServletResponse resp) throws IOException {
        sendResponseJson(resp, null, HttpServletResponse.SC_OK);
    }

    private void sendResponseJson(HttpServletResponse resp, Object obj) throws IOException {
        sendResponseJson(resp, obj, HttpServletResponse.SC_OK);
    }

    private void sendResponseJson(HttpServletResponse resp, Object obj, int status) throws IOException {
        resp.setContentType("application/json");
        resp.setStatus(status);

        if (obj != null) {
            PrintWriter out = resp.getWriter();
            out.print(gson.toJson(obj));
            out.flush();
        }
    }
}
