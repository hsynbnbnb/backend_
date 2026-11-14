package com.pilipili.backend.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

/** 解析 Bearer token 并挂到 request attribute；当前阶段不强制拦截，避免打断既有前端联调。 */
@Component
public class JwtInterceptor implements HandlerInterceptor {

    public static final String ATTR_UID = "pilipili.uid";
    public static final String ATTR_CLAIMS = "pilipili.claims";

    private final JwtService jwtService;

    public JwtInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            Map<String, Object> claims = jwtService.verify(auth.substring(7));
            if (!claims.isEmpty()) {
                request.setAttribute(ATTR_CLAIMS, claims);
                Object uid = claims.get("uid");
                if (uid instanceof Number) request.setAttribute(ATTR_UID, ((Number) uid).longValue());
            }
        }
        if (request.getAttribute(ATTR_UID) == null) request.setAttribute(ATTR_UID, 1L);
        return true;
    }
}
