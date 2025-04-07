# 物品审批系统 API 接口文档

本文档定义了物品审批系统前端所需的所有后端接口，包括接口URL、请求方法、请求参数、响应数据格式及错误处理。

## 目录

1. [用户认证接口](#1-用户认证接口)
2. [用户管理接口](#2-用户管理接口)
3. [申请管理接口](#3-申请管理接口)
4. [统计数据接口](#4-统计数据接口)
5. [系统配置接口](#5-系统配置接口)
6. [通知接口](#6-通知接口)
7. [错误码说明](#7-错误码说明)

## 1. 用户认证接口

### 1.1 用户登录

```
POST /api/auth/login
```

**请求参数**

| 参数名   | 类型   | 必填 | 说明     |
|---------|--------|-----|----------|
| username | string | 是   | 用户名   |
| password | string | 是   | 密码     |
| remember | boolean | 否  | 是否记住登录状态 |

**响应数据**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "12345",
    "username": "jxj",
    "role": "user",  // 用户角色: "admin" 或 "user"
    "name": "张三",
    "avatar": "avatar_url.jpg"
  }
}
```

### 1.2 用户登出

```
POST /api/auth/logout
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**响应数据**

```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

### 1.3 注册新用户

```
POST /api/auth/register
```

**请求参数**

| 参数名     | 类型   | 必填 | 说明     |
|-----------|--------|-----|----------|
| username  | string | 是   | 用户名   |
| password  | string | 是   | 密码     |
| confirmPassword | string | 是 | 确认密码 |
| name      | string | 是   | 真实姓名 |
| email     | string | 是   | 电子邮箱 |
| department | string | 否   | 部门     |

**响应数据**

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "12346",
    "username": "lisi"
  }
}
```

### 1.4 重置密码

```
POST /api/auth/reset-password
```

**请求参数**

| 参数名     | 类型   | 必填 | 说明     |
|-----------|--------|-----|----------|
| account   | string | 是   | 账号信息（用户名或邮箱）|
| newPassword | string | 是   | 新密码   |
| confirmPassword | string | 是 | 确认新密码 |
| verifyCode | string | 是   | 验证码   |

**响应数据**

```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

### 1.5 获取验证码

```
POST /api/auth/send-verify-code
```

**请求参数**

| 参数名  | 类型   | 必填 | 说明              |
|--------|--------|-----|-------------------|
| account | string | 是   | 账号信息（用户名或邮箱）|
| type    | string | 是   | 验证码类型: "reset_password" |

**响应数据**

```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "expireTime": 300  // 验证码有效期（秒）
  }
}
```

## 2. 用户管理接口

### 2.1 获取当前用户信息

```
GET /api/users/current
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "12345",
    "username": "jxj",
    "name": "张三",
    "role": "user",
    "email": "zhangsan@example.com",
    "department": "研发部",
    "avatar": "avatar_url.jpg",
    "createTime": "2025-04-01T08:00:00Z"
  }
}
```

### 2.2 获取用户列表（管理员）

```
GET /api/users
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**请求参数**

| 参数名    | 类型   | 必填 | 说明         |
|----------|--------|-----|--------------|
| page     | integer | 否  | 页码，默认1   |
| pageSize | integer | 否  | 每页条数，默认10 |
| keyword  | string  | 否  | 搜索关键词    |
| role     | string  | 否  | 筛选角色     |

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "list": [
      {
        "userId": "12345",
        "username": "jxj",
        "name": "张三",
        "role": "user",
        "email": "zhangsan@example.com",
        "department": "研发部",
        "createTime": "2025-04-01T08:00:00Z"
      },
      // ...更多用户
    ]
  }
}
```

## 3. 申请管理接口

### 3.1 提交新申请

```
POST /api/applications
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**请求参数**

| 参数名    | 类型    | 必填 | 说明         |
|----------|---------|-----|--------------|
| itemName | string  | 是   | 物品名称     |
| quantity | integer | 是   | 数量         |
| purpose  | string  | 是   | 用途说明     |
| urgency  | string  | 是   | 紧急程度: "low", "medium", "high" |

**响应数据**

```json
{
  "code": 200,
  "message": "申请提交成功",
  "data": {
    "applicationId": "APL-001",
    "createTime": "2025-04-01T10:30:00Z",
    "status": "pending"
  }
}
```

### 3.2 获取申请列表

```
GET /api/applications
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**请求参数**

| 参数名     | 类型    | 必填 | 说明          |
|-----------|---------|-----|---------------|
| page      | integer | 否   | 页码，默认1    |
| pageSize  | integer | 否   | 每页条数，默认10 |
| status    | string  | 否   | 状态筛选: "pending", "approved", "rejected", "all" |
| startDate | string  | 否   | 开始日期，格式: YYYY-MM-DD |
| endDate   | string  | 否   | 结束日期，格式: YYYY-MM-DD |
| keyword   | string  | 否   | 搜索关键词     |

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "list": [
      {
        "id": "APL-001",
        "itemName": "笔",
        "quantity": 1,
        "purpose": "用于日常办公记录",
        "urgency": "中",
        "applicant": "张三",
        "applicantId": "12345",
        "date": "2025-04-01",
        "status": "rejected",
        "statusDate": "2025-04-01",
        "statusBy": "admin"
      },
      // ...更多申请
    ]
  }
}
```

### 3.3 获取申请详情

```
GET /api/applications/{applicationId}
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**路径参数**

| 参数名         | 类型   | 必填 | 说明        |
|---------------|--------|-----|-------------|
| applicationId | string | 是   | 申请ID      |

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "APL-001",
    "itemName": "笔",
    "quantity": 1,
    "purpose": "用于日常办公记录",
    "urgency": "中",
    "applicant": "张三",
    "applicantId": "12345",
    "department": "研发部",
    "date": "2025-04-01",
    "status": "rejected",
    "statusDate": "2025-04-01",
    "statusBy": "admin",
    "statusReason": "已有库存",
    "comments": [
      {
        "id": "CMT-001",
        "content": "请确认是否有特殊要求",
        "createTime": "2025-04-01T09:30:00Z",
        "userId": "admin",
        "userName": "管理员"
      }
    ]
  }
}
```

### 3.4 审批申请（管理员）

```
PUT /api/applications/{applicationId}/status
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**路径参数**

| 参数名         | 类型   | 必填 | 说明        |
|---------------|--------|-----|-------------|
| applicationId | string | 是   | 申请ID      |

**请求参数**

| 参数名     | 类型   | 必填 | 说明         |
|-----------|--------|-----|--------------|
| status    | string | 是   | 状态: "approved" 或 "rejected" |
| reason    | string | 否   | 审批理由      |

**响应数据**

```json
{
  "code": 200,
  "message": "审批成功",
  "data": {
    "id": "APL-001",
    "status": "approved",
    "statusDate": "2025-04-02T10:15:00Z"
  }
}
```

### 3.5 添加申请评论

```
POST /api/applications/{applicationId}/comments
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**路径参数**

| 参数名         | 类型   | 必填 | 说明        |
|---------------|--------|-----|-------------|
| applicationId | string | 是   | 申请ID      |

**请求参数**

| 参数名   | 类型   | 必填 | 说明     |
|---------|--------|-----|----------|
| content | string | 是   | 评论内容 |

**响应数据**

```json
{
  "code": 200,
  "message": "评论添加成功",
  "data": {
    "id": "CMT-002",
    "content": "已确认无特殊要求",
    "createTime": "2025-04-01T11:20:00Z"
  }
}
```

## 4. 统计数据接口

### 4.1 获取用户申请统计

```
GET /api/statistics/user
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "pending": 0,
    "approved": 1,
    "rejected": 1,
    "total": 2,
    "recentApplications": [
      {
        "id": "APL-001",
        "itemName": "笔",
        "date": "2025-04-01",
        "status": "rejected"
      },
      {
        "id": "APL-002",
        "itemName": "笔",
        "date": "2025-04-01",
        "status": "approved"
      }
    ]
  }
}
```

### 4.2 获取系统统计数据（管理员）

```
GET /api/statistics/system
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**请求参数**

| 参数名      | 类型   | 必填 | 说明            |
|------------|--------|-----|-----------------|
| timeRange  | string | 否   | 时间范围: "day", "week", "month", "year", 默认"week" |

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "overview": {
      "pending": 0,
      "approved": 1,
      "rejected": 1,
      "total": 2,
      "userCount": 5
    },
    "itemTypeStats": [
      {
        "type": "文具",
        "count": 7
      },
      {
        "type": "电子设备",
        "count": 5
      },
      {
        "type": "办公用品",
        "count": 3
      },
      {
        "type": "家具",
        "count": 2
      },
      {
        "type": "其他",
        "count": 1
      }
    ],
    "statusDistribution": {
      "pending": 0,
      "approved": 50,
      "rejected": 50
    },
    "trendData": {
      "dates": ["2025-03-26", "2025-03-27", "2025-03-28", "2025-03-29", "2025-03-30", "2025-03-31", "2025-04-01"],
      "applications": [1, 2, 0, 3, 5, 2, 2],
      "approvals": [1, 2, 0, 2, 3, 1, 1],
      "rejections": [0, 0, 0, 1, 2, 1, 1]
    }
  }
}
```

## 5. 系统配置接口

### 5.1 获取系统配置（管理员）

```
GET /api/settings
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "systemName": "物品审批系统",
    "emailNotification": true,
    "itemCategories": ["文具", "电子设备", "办公用品", "家具", "其他"],
    "defaultPageSize": 10,
    "autoApproval": false
  }
}
```

### 5.2 更新系统配置（管理员）

```
PUT /api/settings
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**请求参数**

| 参数名           | 类型     | 必填 | 说明         |
|-----------------|----------|-----|--------------|
| systemName      | string   | 否   | 系统名称      |
| emailNotification | boolean | 否  | 邮件通知开关  |
| itemCategories  | array    | 否   | 物品分类列表  |
| defaultPageSize | integer  | 否   | 默认分页大小  |
| autoApproval    | boolean  | 否   | 自动审批开关  |

**响应数据**

```json
{
  "code": 200,
  "message": "配置更新成功",
  "data": null
}
```

## 6. 通知接口

### 6.1 获取通知列表

```
GET /api/notifications
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**请求参数**

| 参数名    | 类型    | 必填 | 说明          |
|----------|---------|-----|---------------|
| page     | integer | 否   | 页码，默认1    |
| pageSize | integer | 否   | 每页条数，默认10 |
| read     | boolean | 否   | 是否已读      |

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "unreadCount": 2,
    "list": [
      {
        "id": "NTF-001",
        "title": "申请已批准",
        "content": "您的申请#APL-002已被管理员批准",
        "createTime": "2025-04-01T11:30:00Z",
        "read": false,
        "type": "approval",
        "relatedId": "APL-002"
      },
      // ...更多通知
    ]
  }
}
```

### 6.2 标记通知为已读

```
PUT /api/notifications/{notificationId}/read
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**路径参数**

| 参数名         | 类型   | 必填 | 说明        |
|---------------|--------|-----|-------------|
| notificationId | string | 是   | 通知ID      |

**响应数据**

```json
{
  "code": 200,
  "message": "已标记为已读",
  "data": null
}
```

### 6.3 标记所有通知为已读

```
PUT /api/notifications/read-all
```

**请求头**

| 参数名        | 类型   | 必填 | 说明          |
|--------------|--------|-----|---------------|
| Authorization | string | 是   | Bearer {token} |

**响应数据**

```json
{
  "code": 200,
  "message": "所有通知已标记为已读",
  "data": null
}
```

## 7. 错误码说明

| 错误码  | 说明                    |
|--------|------------------------|
| 200    | 成功                    |
| 400    | 请求参数错误             |
| 401    | 未授权或token失效        |
| 403    | 无权限访问               |
| 404    | 资源不存在               |
| 409    | 资源冲突                 |
| 422    | 请求参数验证失败          |
| 500    | 服务器内部错误            |

**错误响应格式**

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null
}
``` 