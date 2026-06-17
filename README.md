# 贝壳青创汇 · BeikeStartups

## 简介

**贝壳青创汇**（Beike Startups）是北京科技大学推出的**面向高校创业生态的项目展示与资源匹配平台**。平台汇聚校园内经过认证的创业项目，连接学生创业团队、校外导师、投资人和产业资源方，打造真实、高效、开放的校园创投生态。

### 核心能力

- **项目展示**：创业团队可发布项目信息、商业计划书，获得平台曝光
- **资源匹配**：智能对接投资人、导师与产业资源，实现高效的投融资与辅导
- **团队管理**：支持团队成员邀请、入队申请、角色管理、所有权转移
- **招募对接**：发布招募需求，接收与审批人才响应
- **活动运营**：发布创业活动、管理报名、活动签到
- **严格认证**：多级审核机制，确保平台上项目与团队的真实性

---

## 技术栈

前后端分离架构。

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 (App Router) + React 19 |
| 开发语言 | TypeScript |
| UI 组件库 | Ant Design 6 + Ant Design Icons |
| 样式方案 | Tailwind CSS 4 |
| 包管理器 | pnpm |
| 后端语言 | Go 1.25 |
| HTTP 框架 | Gin |
| ORM | GORM (PostgreSQL) |
| 认证 | JWT (golang-jwt/v5) |
| 数据库 | PostgreSQL |
| 密码加密 | golang.org/x/crypto (bcrypt) |

---

## 目录结构

```
BeikeStartups/
├── README.md                      # 本文件
├── AGENT.md                       # AI 编码智能体指南
├── LICENSE                        # 许可证
│
├── docs/
│   └── DESIGN.md                  # 系统设计文档（身份系统、对象系统、状态机）
│
├── backend/                       # Go 后端服务
│   ├── main.go                    # 入口：加载配置 → 连接数据库 → 启动路由
│   ├── go.mod / go.sum            # Go 模块依赖
│   ├── .env.example               # 环境变量模板
│   ├── .gitignore
│   ├── 项目结构.md                 # 后端架构说明
│   ├── 接口文档.md                 # API 接口文档
│   ├── config/
│   │   └── config.go              # 环境变量加载与配置结构
│   ├── database/
│   │   └── database.go            # PostgreSQL 连接与 GORM 初始化
│   ├── model/
│   │   └── models.go              # 数据模型定义（User, Team, Project, Recruitment 等）
│   ├── middleware/
│   │   ├── auth.go                # JWT 认证中间件 + 角色权限控制
│   │   └── jwt.go                 # Token 生成与验证
│   ├── handler/
│   │   ├── auto.go                # 注册、登录、用户信息、角色申请、管理员接口
│   │   ├── application.go         # 创业申请 CRUD、提交、审批
│   │   ├── team.go                # 团队管理、成员、邀请、入队申请、所有权转移
│   │   ├── project.go             # 项目管理、上下架、收藏、BP/对接申请
│   │   ├── recruitment.go         # 招募管理、发布、完成、作废
│   │   ├── response.go            # 招募响应的创建与审批
│   │   ├── resource.go            # 资源机会管理
│   │   ├── event.go               # 活动发布、报名、签到管理
│   │   ├── banner.go              # 首页轮播图管理
│   │   └── upload.go              # 文件上传
│   ├── repository/
│   │   ├── application_repository.go
│   │   ├── team_repository.go
│   │   └── user_repository.go
│   ├── service/
│   │   ├── auth_service.go        # 认证与用户业务逻辑
│   │   └── team_service.go        # 团队业务逻辑
│   ├── response/
│   │   └── response.go            # 统一响应结构
│   ├── router/
│   │   └── router.go              # 路由注册、CORS、中间件挂载
│   └── uploads/                   # 上传文件存储目录
│
└── frontend/                      # Next.js 前端
    ├── package.json               # 依赖与脚本
    ├── next.config.ts             # Next.js 配置
    ├── tsconfig.json              # TypeScript 配置
    ├── postcss.config.mjs         # PostCSS (Tailwind) 配置
    ├── .gitignore
    ├── 项目结构.md                 # 前端架构说明
    ├── 接口文档.md                 # 前端接口对接文档
    ├── app/                       # Next.js App Router 页面
    │   ├── layout.tsx             # 根布局
    │   ├── globals.css            # 全局样式
    │   ├── page.tsx               # 首页（含粒子效果、数据大屏）
    │   ├── login/page.tsx         # 登录
    │   ├── register/page.tsx      # 注册
    │   ├── dashboard/             # 用户控制台
    │   ├── projects/              # 项目列表 / 创建 / 详情
    │   ├── teams/                 # 团队列表 / 创建 / 详情 / 编辑
    │   ├── recruitments/          # 招募列表 / 创建 / 详情
    │   ├── applications/          # 创业申请
    │   ├── events/                # 活动列表 / 详情
    │   ├── resources/             # 资源机会
    │   ├── responses/             # 招募响应
    │   ├── profile/               # 个人中心
    │   ├── about/                 # 关于页
    │   └── admin/                 # 管理后台
    │       ├── login/             # 管理员登录
    │       ├── users/             # 用户管理
    │       ├── teams/             # 团队审核
    │       ├── projects/          # 项目审核
    │       ├── verifications/     # 认证管理
    │       ├── banners/           # 轮播图管理
    │       ├── events/            # 活动管理
    │       ├── resources/         # 资源管理
    │       └── admins/            # 管理员管理
    ├── components/
    │   ├── Applications/          # 申请相关组件
    │   ├── Auth/                  # 登录/注册表单
    │   ├── Common/                # 通用组件（Banner、Loading、StatusBadge）
    │   ├── Layout/                # 布局组件（Header、Footer、Sidebar）
    │   ├── Projects/              # 项目卡片/列表/表单
    │   ├── Recruitments/          # 招募卡片/列表/表单
    │   └── Teams/                 # 团队卡片/列表/表单
    ├── context/
    │   └── AuthContext.tsx         # 全局认证上下文
    ├── hooks/
    │   ├── useApi.ts              # API 调用 Hook
    │   └── useAuth.ts             # 认证 Hook
    ├── lib/
    │   ├── api.ts                 # API 客户端封装
    │   ├── auth.ts                # 认证工具函数
    │   └── utils.ts               # 通用工具函数
    └── types/
        └── index.ts               # TypeScript 类型定义
```

---

## 快速开始

### 环境要求

- **Go** ≥ 1.25
- **Node.js** ≥ 20
- **pnpm** (推荐)
- **PostgreSQL** ≥ 14

### 1. 克隆仓库

```bash
git clone <repo-url>
cd BeikeStartups
```

### 2. 启动后端

```bash
cd backend

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的数据库连接信息

# 安装依赖并启动
go mod tidy
go run main.go
```

服务默认运行在 `http://localhost:8080`。

#### 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `8080` |
| `DB_HOST` | 数据库地址 | `localhost` |
| `DB_PORT` | 数据库端口 | `5432` |
| `DB_USER` | 数据库用户 | `postgres` |
| `DB_PASSWORD` | 数据库密码 | `password` |
| `DB_NAME` | 数据库名 | `beike_startups` |
| `JWT_SECRET` | JWT 签名密钥 | —（生产环境务必修改） |
| `CORS_ORIGIN` | 允许的前端源 | `http://localhost:3000` |
| `APP_ENV` | 运行环境 | `development` |

### 3. 启动前端

```bash
cd frontend

# 安装依赖
pnpm install

# 首次安装后可能需要执行
pnpm approve-builds

# 启动开发服务器
pnpm dev
```

前端开发服务器运行在 `http://localhost:3000`。

### 4. 构建部署

```bash
# 前端构建
cd frontend
pnpm build
pnpm start

# 后端构建
cd backend
go build -o BeikeStartups .
./BeikeStartups
```

---

## 身份系统

平台使用多角色身份体系，详见 [docs/DESIGN.md](docs/DESIGN.md)：

| 角色 | 标识 | 说明 |
|------|------|------|
| 学生 | `student` | 所有注册用户的默认初始身份 |
| 创业团队 | `team_owner` / `team_member` | 学生通过审批后获得的附加身份 |
| 导师 | `mentor` | 企业家、创业导师、校友导师、行业专家 |
| 投资人 | `investor` | 投资机构、天使投资人、产业投资人 |
| 合作人 | `partner` | 企业园区、孵化器、服务机构、媒体 |
| 管理员 | `admin` | 平台日常运营管理 |
| 超级管理员 | `super_admin` | 平台最高权限 |

---

## 对象状态机

平台核心对象（创业申请、项目、招募、招募响应）均遵循严格的状态机流转，详见 [docs/DESIGN.md](docs/DESIGN.md) 中的 mermaid 状态图。

### 创业申请
`Draft → Pending → Approved / Rejected`（可随时 Cancel）

### 项目
`Draft → PendingOnline → Online → PendingOffline → Offline`
（支持直接上架、管理员审批、作废操作）

### 招募
`Active → Solved / Invalid`

### 招募响应
`Pending → Accepted / Rejected / Invalid`

---

## API 概览

后端提供 RESTful API，完整接口文档见 `backend/接口文档.md` 和 `frontend/接口文档.md`。

### 主要接口模块

| 模块 | 前缀 | 说明 |
|------|------|------|
| 认证 | `/api/auth` | 注册、登录、个人信息、角色申请 |
| 用户 | `/api/users` | 公开用户信息查询 |
| 管理 | `/api/admin` | 用户管理、角色管理、管理员管理 |
| 创业申请 | `/api/applications` | 申请 CRUD、提交、审批 |
| 团队 | `/api/teams` | 团队管理、成员、邀请、入队申请 |
| 项目 | `/api/projects` | 项目 CRUD、上下架、收藏、BP/对接申请 |
| 招募 | `/api/recruitments` | 招募发布、响应、审批 |
| 活动 | `/api/events` | 活动管理、报名、签到 |
| 资源 | `/api/resources` | 资源机会管理 |
| 轮播图 | `/api/banners` | 首页轮播图管理 |
| 上传 | `/api/uploads` | 文件上传 |

### 认证方式

使用 JWT Bearer Token。登录成功后返回的 `token` 需在后续请求的 `Authorization` 头中携带：

```
Authorization: Bearer <token>
```

---

## 前端页面路由

| 路由 | 说明 | 权限 |
|------|------|------|
| `/` | 首页（粒子交互、数据大屏、精选项目） | 公开 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/projects` | 项目列表 | 公开（登录后可见完整内容） |
| `/projects/:id` | 项目详情 | 公开（登录后可见完整内容） |
| `/projects/create` | 创建项目 | 已登录（创业团队） |
| `/teams` | 团队列表 | 已登录 |
| `/teams/:id` | 团队详情 | 已登录 |
| `/teams/create` | 创建团队 | 已登录 |
| `/recruitments` | 招募列表 | 公开 |
| `/recruitments/create` | 发布招募 | 已登录（创业团队） |
| `/events` | 活动列表 | 公开 |
| `/applications` | 创业申请 | 已登录（学生） |
| `/dashboard` | 用户控制台 | 已登录 |
| `/profile` | 个人中心 | 已登录 |
| `/admin` | 管理后台 | 管理员/超级管理员 |

---

## 开发指南

### AI 编码智能体

项目包含 [AGENT.md](AGENT.md)，为 AI 编码助手提供了本项目的专有开发约定和技术参考。AI 智能体在开发前应首先阅读该文件及其引用的文档。

### 设计文档

完整的系统设计文档位于 [docs/DESIGN.md](docs/DESIGN.md)，涵盖：
- 身份系统定义与权限矩阵
- 对象系统状态机
- 网站功能规划

### 后端架构

后端采用分层架构：`router → handler → service → repository → model`，各层职责明确。详见 `backend/项目结构.md`。

### 前端架构

前端基于 Next.js App Router，使用 Ant Design 组件库构建 UI，Tailwind CSS 处理样式，自定义粒子物理引擎实现首页交互效果。详见 `frontend/项目结构.md`。

---

## License

本项目遵循 LICENSE 文件中规定的许可条款。
