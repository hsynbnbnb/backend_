package com.pilipili.backend.common;

/**
 * 统一响应体。契约 v1 与前端 client/src/network/request.js 保持一致：
 * HTTP 状态恒为 200，业务状态由 code 区分（200 成功），前端读取 res.data.code。
 */
public class Result<T> {

    private int code;
    private String message;
    private T data;

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> Result<T> ok(T data) {
        return new Result<>(ErrorCode.SUCCESS.getCode(), "OK", data);
    }

    public static <T> Result<T> ok(T data, String message) {
        return new Result<>(ErrorCode.SUCCESS.getCode(), message, data);
    }

    public static <T> Result<T> fail(ErrorCode errorCode) {
        return new Result<>(errorCode.getCode(), errorCode.getMessage(), null);
    }

    public static <T> Result<T> fail(int code, String message) {
        return new Result<>(code, message, null);
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }
    public T getData() { return data; }

    public void setCode(int code) { this.code = code; }
    public void setMessage(String message) { this.message = message; }
    public void setData(T data) { this.data = data; }
}
