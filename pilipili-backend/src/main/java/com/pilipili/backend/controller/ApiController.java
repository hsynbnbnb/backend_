package com.pilipili.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pilipili.backend.common.Result;
import com.pilipili.backend.config.JwtInterceptor;
import com.pilipili.backend.repository.DataRepository;
import com.pilipili.backend.repository.SeedRepository;
import com.pilipili.backend.service.ApiContext;
import com.pilipili.backend.service.ContractDispatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 契约 v1 统一入口：只做 HTTP 解析与响应格式化，业务逻辑全部在 Service 层。
 * 前端 client/src/network/request.js 的 get/post 路径与此处一一对应。
 */
@RestController
public class ApiController {

    private static final Logger log = LoggerFactory.getLogger(ApiController.class);

    private final ContractDispatcher dispatcher;
    private final DataRepository repo;
    private final SeedRepository seeds;
    private final ObjectMapper mapper = new ObjectMapper();

    public ApiController(ContractDispatcher dispatcher, DataRepository repo, SeedRepository seeds) {
        this.dispatcher = dispatcher;
        this.repo = repo;
        this.seeds = seeds;
    }

    @RequestMapping(value = "/api/**", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH})
    public Result<Object> handle(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String path = uri;
        if (path.startsWith("/api/")) path = path.substring(4);
        else if (path.equals("/api")) path = "/";

        Map<String, Object> input = new LinkedHashMap<>();
        request.getParameterMap().forEach((k, v) -> input.put(k, v.length > 0 ? v[0] : ""));
        try {
            byte[] bytes = request.getInputStream().readAllBytes();
            if (bytes.length > 0) {
                String raw = new String(bytes, StandardCharsets.UTF_8).trim();
                if (raw.startsWith("{")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> json = mapper.readValue(raw, Map.class);
                    input.putAll(json);
                }
            }
        } catch (Exception ignored) {
            // multipart/form-data 已由容器解析到 parameterMap，无需再读 body
        }

        Object uidAttr = request.getAttribute(JwtInterceptor.ATTR_UID);
        long uid = uidAttr instanceof Number ? ((Number) uidAttr).longValue() : 1L;
        ApiContext ctx = new ApiContext(request.getMethod(), path, input, uid);
        log.info("{} {} params={}", ctx.getMethod(), ctx.getPath(), input.size());
        return dispatcher.dispatch(ctx);
    }

    @GetMapping("/api/health")
    public Result<Object> health() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("status", "UP");
        out.put("database", "MySQL");
        out.put("contractSeeds", seeds.count());
        out.put("migratedHandlers", dispatcher.migratedCount());
        out.put("videos", repo.scalarLong("select count(*) from video"));
        out.put("products", repo.scalarLong("select count(*) from product"));
        return Result.ok(out);
    }
}
