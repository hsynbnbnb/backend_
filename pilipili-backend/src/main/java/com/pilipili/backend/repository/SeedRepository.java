package com.pilipili.backend.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pilipili.backend.common.Result;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/** 契约种子表访问：未单独迁移的接口，响应仍来自数据库而非前端内存 mock。 */
@Repository
public class SeedRepository {

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public SeedRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Result<Object>> find(String method, String path) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "select code, message, data_json from contract_seed where method = ? and path = ?", method, path);
        if (rows.isEmpty()) return Optional.empty();
        Map<String, Object> row = rows.get(0);
        int code = ((Number) row.get("code")).intValue();
        String message = String.valueOf(row.get("message"));
        Result<Object> result = Result.fail(code, message);
        try {
            Object raw = row.get("data_json");
            if (raw != null && !String.valueOf(raw).isBlank()) {
                result.setData(mapper.readValue(String.valueOf(raw), Object.class));
            }
        } catch (Exception ignored) {
            result.setData(null);
        }
        return Optional.of(result);
    }

    public int count() {
        Long n = jdbc.queryForObject("select count(*) from contract_seed", Long.class);
        return n == null ? 0 : n.intValue();
    }
}
