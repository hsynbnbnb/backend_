package com.pilipili.backend.service;

import com.pilipili.backend.common.BusinessException;
import com.pilipili.backend.common.ErrorCode;
import com.pilipili.backend.common.Result;
import com.pilipili.backend.repository.DataRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/** 交易域：商品、评价、订单、购物车。补齐原 backend_ 缺失的 7 个商城/动态接口中的 5 个商城接口。 */
@Service
public class CommerceService {

    private final DataRepository repo;

    public CommerceService(DataRepository repo) { this.repo = repo; }

    public Object categories(ApiContext c) {
        return repo.query("select name, description, color, sort_no from mall_category order by sort_no")
                .stream().map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", r.get("name"));
                    m.put("desc", r.get("description"));
                    m.put("color", r.get("color"));
                    return m;
                }).collect(Collectors.toList());
    }

    public Object products(ApiContext c) {
        String category = c.str("category", "");
        String keyword = c.str("keyword", "");
        String sort = c.str("sort", "");
        StringBuilder sql = new StringBuilder("select * from product where 1=1");
        List<Object> args = new ArrayList<>();
        if (!category.isBlank() && !"推荐".equals(category)) {
            sql.append(" and category = ?"); args.add(category);
        }
        if (!keyword.isBlank()) {
            sql.append(" and (title like ? or shop like ?)");
            args.add("%" + keyword + "%"); args.add("%" + keyword + "%");
        }
        // 排序列白名单，杜绝 SQL 注入
        switch (sort) {
            case "sales" -> sql.append(" order by cast(sold as decimal(12,2)) desc");
            case "priceAsc" -> sql.append(" order by price asc");
            case "priceDesc" -> sql.append(" order by price desc");
            default -> sql.append(" order by id");
        }
        return repo.query(sql.toString(), args.toArray()).stream().map(this::productView).collect(Collectors.toList());
    }

    public Object productDetail(ApiContext c) {
        String id = c.var("id", c.str("id", ""));
        Map<String, Object> row = repo.queryOne("select * from product where id = ?", id);
        if (row == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在或已下架");
        return productView(row);
    }

    public Object reviews(ApiContext c) {
        return repo.query("select * from product_review order by id").stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.get("id"));
            m.put("user", r.get("userName"));
            m.put("avatarSeed", r.get("avatarSeed"));
            m.put("text", r.get("content"));
            m.put("date", r.get("reviewDate"));
            return m;
        }).collect(Collectors.toList());
    }

    public Object orders(ApiContext c) {
        String status = c.str("status", "");
        String sql = "select * from mall_order" + (status.isBlank() || "all".equals(status) ? "" : " where status = ?")
                + " order by created_at desc";
        List<Map<String, Object>> list = status.isBlank() || "all".equals(status)
                ? repo.query(sql) : repo.query(sql, status);
        return list.stream().map(this::orderView).collect(Collectors.toList());
    }

    public Object cart(ApiContext c) {
        return repo.query("select ci.id, ci.product_id, ci.qty, ci.selected, p.title, p.price, p.cover_seed "
                + "from cart_item ci left join product p on p.id = ci.product_id order by ci.id");
    }

    public Object addToCart(ApiContext c) {
        String pid = c.str("productId", c.str("id", ""));
        if (pid.isBlank()) throw new BusinessException(ErrorCode.PARAM_ERROR, "productId 不能为空");
        Map<String, Object> exists = repo.queryOne("select id, qty from cart_item where product_id = ?", pid);
        int qty = c.integer("quantity", c.integer("qty", 1));
        if (exists == null) {
            // 以 product_id 作为去重键，修复手机端 CartContext 用 c1/c2 作 id 导致重复行的问题
            repo.update("insert into cart_item (id, product_id, qty, selected) values (?,?,?,1)", "cart-" + pid, pid, qty);
        } else {
            repo.update("update cart_item set qty = qty + ? where product_id = ?", qty, pid);
        }
        repo.update("insert into user_event (uid, event_type, biz_id) values (?,?,?)", c.getUid(), "CART_ADD", pid);
        return cart(c);
    }

    public Object updateCart(ApiContext c) {
        String id = c.var("id", c.str("id", ""));
        if (c.getInput().containsKey("quantity") || c.getInput().containsKey("qty")) {
            repo.update("update cart_item set qty = ? where id = ?", c.integer("quantity", c.integer("qty", 1)), id);
        }
        if (c.getInput().containsKey("selected")) {
            repo.update("update cart_item set selected = ? where id = ?", c.bool("selected", true) ? 1 : 0, id);
        }
        return cart(c);
    }

    public Object deleteCart(ApiContext c) {
        String id = c.var("id", c.str("id", ""));
        if (id.isBlank()) repo.update("delete from cart_item");
        else repo.update("delete from cart_item where id = ?", id);
        return cart(c);
    }

    /** 结算：真实生成订单并清空已选购物车项，修复两端「点了去结算只弹 Toast」的缺陷。 */
    public Object createOrder(ApiContext c) {
        List<Map<String, Object>> items = repo.query(
                "select ci.product_id, ci.qty, p.title, p.price, p.cover_seed, p.shop "
                        + "from cart_item ci join product p on p.id = ci.product_id where ci.selected = 1");
        if (items.isEmpty()) throw new BusinessException(ErrorCode.CONFLICT, "购物车中没有已选商品");
        BigDecimal total = items.stream()
                .map(i -> ((BigDecimal) i.get("price")).multiply(BigDecimal.valueOf(((Number) i.get("qty")).longValue())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        String orderId = "o" + System.currentTimeMillis();
        String shop = String.valueOf(items.get(0).getOrDefault("shop", "pilipili官方店"));
        repo.update("insert into mall_order (id, shop, status, total, created_at) values (?,?,?,?,?)",
                orderId, shop, "pending", total, now());
        for (Map<String, Object> i : items) {
            repo.update("insert into order_item (order_id, product_id, title, cover_seed, price, qty) values (?,?,?,?,?,?)",
                    orderId, i.get("productId"), i.get("title"), i.get("coverSeed"), i.get("price"), i.get("qty"));
        }
        repo.update("delete from cart_item where selected = 1");
        repo.update("insert into user_event (uid, event_type, biz_id, detail) values (?,?,?,?)",
                c.getUid(), "ORDER_CREATE", orderId, "total=" + total);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("orderId", orderId);
        out.put("total", total);
        out.put("status", "pending");
        return Result.ok(out, "下单成功");
    }

    private Map<String, Object> orderView(Map<String, Object> o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.get("id"));
        m.put("shop", o.get("shop"));
        m.put("status", o.get("status"));
        m.put("total", o.get("total"));
        List<Map<String, Object>> items = repo.query(
                "select product_id, title, cover_seed, price, qty from order_item where order_id = ?", o.get("id"));
        m.put("items", items.stream().map(i -> {
            Map<String, Object> x = new LinkedHashMap<>();
            x.put("id", i.get("productId"));
            x.put("title", i.get("title"));
            x.put("coverSeed", i.get("coverSeed"));
            x.put("price", i.get("price"));
            x.put("qty", i.get("qty"));
            return x;
        }).collect(Collectors.toList()));
        return m;
    }

    private Map<String, Object> productView(Map<String, Object> p) {
        Map<String, Object> m = new LinkedHashMap<>(p);
        Object tags = p.get("tags");
        m.put("tags", tags == null ? List.of() : Arrays.asList(String.valueOf(tags).split(",")));
        Object sold = p.get("sold");
        if (sold != null) {
            try { m.put("sold", new BigDecimal(String.valueOf(sold)).stripTrailingZeros()); }
            catch (NumberFormatException ignored) { }
        }
        return m;
    }

    private String now() {
        return new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
    }
}
