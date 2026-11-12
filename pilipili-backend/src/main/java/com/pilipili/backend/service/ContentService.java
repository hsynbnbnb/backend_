package com.pilipili.backend.service;

import com.pilipili.backend.common.BusinessException;
import com.pilipili.backend.common.ErrorCode;
import com.pilipili.backend.repository.DataRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/** 内容域：分区、视频、弹幕、评论、互动、搜索。 */
@Service
public class ContentService {

    private final DataRepository repo;

    public ContentService(DataRepository repo) { this.repo = repo; }

    public Object channels(ApiContext c) {
        List<Map<String, Object>> rows = repo.query("select mc_id, mc_name, sc_id, sc_name from channel order by sort_no");
        Map<String, Map<String, Object>> grouped = new LinkedHashMap<>();
        for (Map<String, Object> r : rows) {
            String mcId = String.valueOf(r.get("mcId"));
            Map<String, Object> group = grouped.computeIfAbsent(mcId, k -> {
                Map<String, Object> g = new LinkedHashMap<>();
                g.put("mcId", mcId);
                g.put("mcName", r.get("mcName"));
                g.put("scList", new ArrayList<Map<String, Object>>());
                return g;
            });
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> list = (List<Map<String, Object>>) group.get("scList");
            Map<String, Object> sub = new LinkedHashMap<>();
            sub.put("mcId", mcId);
            sub.put("scId", r.get("scId"));
            sub.put("scName", r.get("scName"));
            list.add(sub);
        }
        return new ArrayList<>(grouped.values());
    }

    public Object trending(ApiContext c) {
        return repo.query("select content, type from trending order by sort_no");
    }

    public Object randomVideos(ApiContext c) {
        List<Map<String, Object>> rows = repo.query("select * from video order by rand() limit 11");
        return rows.stream().map(this::videoView).collect(Collectors.toList());
    }

    public Object cumulativeVideos(ApiContext c) {
        Set<String> seen = Arrays.stream(c.str("vids", "").split(","))
                .filter(s -> !s.isBlank()).collect(Collectors.toSet());
        List<Map<String, Object>> all = repo.query("select * from video order by vid desc");
        List<Map<String, Object>> rest = all.stream()
                .filter(v -> !seen.contains(String.valueOf(v.get("vid")))).collect(Collectors.toList());
        List<Map<String, Object>> page = rest.stream().limit(10).collect(Collectors.toList());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("videos", page.stream().map(this::videoView).collect(Collectors.toList()));
        out.put("vids", page.stream().map(v -> v.get("vid")).collect(Collectors.toList()));
        out.put("more", rest.size() > 10);
        return out;
    }

    public Object videoDetail(ApiContext c) {
        long vid = c.lng("vid", c.lng("id", 16));
        Map<String, Object> row = repo.queryOne("select * from video where vid = ?", vid);
        if (row == null) throw new BusinessException(ErrorCode.NOT_FOUND, "视频不存在");
        Map<String, Object> view = videoView(row);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("video", view.get("video"));
        out.put("user", view.get("user"));
        out.put("stats", view.get("stats"));
        out.put("category", view.get("category"));
        return out;
    }

    public Object danmakuList(ApiContext c) {
        long vid = c.lng("vid", 16);
        return repo.query("select * from danmaku where vid = ? order by time_point", vid);
    }

    public Object sendDanmaku(ApiContext c) {
        long id = repo.nextId("danmaku", "id");
        repo.update("insert into danmaku (id, vid, uid, content, time_point, mode, fontsize, color) values (?,?,?,?,?,?,?,?)",
                id, c.lng("vid", 16), c.getUid(), c.str("content", ""), c.integer("timePoint", 0),
                c.integer("mode", 1), c.integer("fontsize", 22), c.str("color", "#FFFFFF"));
        return Map.of("id", id);
    }

    public Object comments(ApiContext c) {
        long vid = c.lng("vid", 16);
        List<Map<String, Object>> rows = repo.query("select * from app_comment where vid = ? order by id", vid);
        List<Map<String, Object>> roots = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            if (((Number) r.getOrDefault("rootId", 0)).longValue() != 0) continue;
            Map<String, Object> item = new LinkedHashMap<>(r);
            List<Map<String, Object>> replies = rows.stream()
                    .filter(x -> String.valueOf(x.get("rootId")).equals(String.valueOf(r.get("id"))))
                    .collect(Collectors.toList());
            item.put("replies", replies);
            item.put("count", replies.size());
            roots.add(item);
        }
        return roots;
    }

    public Object addComment(ApiContext c) {
        long id = repo.nextId("app_comment", "id");
        repo.update("insert into app_comment (id, vid, uid, root_id, parent_id, content, love, create_time) values (?,?,?,?,?,?,0,?)",
                id, c.lng("vid", 16), c.getUid(), c.lng("rootId", 0), c.lng("parentId", 0),
                c.str("content", ""), new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm").format(new Date()));
        repo.update("update video set comment_count = comment_count + 1 where vid = ?", c.lng("vid", 16));
        return Map.of("id", id);
    }

    public Object interact(ApiContext c, String column) {
        long vid = c.lng("vid", 16);
        repo.update("update video set " + column + " = " + column + " + 1 where vid = ?", vid);
        repo.update("insert into user_event (uid, event_type, biz_id) values (?,?,?)",
                c.getUid(), "INTERACT_" + column.toUpperCase(), String.valueOf(vid));
        return repo.queryOne("select good, coin, collect, share, play from video where vid = ?", vid);
    }

    public Object play(ApiContext c) {
        repo.update("update video set play = play + 1 where vid = ?", c.lng("vid", 16));
        return null;
    }

    public Object searchCount(ApiContext c) {
        String kw = c.str("keyword", "");
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("video", kw.isBlank() ? 0 : repo.scalarLong("select count(*) from video where title like ?", "%" + kw + "%"));
        out.put("user", 0);
        return out;
    }

    public Object searchVideos(ApiContext c) {
        String kw = c.str("keyword", "");
        List<Map<String, Object>> rows = repo.query(
                "select * from video where title like ? or tags like ? order by play desc limit 30", "%" + kw + "%", "%" + kw + "%");
        return rows.stream().map(this::videoView).collect(Collectors.toList());
    }

    /** 组装前端约定的 { video, user, stats, category } 结构。 */
    private Map<String, Object> videoView(Map<String, Object> v) {
        Map<String, Object> video = new LinkedHashMap<>();
        for (String k : Arrays.asList("vid", "uid", "title", "type", "auth", "duration", "mcId", "scId",
                "tags", "descr", "coverUrl", "videoUrl", "status", "uploadDate", "deleteDate")) {
            video.put(k, v.get(k));
        }
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("vid", v.get("vid"));
        for (String k : Arrays.asList("play", "danmu", "good", "bad", "coin", "collect", "share")) stats.put(k, v.get(k));
        stats.put("comment", v.get("commentCount"));
        Map<String, Object> category = new LinkedHashMap<>();
        for (String k : Arrays.asList("mcId", "scId", "mcName", "scName")) category.put(k, v.get(k));
        Map<String, Object> user = repo.queryOne("select * from app_user where uid = ?", v.get("uid"));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("video", video);
        out.put("user", user == null ? Map.of() : user);
        out.put("stats", stats);
        out.put("category", category);
        return out;
    }
}
