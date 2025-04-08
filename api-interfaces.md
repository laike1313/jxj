# 物品审批系统后端接口文档

## 基础信息

- 基础URL: `https://mvlcsuqfvvmt.sealoshzh.site/api/v1`
- 认证方式: JWT (JSON Web Token)
- 请求头: 
  ```
  Content-Type: application/json
  Authorization: Bearer {token} (除登录/注册接口外的所有接口都需要)
  ```

## 统一响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 返回数据...
  }
}
```

或

```json
{
  "success": true,
  "message": "操作成功消息",
  "data": {
    // 可选的返回数据...
  }
}
```

### 错误响应

```json
{
  "success": false,
  "code": 错误码,
  "message": "错误描述"
}
```

## 1. 用户认证

### 1.1 用户登录

- **URL**: `/auth/login`
- **方法**: POST
- **描述**: 用户登录并获取访问令牌
- **请求参数**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "用户ID",
        "username": "用户名",
        "name": "显示名称",
        "role": "用户角色(admin/user)",
        "avatar": "头像URL或Base64"
      }
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 401,
    "message": "用户名或密码不正确"
  }
  ```

### 1.2 用户注册

- **URL**: `/auth/register`
- **方法**: POST
- **描述**: 注册新用户
- **请求参数**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "name": "显示名称",
    "email": "电子邮箱"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "id": "用户ID",
      "username": "用户名"
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 400,
    "message": "输入的值已存在"
  }
  ```

### 1.3 找回密码

- **URL**: `/auth/forgot-password`
- **方法**: POST
- **描述**: 发送密码重置邮件
- **请求参数**:
  ```json
  {
    "email": "注册时的电子邮箱"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "密码重置链接已发送到您的邮箱"
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 404,
    "message": "该邮箱未注册"
  }
  ```

### 1.4 重置密码

- **URL**: `/auth/reset-password`
- **方法**: POST
- **描述**: 使用重置令牌设置新密码
- **请求参数**:
  ```json
  {
    "token": "重置令牌(从邮件链接获取)",
    "password": "新密码"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "密码已重置，请使用新密码登录"
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 400,
    "message": "无效的重置令牌"
  }
  ```

## 2. 用户管理

### 2.1 获取用户列表

- **URL**: `/users`
- **方法**: GET
- **描述**: 获取所有用户列表(仅管理员可用)
- **查询参数**:
  - `page`: 页码(默认1)
  - `limit`: 每页数量(默认10)
  - `role`: 按角色筛选(可选)
  - `search`: 搜索关键词(可选)
  - `sort`: 排序字段(默认registerTime)
  - `order`: 排序方式(asc/desc，默认desc)
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "total": 总用户数,
      "page": 当前页码,
      "limit": 每页数量,
      "users": [
        {
          "id": "用户ID",
          "username": "用户名",
          "name": "显示名称",
          "email": "电子邮箱",
          "role": "角色",
          "avatar": "头像URL",
          "registerTime": "注册时间",
          "lastLoginTime": "最后登录时间"
        }
      ]
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 403,
    "message": "用户角色 user 无权访问此资源"
  }
  ```

### 2.2 获取用户详情

- **URL**: `/users/{userId}`
- **方法**: GET
- **描述**: 获取指定用户的详细信息
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "name": "显示名称",
      "email": "电子邮箱",
      "role": "角色",
      "avatar": "头像URL",
      "phone": "电话号码",
      "registerTime": "注册时间",
      "lastLoginTime": "最后登录时间"
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 404,
    "message": "找不到ID为{userId}的用户"
  }
  ```

### 2.3 创建用户

- **URL**: `/users`
- **方法**: POST
- **描述**: 管理员创建新用户(仅管理员可用)
- **请求参数**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "name": "显示名称",
    "email": "电子邮箱",
    "role": "角色(admin/user)",
    "phone": "电话号码(可选)"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "role": "角色"
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 400,
    "message": "输入的值已存在"
  }
  ```

### 2.4 更新用户信息

- **URL**: `/users/{userId}`
- **方法**: PUT
- **描述**: 更新用户信息(用户本人或管理员)
- **请求参数**:
  ```json
  {
    "name": "显示名称",
    "email": "电子邮箱",
    "phone": "电话号码",
    "avatar": "头像URL或Base64",
    "role": "角色(仅管理员可修改)"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "name": "显示名称",
      "email": "电子邮箱",
      "phone": "电话号码",
      "avatar": "头像URL",
      "role": "角色"
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 403,
    "message": "未授权更新此用户"
  }
  ```

### 2.5 修改密码

- **URL**: `/users/{userId}/password`
- **方法**: PATCH
- **描述**: 修改用户密码(用户本人或管理员)
- **请求参数**:
  ```json
  {
    "currentPassword": "当前密码(用户本人修改时需要)",
    "newPassword": "新密码"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "密码修改成功"
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 401,
    "message": "当前密码不正确"
  }
  ```

### 2.6 删除用户

- **URL**: `/users/{userId}`
- **方法**: DELETE
- **描述**: 删除用户(仅管理员可用)
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "用户已删除"
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 403,
    "message": "用户角色 user 无权访问此资源"
  }
  ```

## 3. 申请管理

### 3.1 获取申请列表

- **URL**: `/applications`
- **方法**: GET
- **描述**: 获取申请列表(管理员可查看所有，普通用户只能查看自己的)
- **查询参数**:
  - `page`: 页码(默认1)
  - `limit`: 每页数量(默认10)
  - `status`: 申请状态筛选(pending/approved/rejected，可选)
  - `startDate`: 起始日期(可选)
  - `endDate`: 结束日期(可选)
  - `search`: 搜索关键词(可选)
  - `sort`: 排序字段(默认date)
  - `order`: 排序方式(asc/desc，默认desc)
  - `category`: 物品类别(可选)
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "total": 总申请数,
      "page": 当前页码,
      "limit": 每页数量,
      "applications": [
        {
          "id": "申请ID",
          "itemName": "物品名称",
          "itemCategory": "物品类别",
          "quantity": 数量,
          "price": 价格,
          "purpose": "申请理由",
          "urgency": "紧急程度",
          "date": "申请日期",
          "status": "状态",
          "applicant": {
            "id": "申请人ID",
            "username": "申请人用户名",
            "name": "申请人显示名称"
          },
          "attachments": [
            {
              "id": "附件ID",
              "filename": "文件名",
              "url": "文件URL",
              "type": "文件类型",
              "size": 文件大小
            }
          ],
          "statusBy": {
            "id": "处理人ID",
            "username": "处理人用户名",
            "name": "处理人显示名称"
          },
          "statusDate": "处理日期",
          "feedback": "审批反馈"
        }
      ]
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 401,
    "message": "未授权访问"
  }
  ```

### 3.2 获取申请详情

- **URL**: `/applications/{applicationId}`
- **方法**: GET
- **描述**: 获取指定申请的详细信息
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "申请ID",
      "itemName": "物品名称",
      "itemCategory": "物品类别",
      "quantity": 数量,
      "price": 价格,
      "purpose": "申请理由",
      "urgency": "紧急程度",
      "date": "申请日期",
      "status": "状态",
      "applicant": {
        "id": "申请人ID",
        "username": "申请人用户名",
        "name": "申请人显示名称"
      },
      "attachments": [
        {
          "id": "附件ID",
          "filename": "文件名",
          "url": "文件URL",
          "type": "文件类型",
          "size": 文件大小
        }
      ],
      "statusBy": {
        "id": "处理人ID",
        "username": "处理人用户名",
        "name": "处理人显示名称"
      },
      "statusDate": "处理日期",
      "feedback": "审批反馈"
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 404,
    "message": "找不到ID为{applicationId}的申请"
  }
  ```

### 3.3 创建申请

- **URL**: `/applications`
- **方法**: POST
- **描述**: 创建新的物品申请
- **请求参数**:
  ```json
  {
    "itemName": "物品名称",
    "itemCategory": "物品类别",
    "quantity": 数量,
    "price": 预计价格(可选),
    "purpose": "申请理由",
    "urgency": "紧急程度(低/中/高)"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "申请ID",
      "status": "pending",
      "date": "申请日期"
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 400,
    "message": "请提供必要的申请信息"
  }
  ```

### 3.4 上传申请附件

- **URL**: `/applications/{applicationId}/attachments`
- **方法**: POST
- **描述**: 上传申请的附件文件
- **请求参数**: Form-Data格式
  - `file`: 文件数据
- **成功响应** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "附件ID",
      "filename": "文件名",
      "url": "文件URL",
      "type": "文件类型",
      "size": 文件大小
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 400,
    "message": "请选择要上传的文件"
  }
  ```

### 3.5 批准申请

- **URL**: `/applications/{applicationId}/approve`
- **方法**: PATCH
- **描述**: 批准物品申请(仅管理员可用)
- **请求参数**:
  ```json
  {
    "feedback": "批准反馈(可选)"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "申请已批准",
    "data": {
      "id": "申请ID",
      "status": "approved",
      "statusDate": "批准日期",
      "statusBy": {
        "id": "处理人ID",
        "username": "处理人用户名"
      }
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 403,
    "message": "用户角色 user 无权访问此资源"
  }
  ```

### 3.6 拒绝申请

- **URL**: `/applications/{applicationId}/reject`
- **方法**: PATCH
- **描述**: 拒绝物品申请(仅管理员可用)
- **请求参数**:
  ```json
  {
    "feedback": "拒绝原因(可选但推荐提供)"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "申请已拒绝",
    "data": {
      "id": "申请ID",
      "status": "rejected",
      "statusDate": "拒绝日期",
      "statusBy": {
        "id": "处理人ID",
        "username": "处理人用户名"
      }
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 400,
    "message": "此申请已被处理，不能重复处理"
  }
  ```

### 3.7 获取申请统计

- **URL**: `/applications/statistics`
- **方法**: GET
- **描述**: 获取申请统计数据
- **查询参数**:
  - `days`: 统计天数(7/30/90，默认为7)
  - `userId`: 用户ID(仅管理员可使用，用于查看特定用户的统计)
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "total": 总申请数,
      "pending": 待处理数,
      "approved": 已批准数,
      "rejected": 已拒绝数,
      "categories": {
        "文具": 数量,
        "电子设备": 数量,
        "办公用品": 数量,
        "家具": 数量,
        "其他": 数量
      },
      "dailyCount": [
        {
          "date": "日期",
          "count": 申请数量
        }
      ]
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 401,
    "message": "未授权访问"
  }
  ```

## 4. 用户设置

### 4.1 获取用户设置

- **URL**: `/settings`
- **方法**: GET
- **描述**: 获取当前用户的系统设置
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "theme": "主题(默认紫色)",
      "fontSize": "字体大小(small/medium/large)",
      "notifications": {
        "email": 是否接收邮件通知(true/false),
        "applicationUpdates": 是否接收申请状态更新通知(true/false),
        "systemAnnouncements": 是否接收系统公告通知(true/false)
      }
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 401,
    "message": "未授权访问"
  }
  ```

### 4.2 更新用户设置

- **URL**: `/settings`
- **方法**: PUT
- **描述**: 更新当前用户的系统设置
- **请求参数**:
  ```json
  {
    "theme": "主题颜色",
    "fontSize": "字体大小(small/medium/large)",
    "notifications": {
      "email": 是否接收邮件通知(true/false),
      "applicationUpdates": 是否接收申请状态更新通知(true/false),
      "systemAnnouncements": 是否接收系统公告通知(true/false)
    }
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "设置已更新",
    "data": {
      "theme": "主题",
      "fontSize": "字体大小",
      "notifications": {
        "email": 是否接收邮件通知,
        "applicationUpdates": 是否接收申请状态更新通知,
        "systemAnnouncements": 是否接收系统公告通知
      }
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 400,
    "message": "无效的设置值"
  }
  ```

## 5. 文件管理

### 5.1 上传文件

- **URL**: `/files/upload`
- **方法**: POST
- **描述**: 通用文件上传接口
- **请求参数**: Form-Data格式
  - `file`: 文件数据
  - `type`: 文件类型(avatar/attachment)
- **成功响应** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "文件ID",
      "filename": "文件名",
      "url": "文件URL",
      "type": "文件类型",
      "size": 文件大小
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 400,
    "message": "请选择要上传的文件"
  }
  ```

### 5.2 删除文件

- **URL**: `/files/{fileId}`
- **方法**: DELETE
- **描述**: 删除已上传的文件
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "文件已删除"
  }
  ```
- **失败响应**:
  ```json
  {
    "success": false,
    "code": 403,
    "message": "未授权删除此文件"
  }
  ``` 