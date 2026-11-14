package com.pilipili.backend.service;

import java.util.LinkedHashMap;
import java.util.Map;

/** 一次请求的上下文，隔离 HTTP 类型，服务层只依赖它。 */
public class ApiContext {

    private final String method;
    private final String path;
    private final Map<String, Object> input;
    private final Map<String, String> vars = new LinkedHashMap<>();
    private final long uid;

    public ApiContext(String method, String path, Map<String, Object> input, long uid) {
        this.method = method;
        this.path = path;
        this.input = input == null ? new LinkedHashMap<>() : input;
        this.uid = uid;
    }

    public String key() { return method.toUpperCase() + " " + path; }

    public String str(String key, String def) {
        Object v = input.get(key);
        return v == null ? def : String.valueOf(v);
    }

    public long lng(String key, long def) {
        try { return Long.parseLong(str(key, String.valueOf(def))); }
        catch (NumberFormatException e) { return def; }
    }

    public int integer(String key, int def) { return (int) lng(key, def); }

    public boolean bool(String key, boolean def) {
        Object v = input.get(key);
        if (v == null) return def;
        return Boolean.parseBoolean(String.valueOf(v)) || "1".equals(String.valueOf(v));
    }

    public String var(String name, String def) { return vars.getOrDefault(name, def); }
    public void putVar(String name, String value) { vars.put(name, value); }

    public String getMethod() { return method.toUpperCase(); }
    public String getPath() { return path; }
    public Map<String, Object> getInput() { return input; }
    public long getUid() { return uid; }
}
