package com.pilipili.backend.common;

/** 业务错误码。契约 v1 沿用前端既有判断：200 成功，其余为失败。 */
public enum ErrorCode {

    SUCCESS(200, "OK"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "无权限访问"),
    NOT_FOUND(404, "资源不存在"),
    CONFLICT(409, "资源冲突"),
    NOT_IMPLEMENTED(501, "接口尚未迁移，请查看 docs/接口契约v1对照表.md"),
    SYSTEM_ERROR(500, "系统异常");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }
}
