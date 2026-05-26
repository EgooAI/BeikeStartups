# BeikeStartups

## 简介

**贝壳青创汇**（Beike Startups）是北京科技大学提出的一种**面向高校创业生态的项目展示与资源匹配平台**。

## 开发

### 技术栈

前后端分离架构。

- 前端：React 框架, TypeScript 语言, Ant Design 组件库
- 后端：Go 语言, Gin 框架，GORM 库
- 数据库：PostgreSQL

### 目录结构

```
<root>
|-- backend/
|   '-- go.mod 及相关后端代码
|-- frontend/
|   '-- package.json 及相关前端代码
'-- docs/
    '-- DESIGN.md 设计文档
```

### 快速开始

前端开发：

```bash
cd frontend
# 确保已安装 pnpm 包管理器后执行以下命令
pnpm install
pnpm approve-builds # 首次安装依赖后可能需要执行
pnpm dev
```

后端开发：

```bash
cd backend
# 确保已安装 Go 开发环境后执行以下命令
go mod tidy
go run main.go
```
