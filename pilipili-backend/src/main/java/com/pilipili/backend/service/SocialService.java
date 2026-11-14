package com.pilipili.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pilipili.backend.repository.DataRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/** 社交域：个人空间、收藏夹、消息、动态、创作中心。补齐 backend_ 缺失的 /moment/list。 */
@Service
public class SocialService {

    private final DataRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    public SocialService(DataRepository repo) { this.repo = repo; }

    public Object favorites(ApiContext c) {
        return repo.query("select * from favorite_folder where uid = ? order by fid", c.getUid());
    }

    public Object moments(ApiContext c) {
        return repo.query("select * from moment order by id").stream().map(m -> {
            Map<String, Object> out = new LinkedHashMap<>();
            Map<String, Object> author = new LinkedHashMap<>();
            author.put("name", m.get("authorName"));
            author.put("avatarSeed", m.get("authorAvatarSeed"));
            author.put("fans", m.get("authorFans"));
            out.put("id", m.get("id"));
            out.put("author", author);
            out.put("time", m.get("timeText"));
            out.put("type", m.get("type"));
            out.put("text", m.get("content"));
            try {
                Object images = m.get("images");
                out.put("images", images == null ? List.of() : mapper.readValue(String.valueOf(images), List.class));
            } catch (Exception e) { out.put("images", List.of()); }
            out.put("videoCover", m.get("videoCover"));
            out.put("videoDuration", m.get("videoDuration"));
            out.put("shares", m.get("shares"));
            out.put("comments", m.get("comments"));
            out.put("likes", m.get("likes"));
            out.put("liked", !"0".equals(String.valueOf(m.get("liked"))));
            return out;
        }).collect(Collectors.toList());
    }

    public Object messages(ApiContext c) {
        String type = c.var("type", c.str("type", "all"));
        if ("all".equalsIgnoreCase(type) || type.isBlank()) return repo.query("select * from app_message order by created_at desc");
        return repo.query("select * from app_message where type = ? order by created_at desc", type);
    }

    public Object unread(ApiContext c) {
        Map<String, Object> out = new LinkedHashMap<>();
        repo.query("select type, unread_count from msg_unread")
                .forEach(r -> out.put(String.valueOf(r.get("type")), r.get("unreadCount")));
        return out;
    }

    public Object markRead(ApiContext c) {
        String type = c.str("type", "");
        if (type.isBlank()) repo.update("update app_message set is_read = 1");
        else repo.update("update app_message set is_read = 1 where type = ?", type);
        repo.update("update msg_unread set unread_count = 0" + (type.isBlank() ? "" : " where type = ?"),
                type.isBlank() ? new Object[0] : new Object[]{type});
        return unread(c);
    }

    public Object spaceUser(ApiContext c) {
        long uid = c.lng("uid", c.lng("id", 1));
        Map<String, Object> user = repo.queryOne("select * from app_user where uid = ?", uid);
        if (user == null) return Map.of();
        Map<String, Object> out = new LinkedHashMap<>(user);
        out.remove("password");
        out.put("avatar_url", user.get("avatarUrl"));
        out.put("bg_url", user.get("background"));
        return out;
    }

    public Object accountInfo(ApiContext c) {
        Map<String, Object> u = repo.queryOne("select * from app_user where uid = ?", c.getUid());
        if (u != null) u.remove("password");
        return u;
    }

    public Object accountSetting(ApiContext c) {
        return Map.of("push", true, "danmaku", true, "theme", "light", "privacy", "public");
    }

    public Object updateAccount(ApiContext c) {
        String nickname = c.str("nickname", "");
        String description = c.str("description", c.str("signature", ""));
        if (!nickname.isBlank() || !description.isBlank()) {
            repo.update("update app_user set nickname = case when ? = '' then nickname else ? end, "
                            + "description = case when ? = '' then description else ? end where uid = ?",
                    nickname, nickname, description, description, c.getUid());
        }
        return accountInfo(c);
    }

    public Object creatorOverview(ApiContext c) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalVideos", repo.scalarLong("select count(*) from video"));
        out.put("totalPlay", repo.scalarLong("select ifnull(sum(play),0) from video"));
        out.put("totalFans", repo.scalarLong("select fans_count from app_user where uid = ?", c.getUid()));
        out.put("pendingReview", 2);
        return out;
    }

    public Object creatorVideos(ApiContext c) {
        // 字段真实含义：vid / title / coverUrl / status / uploadDate / play，不做数值错映射
        return repo.query("select vid, title, cover_url, status, upload_date, play from video order by upload_date desc limit 10");
    }

    public Object whisperList(ApiContext c) {
        return repo.query("select * from app_message where type = 'whisper' order by created_at desc limit 20");
    }

    public Object whisperSend(ApiContext c) {
        String id = "w" + System.currentTimeMillis();
        repo.update("insert into app_message (id, type, title, content, sender_name, is_read, created_at) values (?,?,?,?,?,1,?)",
                id, "whisper", c.str("title", "私聊"), c.str("content", ""),
                c.str("senderName", "我"), new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm").format(new Date()));
        return Map.of("id", id);
    }
}
