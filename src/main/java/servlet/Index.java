package servlet;

import java.io.IOException;

import javax.servlet.ServletException;
// import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "Index", urlPatterns = { "" })
public class Index extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    request.getSession().setAttribute("title", "Serverless Workflow Editor");
    request.getSession().setAttribute("description", "An editor for creating serverless Workflows");
    request.getRequestDispatcher("index.jsp").forward(request, response);
  }
}