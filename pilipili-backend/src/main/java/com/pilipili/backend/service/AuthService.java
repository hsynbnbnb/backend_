package com.pilipili.backend.service;

import com.pilipili.backend.common.Result;
import com.pilipili.backend.config.JwtService;
import com.pilipili.backend.repository.DataRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/** 认证域：用户校验、令牌签发，写操作留痕到 user_event。 */
@Service
public class AuthService {

    private final DataRepository repo;
    private final JwtService jwt;

    public AuthService(DataRepository repo, JwtService jwt) {
        this.repo = repo;
        this.jwt = jwt;
    }

    public Object login(ApiContext c) {
        String username = c.str("username", "");
        String password = c.str("password", "");
        Map<String, Object> user = repo.queryOne(
                "select * from app_user where username = ? and password = ?", username, password);
        if (user == null) return Result.fail(500, "用户名或密码错误");
        return issue(user, "登录成功");
    }

    public Object phoneLogin(ApiContext c) {
        // 契约 v1 统一验证码为 123456（与 backend_/core.js 一致，手机端第 3 步需同步）
        if (!"123456".equals(c.str("code", ""))) {
            return Result.fail(500, "验证码错误，请重新输入");
        }
        Map<String, Object> user = repo.queryOne("select * from app_user where uid = 1");
        return issue(user, "登录成功");
    }

    public Object register(ApiContext c) {
        String username = c.str("username", "");
        if (username.isBlank()) return Result.fail(400, "用户名不能为空");
        Map<String, Object> exists = repo.queryOne("select uid from app_user where username = ?", username);
        if (exists != null) return Result.fail(409, "用户名已存在");
        long uid = repo.nextId("app_user", "uid");
        repo.update("insert into app_user (uid, username, password, nickname) values (?,?,?,?)",
                uid, username, c.str("password", "123456"), c.str("nickname", username));
        return Result.ok(null, "注册成功");
    }

    public Object sendCode(ApiContext c) {
        return Result.ok(null, "验证码已发送（Mock：123456）");
    }

    public Object currentUser(ApiContext c) {
        Map<String, Object> user = repo.queryOne("select * from app_user where uid = ?", c.getUid());
        return user == null ? null : publicUser(user);
    }

    private Result<Object> issue(Map<String, Object> user, String message) {
        long uid = ((Number) user.get("uid")).longValue();
        String nickname = String.valueOf(user.getOrDefault("nickname", ""));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("token", jwt.issue(uid, nickname));
        data.put("user", publicUser(user));
        repo.update("insert into user_event (uid, event_type, biz_id, detail) values (?,?,?,?)",
                uid, "LOGIN", String.valueOf(uid), "login success");
        return Result.ok(data, message);
    }

    /** 兼容前端两套字段命名（avatar / avatar_url、authMsg / auth_msg），避免跨端取错字段。 */
    private Map<String, Object> publicUser(Map<String, Object> u) {
        Map<String, Object> out = new LinkedHashMap<>(u);
        out.remove("password");
        Object avatar = u.get("avatarUrl");
        out.putIfAbsent("avatar", avatar);
        out.putIfAbsent("avatar_url", avatar);
        out.putIfAbsent("bg_url", u.get("background"));
        out.putIfAbsent("auth_msg", u.get("authMsg"));
        out.putIfAbsent("fansCount", u.get("fansCount"));
        return out;
    }
}
