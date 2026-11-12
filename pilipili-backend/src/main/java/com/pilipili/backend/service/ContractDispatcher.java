package com.pilipili.backend.service;

import com.pilipili.backend.common.BusinessException;
import com.pilipili.backend.common.ErrorCode;
import com.pilipili.backend.common.Result;
import com.pilipili.backend.repository.SeedRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 契约分发层：已迁移到 Java 服务层的接口走真实 SQL；未迁移的接口从数据库契约种子表读取；
 * 两者都没有则明确返回 501（不再像 backend_ 那样静默返回 code 200 + null）。
 * 后续可按域逐个把 seed 接口搬进各 Service，前端始终零改动。
 */
@Service
public class ContractDispatcher {

    private static final Logger log = LoggerFactory.getLogger(ContractDispatcher.class);

    private final Map<String, Function<ApiContext, Object>> exact = new HashMap<>();
    private final List<PatternHandler> patterns = new ArrayList<>();
    private final SeedRepository seeds;

    private record PatternHandler(String method, Pattern pattern, String[] names,
                                  Function<ApiContext, Object> handler) { }

    public ContractDispatcher(AuthService auth, ContentService content,
                              CommerceService commerce, SocialService social,
                              SeedRepository seeds) {
        this.seeds = seeds;

        // 认证域
        ex("POST", "/user/account/login", auth::login);
        ex("POST", "/user/account/phone-login", auth::phoneLogin);
        ex("POST", "/user/account/register", auth::register);
        ex("POST", "/user/account/send-code", auth::sendCode);
        ex("GET", "/user/personal/info", auth::currentUser);

        // 内容域
        ex("GET", "/category/getall", content::channels);
        ex("GET", "/category/list", content::channels);
        ex("GET", "/search/hot/get", content::trending);
        ex("GET", "/search/count", content::searchCount);
        ex("GET", "/search/video/only-pass", content::searchVideos);
        ex("GET", "/video/random/visitor", content::randomVideos);
        ex("GET", "/video/cumulative/visitor", content::cumulativeVideos);
        ex("GET", "/video/getone", content::videoDetail);
        ex("GET", "/comment/get", content::comments);
        ex("POST", "/comment/add", content::addComment);
        ex("POST", "/video/love-or-not", c -> content.interact(c, "good"));
        ex("POST", "/video/collect", c -> content.interact(c, "collect"));
        ex("POST", "/video/share", c -> content.interact(c, "share"));
        ex("POST", "/video/play/visitor", content::play);
        ex("POST", "/video/play/user", content::play);
        pat("GET", "^/danmu-list/(\\d+)$", new String[]{"vid"}, content::danmakuList);

        // 交易域（含原 backend_ 缺失、本轮补齐的商城接口）
        ex("GET", "/mall/categories", commerce::categories);
        ex("GET", "/mall/products", commerce::products);
        ex("GET", "/mall/reviews", commerce::reviews);
        ex("GET", "/mall/orders", commerce::orders);
        ex("POST", "/mall/order/create", commerce::createOrder);
        ex("GET", "/cart", commerce::cart);
        ex("POST", "/cart", commerce::addToCart);
        pat("GET", "^/mall/product/([^/]+)$", new String[]{"id"}, commerce::productDetail);
        pat("PUT", "^/cart/([^/]+)$", new String[]{"id"}, commerce::updateCart);
        pat("DELETE", "^/cart/([^/]+)$", new String[]{"id"}, commerce::deleteCart);

        // 社交域（含本轮补齐的 /moment/list）
        ex("GET", "/favorite/get-all/user", social::favorites);
        ex("GET", "/favorite/get-all/visitor", social::favorites);
        ex("GET", "/moment/list", social::moments);
        ex("GET", "/msg-unread/all", social::unread);
        ex("POST", "/message/read", social::markRead);
        ex("GET", "/user/info/get-one", social::spaceUser);
        ex("GET", "/user/account/info", social::accountInfo);
        ex("POST", "/user/account/info", social::updateAccount);
        ex("GET", "/user/account/setting", social::accountSetting);
        ex("GET", "/creator/overview", social::creatorOverview);
        ex("GET", "/creator/videos", social::creatorVideos);
        ex("GET", "/message/whisper/list", social::whisperList);
        ex("POST", "/message/whisper/send", social::whisperSend);
        pat("GET", "^/message/list/(\\w+)$", new String[]{"type"}, social::messages);

        log.info("契约分发已注册：精确 {} 条，路径模式 {} 条，其余由 MySQL 契约种子兜底", exact.size(), patterns.size());
    }

    @SuppressWarnings("unchecked")
    public Result<Object> dispatch(ApiContext ctx) {
        Function<ApiContext, Object> handler = exact.get(ctx.key());
        if (handler == null) {
            for (PatternHandler ph : patterns) {
                if (!ph.method().equals(ctx.getMethod())) continue;
                Matcher m = ph.pattern().matcher(ctx.getPath());
                if (m.matches()) {
                    for (int i = 0; i < ph.names().length; i++) ctx.putVar(ph.names()[i], m.group(i + 1));
                    handler = ph.handler();
                    break;
                }
            }
        }
        if (handler != null) {
            Object out = handler.apply(ctx);
            return out instanceof Result ? (Result<Object>) out : Result.ok(out);
        }
        return seeds.find(ctx.getMethod(), ctx.getPath()).orElseThrow(() -> {
            log.warn("未登记接口：{}", ctx.key());
            return new BusinessException(ErrorCode.NOT_IMPLEMENTED,
                    "接口未登记：" + ctx.key() + "，请查看 docs/接口契约v1对照表.md");
        });
    }

    public int migratedCount() { return exact.size() + patterns.size(); }

    private void ex(String method, String path, Function<ApiContext, Object> handler) {
        exact.put(method + " " + path, handler);
    }

    private void pat(String method, String regex, String[] names, Function<ApiContext, Object> handler) {
        patterns.add(new PatternHandler(method, Pattern.compile(regex), names, handler));
    }
}
