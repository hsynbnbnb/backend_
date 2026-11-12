package com.pilipili.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 轻量 JWT（HS256），仅依赖 JDK，密钥来自环境变量。
 * 正式版应改为短时效 access token + 服务端存储的 refresh token。
 */
@Service
public class JwtService {

    private static final String ALG = "HmacSHA256";

    private final String secret;
    private final String issuer;
    private final long ttlSeconds;
    private final ObjectMapper mapper = new ObjectMapper();

    public JwtService(@Value("${pilipili.jwt.secret}") String secret,
                      @Value("${pilipili.jwt.issuer}") String issuer,
                      @Value("${pilipili.jwt.ttl-seconds}") long ttlSeconds) {
        this.secret = secret;
        this.issuer = issuer;
        this.ttlSeconds = ttlSeconds;
    }

    public String issue(Long uid, String nickname) {
        try {
            Map<String, Object> header = new LinkedHashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("uid", uid);
            payload.put("nickname", nickname);
            payload.put("iss", issuer);
            payload.put("exp", System.currentTimeMillis() / 1000 + ttlSeconds);
            String h = b64(mapper.writeValueAsBytes(header));
            String p = b64(mapper.writeValueAsBytes(payload));
            return h + "." + p + "." + b64(sign(h + "." + p));
        } catch (Exception e) {
            throw new IllegalStateException("token issue failed", e);
        }
    }

    /** 解析失败返回空 Map，不抛异常：当前阶段只做认证骨架，不阻断联调。 */
    public Map<String, Object> verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return Map.of();
            String expected = b64(sign(parts[0] + "." + parts[1]));
            if (!expected.equals(parts[2])) return Map.of();
            Map<String, Object> claims = mapper.readValue(Base64.getUrlDecoder().decode(parts[1]), Map.class);
            Object exp = claims.get("exp");
            if (exp instanceof Number && ((Number) exp).longValue() < System.currentTimeMillis() / 1000) return Map.of();
            return claims;
        } catch (Exception e) {
            return Map.of();
        }
    }

    private byte[] sign(String content) throws Exception {
        Mac mac = Mac.getInstance(ALG);
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), ALG));
        return mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
    }

    private String b64(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
