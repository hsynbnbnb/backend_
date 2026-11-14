package com.pilipili.backend.config;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 兼容两种前端代理写法：
 *  - 直连 http://localhost:9090/api/xxx
 *  - vue.config.js 代理带 pathRewrite，转发后变成 /xxx
 * 统一补 /api 前缀后再交给 Spring MVC，前端无需改任何 URL。
 */
@Component
public class ApiPrefixFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (!path.startsWith("/api/") && !path.equals("/api")
                && !path.startsWith("/actuator") && !path.equals("/error")
                && !path.startsWith("/favicon")) {
            request.getRequestDispatcher("/api" + path).forward(request, response);
            return;
        }
        chain.doFilter(request, response);
    }
}
