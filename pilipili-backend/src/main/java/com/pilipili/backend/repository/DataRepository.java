package com.pilipili.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** 通用数据访问层。统一把数据库 snake_case 列名转成前端契约使用的 camelCase。 */
@Repository
public class DataRepository {

    private final JdbcTemplate jdbc;

    public DataRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> query(String sql, Object... args) {
        return jdbc.queryForList(sql, args).stream().map(DataRepository::toCamel).collect(Collectors.toList());
    }

    public Map<String, Object> queryOne(String sql, Object... args) {
        List<Map<String, Object>> rows = query(sql, args);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public long scalarLong(String sql, Object... args) {
        Long v = jdbc.queryForObject(sql, Long.class, args);
        return v == null ? 0L : v;
    }

    public int update(String sql, Object... args) {
        return jdbc.update(sql, args);
    }

    public long nextId(String table, String column) {
        Long v = jdbc.queryForObject("select ifnull(max(" + column + "),0)+1 from " + table, Long.class);
        return v == null ? 1L : v;
    }

    public static Map<String, Object> toCamel(Map<String, Object> row) {
        Map<String, Object> out = new LinkedHashMap<>();
        row.forEach((k, v) -> out.put(camel(k), v));
        return out;
    }

    private static String camel(String key) {
        if (key == null || !key.contains("_")) return key;
        StringBuilder sb = new StringBuilder();
        boolean upper = false;
        for (char c : key.toCharArray()) {
            if (c == '_') upper = true;
            else if (upper) { sb.append(Character.toUpperCase(c)); upper = false; }
            else sb.append(c);
        }
        return sb.toString();
    }
}
