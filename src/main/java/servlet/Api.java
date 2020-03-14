package servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLGenerator;
import com.google.gson.Gson;
import persistence.*;
import service.WorkflowConversionService;

@WebServlet(name = "Api", urlPatterns = { "/api/*" })
public class Api extends HttpServlet {

    private Gson gson = new Gson();
    private Repository<persistence.dto.Function> functionRepository = new FunctionRepository("functions.ser");

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        String pathInfo = req.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")){

            sendResponseJson(resp, "Serverless Workflow API");
            return;
        }

        if (pathInfo.equals("/function")) {
            sendResponseJson(resp, functionRepository.findAll());
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

            String contentType = req.getContentType();

            // only accept xml
            if (!"text/xml".equals(contentType) && !"application/xml".equals(contentType)) {
                sendResponseJson(resp, "Bad Request", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (pathInfo.contains("/workflow/convert")) {

                afcl.Workflow w = WorkflowConversionService.fromXml(payload);

                String targetType = req.getHeader("Accept");
                ObjectMapper om = new ObjectMapper();

                switch (targetType) {
                    case "application/x-yaml":
                    case "text/yaml":
                        YAMLFactory yf = new YAMLFactory();
                        yf.disable(YAMLGenerator.Feature.USE_NATIVE_TYPE_ID);
                        om = new ObjectMapper(yf);

                        sendResponseFile(resp, om.writeValueAsBytes(w), targetType, w.getName() + ".yaml");
                        break;
                    case "application/json":
                        sendResponseFile(resp, om.writeValueAsBytes(w), targetType, w.getName() + ".json");
                        break;
                    default:
                        break;
                }

                sendResponseJson(resp, "Bad Request", HttpServletResponse.SC_BAD_REQUEST);
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

            if (functionRepository.findOne(id) == null) {
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
            out.close();
        }
    }

    private void sendResponseFile(HttpServletResponse resp, byte[] content, String contentType, String downloadName) throws IOException {
        resp.setContentType(contentType);
        resp.setHeader("Content-Disposition", "filename=" + downloadName);
        resp.setContentLength(content.length);

        OutputStream os = resp.getOutputStream();

        os.write(content , 0, content.length);
        os.close();
    }
}
