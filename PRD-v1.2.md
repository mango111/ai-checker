# PRD - AI Checker v1.2 用户系统 & 支付

## 1. 目标

- 用户注册/登录
- 付费订阅
- 检测次数与账户绑定

## 2. 技术选型

| 功能 | 方案 | 原因 |
|------|------|------|
| 用户系统 | Supabase Auth | 免费、简单、自带邮箱登录 |
| 数据库 | Supabase PostgreSQL | 免费 500MB |
| 支付 | LemonSqueezy | 简单、支持国际卡、自动处理订阅 |

## 3. 功能需求

### 3.1 用户系统（P0）
- 邮箱注册/登录
- 魔法链接登录（无密码）
- 登录状态持久化

### 3.2 套餐体系（P0）
| 套餐 | 价格 | 次数/月 | 功能 |
|------|------|---------|------|
| Free | $0 | 10 | 基础检测 |
| Pro | $9/月 | 无限 | + 历史记录 |

### 3.3 支付流程（P0）
1. 点击升级 → 跳转 LemonSqueezy
2. 支付成功 → Webhook 回调
3. 更新用户套餐

### 3.4 数据库表
```sql
-- 用户扩展信息
create table profiles (
  id uuid references auth.users primary key,
  plan text default 'free',
  usage_count int default 0,
  usage_reset_at timestamp,
  created_at timestamp default now()
);
```

## 4. MVP 范围

本次实现：
- [x] Supabase 集成
- [x] 邮箱登录
- [x] 用户检测次数记录
- [x] LemonSqueezy 支付链接
- [ ] Webhook 自动升级（下版本）

## 5. 验收标准

- [ ] 能注册/登录
- [ ] 登录后显示用户信息
- [ ] 检测次数与账户绑定
- [ ] 点击升级能跳转支付页
