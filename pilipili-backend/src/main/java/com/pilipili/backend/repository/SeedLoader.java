package com.pilipili.backend.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** 启动时把契约种子导入 MySQL，保证响应数据可查询、可审计、可逐步迁移。 */
@Component
public class SeedLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedLoader.class);

    @Value("classpath:contract-seed.json")
    private Resource seedResource;

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public SeedLoader(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) throws Exception {
        JsonNode arr = mapper.readTree(seedResource.getInputStream());
        int n = 0;
        for (JsonNode node : arr) {
            String dataJson = node.has("data") && !node.get("data").isNull()
                    ? mapper.writeValueAsString(node.get("data")) : "null";
            jdbc.update("insert into contract_seed (method, path, code, message, data_json, source_module) "
                            + "values (?,?,?,?,?,?) on duplicate key update code=values(code), "
                            + "message=values(message), data_json=values(data_json), source_module=values(source_module)",
                    node.path("method").asText(), node.path("path").asText(), node.path("code").asInt(200),
                    node.path("message").asText("OK"), dataJson, node.path("module").asText(""));
            n++;
        }
        log.info("契约种子已导入 MySQL：{} 条", n);
    }
}
