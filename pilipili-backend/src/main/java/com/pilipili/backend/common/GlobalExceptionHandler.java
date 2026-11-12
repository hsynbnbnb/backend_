package com.pilipili.backend.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

/**
 * 全局异常处理：所有响应保持 HTTP 200 + 业务 code，避免 axios 因 4xx/5xx 直接 reject
 * 而破坏前端现有的 .then(res => res.data.code === 200) 写法。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("business error code={} msg={}", e.getErrorCode().getCode(), e.getMessage());
        return Result.fail(e.getErrorCode().getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + " " + f.getDefaultMessage())
                .reduce((a, b) -> a + "；" + b)
                .orElse(ErrorCode.PARAM_ERROR.getMessage());
        return Result.fail(ErrorCode.PARAM_ERROR.getCode(), msg);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public Result<Void> handleNotFound(NoHandlerFoundException e) {
        log.warn("unmapped api: {}", e.getRequestURL());
        return Result.fail(ErrorCode.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleUnknown(Exception e) {
        log.error("unexpected error", e);
        return Result.fail(ErrorCode.SYSTEM_ERROR);
    }
}
