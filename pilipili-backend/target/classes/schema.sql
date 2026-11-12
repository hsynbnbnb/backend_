-- pilipili 契约 v1 数据库结构（MySQL 8+/9）
-- 首次启动由 spring.sql.init 自动执行；全部使用 IF NOT EXISTS / INSERT IGNORE，可重复执行。
CREATE DATABASE IF NOT EXISTS pilipili DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pilipili;

CREATE TABLE IF NOT EXISTS app_user (
    uid BIGINT PRIMARY KEY,
    username VARCHAR(64) NOT NULL DEFAULT '',
    password VARCHAR(128) NOT NULL DEFAULT '123456',
    nickname VARCHAR(64) DEFAULT '',
    avatar_url VARCHAR(512) DEFAULT '',
    background VARCHAR(512) DEFAULT '',
    gender INT DEFAULT 0,
    description VARCHAR(512) DEFAULT '',
    exp INT DEFAULT 0,
    coin DECIMAL(12,2) DEFAULT 0,
    vip INT DEFAULT 0,
    state INT DEFAULT 0,
    role INT DEFAULT 0,
    auth INT DEFAULT 0,
    auth_msg VARCHAR(255) DEFAULT '',
    follows_count INT DEFAULT 0,
    fans_count INT DEFAULT 0,
    love_count INT DEFAULT 0,
    play_count INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS channel (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mc_id VARCHAR(32) NOT NULL,
    mc_name VARCHAR(64) NOT NULL,
    sc_id VARCHAR(32) NOT NULL,
    sc_name VARCHAR(64) NOT NULL,
    sort_no INT DEFAULT 0,
    UNIQUE KEY uk_channel_sc (mc_id, sc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS video (
    vid BIGINT PRIMARY KEY,
    uid BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type INT DEFAULT 1,
    auth INT DEFAULT 0,
    duration INT DEFAULT 0,
    mc_id VARCHAR(32) DEFAULT '',
    sc_id VARCHAR(32) DEFAULT '',
    mc_name VARCHAR(64) DEFAULT '',
    sc_name VARCHAR(64) DEFAULT '',
    tags VARCHAR(255) DEFAULT '',
    descr TEXT,
    cover_url VARCHAR(512) DEFAULT '',
    video_url VARCHAR(512) DEFAULT '',
    status INT DEFAULT 1,
    upload_date VARCHAR(32) DEFAULT '',
    delete_date VARCHAR(32) NULL,
    play BIGINT DEFAULT 0,
    danmu INT DEFAULT 0,
    good INT DEFAULT 0,
    bad INT DEFAULT 0,
    coin INT DEFAULT 0,
    collect INT DEFAULT 0,
    share INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    KEY idx_video_mc (mc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS favorite_folder (
    fid BIGINT PRIMARY KEY,
    uid BIGINT NOT NULL,
    type INT DEFAULT 0,
    visible INT DEFAULT 1,
    title VARCHAR(128) NOT NULL,
    count INT DEFAULT 0,
    description VARCHAR(255) DEFAULT '',
    play_count INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS danmaku (
    id BIGINT PRIMARY KEY,
    vid BIGINT NOT NULL,
    uid BIGINT DEFAULT 0,
    content VARCHAR(255) NOT NULL,
    time_point INT DEFAULT 0,
    mode INT DEFAULT 1,
    fontsize INT DEFAULT 22,
    color VARCHAR(16) DEFAULT '#FFFFFF',
    KEY idx_danmaku_vid (vid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_comment (
    id BIGINT PRIMARY KEY,
    vid BIGINT NOT NULL,
    uid BIGINT DEFAULT 0,
    root_id BIGINT DEFAULT 0,
    parent_id BIGINT DEFAULT 0,
    to_user_id BIGINT DEFAULT 0,
    content VARCHAR(1000) NOT NULL,
    love INT DEFAULT 0,
    bad INT DEFAULT 0,
    create_time VARCHAR(32) DEFAULT '',
    is_top INT DEFAULT 0,
    is_deleted INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    KEY idx_comment_vid (vid, root_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS trending (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content VARCHAR(128) NOT NULL,
    type INT DEFAULT 1,
    sort_no INT DEFAULT 0,
    UNIQUE KEY uk_trending_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mall_category (
    name VARCHAR(32) PRIMARY KEY,
    description VARCHAR(64) DEFAULT '',
    color VARCHAR(16) DEFAULT '#9499a0',
    sort_no INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product (
    id VARCHAR(16) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    cover_seed VARCHAR(64) DEFAULT '',
    cover_url VARCHAR(512) DEFAULT '',
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NULL,
    sold VARCHAR(32) DEFAULT '0',
    shop VARCHAR(128) DEFAULT '',
    tags VARCHAR(255) DEFAULT '',
    category VARCHAR(32) DEFAULT '',
    KEY idx_product_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_review (
    id VARCHAR(16) PRIMARY KEY,
    product_id VARCHAR(16) DEFAULT 'p1',
    user_name VARCHAR(64) DEFAULT '',
    avatar_seed VARCHAR(64) DEFAULT '',
    content TEXT,
    review_date VARCHAR(32) DEFAULT '',
    rating INT DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mall_order (
    id VARCHAR(32) PRIMARY KEY,
    shop VARCHAR(128) DEFAULT '',
    status VARCHAR(32) DEFAULT 'pending',
    total DECIMAL(10,2) DEFAULT 0,
    created_at VARCHAR(32) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(32) NOT NULL,
    product_id VARCHAR(16) NOT NULL,
    title VARCHAR(255) DEFAULT '',
    cover_seed VARCHAR(64) DEFAULT '',
    price DECIMAL(10,2) DEFAULT 0,
    qty INT DEFAULT 1,
    KEY idx_order_item_order (order_id),
    UNIQUE KEY uk_order_item (order_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_item (
    id VARCHAR(32) PRIMARY KEY,
    product_id VARCHAR(16) NOT NULL,
    qty INT DEFAULT 1,
    selected TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS moment (
    id VARCHAR(16) PRIMARY KEY,
    author_name VARCHAR(64) DEFAULT '',
    author_avatar_seed VARCHAR(64) DEFAULT '',
    author_fans VARCHAR(32) DEFAULT '',
    time_text VARCHAR(64) DEFAULT '',
    type VARCHAR(16) DEFAULT 'image',
    content TEXT,
    images TEXT,
    video_cover VARCHAR(64) DEFAULT '',
    video_duration VARCHAR(16) DEFAULT '',
    shares INT DEFAULT 0,
    comments INT DEFAULT 0,
    likes INT DEFAULT 0,
    liked TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_message (
    id VARCHAR(32) PRIMARY KEY,
    type VARCHAR(32) DEFAULT 'system',
    title VARCHAR(255) DEFAULT '',
    content VARCHAR(1000) DEFAULT '',
    sender_name VARCHAR(64) DEFAULT '',
    is_read TINYINT DEFAULT 0,
    created_at VARCHAR(32) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS msg_unread (
    type VARCHAR(32) PRIMARY KEY,
    unread_count INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 契约种子：未在 Java 服务层单独迁移的接口，从该表读取响应（数据仍在数据库中）
CREATE TABLE IF NOT EXISTS contract_seed (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    method VARCHAR(8) NOT NULL,
    path VARCHAR(255) NOT NULL,
    code INT NOT NULL DEFAULT 200,
    message VARCHAR(255) DEFAULT 'OK',
    data_json LONGTEXT,
    source_module VARCHAR(64) DEFAULT '',
    UNIQUE KEY uk_contract_method_path (method, path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 写操作留痕，用于验证「数据真正落库」而不是内存 mock
CREATE TABLE IF NOT EXISTS user_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uid BIGINT DEFAULT 0,
    event_type VARCHAR(64) NOT NULL,
    biz_id VARCHAR(64) DEFAULT '',
    detail VARCHAR(512) DEFAULT '',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
