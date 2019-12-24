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

import com.google.gson.Gson;
import persistence.*;

@WebServlet(name = "Api", urlPatterns = { "/api/*" })
public class Api extends HttpServlet {

    private Gson gson = new Gson();
    private Repository<Function> functionRepository = new FunctionRepository("functions.ser");
    private Repository<Workflow> workflowRepository = new WorkflowRepository("workflows.ser");

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

        if (pathInfo.equals("/workflow")) {
            sendResponseJson(resp, workflowRepository.findAll());
            return;
        }

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
            Function f = gson.fromJson(payload, Function.class);
            f.id = UUID.randomUUID().toString();

            if (f == null) {
                sendResponseJson(resp, "Bad Request", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            functionRepository.add(f);

            sendResponseJson(resp, f);
        }
        if (pathInfo.equals("/workflow")) {
            Workflow w = gson.fromJson(payload, Workflow.class);
            w.id = UUID.randomUUID().toString();

            if (w == null) {
                sendResponseJson(resp, "Bad Request", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            workflowRepository.add(w);

            sendResponseJson(resp, w);
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

        if (pathInfo.contains("/workflow/")) {
            String[] pathSegments = pathInfo.split("/");
            if (pathSegments.length != 3) {
                sendResponseJson(resp, "Bad Request", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String id = pathSegments[pathSegments.length-1];

            if (!workflowRepository.has(id)) {
                sendResponseJson(resp, "Not Found", HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            workflowRepository.remove(id);
            sendResponseJson(resp, "Deleted");
        }
    }

    private void sendResponseJson(HttpServletResponse resp, Object obj) throws IOException {
        sendResponseJson(resp, obj, HttpServletResponse.SC_OK);
    }

    private void sendResponseJson(HttpServletResponse resp, Object obj, int status) throws IOException {
        resp.setContentType("application/json");
        resp.setStatus(status);

        PrintWriter out = resp.getWriter();

        out.print(gson.toJson(obj));
        out.flush();
    }
}
