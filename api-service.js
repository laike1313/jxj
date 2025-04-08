// api-service.js - 统一管理所有API请求

// API基础URL
const API_BASE_URL = 'https://ldibbyfwrejz.sealoshzh.site/api/v1';

// 开发环境使用Mock数据
const USE_MOCK = true;

// 开发模式下的模拟数据
const MOCK_DATA = {
    applications: [],
    users: []
};

// 从localStorage初始化应用数据
function initMockData() {
    try {
        // 从localStorage加载申请数据
        const savedApplications = localStorage.getItem('mock_applications');
        if (savedApplications) {
            MOCK_DATA.applications = JSON.parse(savedApplications);
            console.log('已从localStorage加载申请数据:', MOCK_DATA.applications.length, '条记录');
        }
        
        // 从localStorage加载用户数据
        const savedUsers = localStorage.getItem('mock_users');
        if (savedUsers) {
            MOCK_DATA.users = JSON.parse(savedUsers);
            console.log('已从localStorage加载用户数据:', MOCK_DATA.users.length, '条记录');
        }
    } catch (err) {
        console.error('初始化模拟数据失败:', err);
    }
}

// 初始化模拟数据
initMockData();

// 保存模拟数据到localStorage
function saveMockData() {
    try {
        // 保存申请数据
        localStorage.setItem('mock_applications', JSON.stringify(MOCK_DATA.applications));
        
        // 保存用户数据
        localStorage.setItem('mock_users', JSON.stringify(MOCK_DATA.users));
        
        console.log('模拟数据已保存到localStorage');
    } catch (err) {
        console.error('保存模拟数据失败:', err);
    }
}

// API请求服务
class ApiService {
    // 设置Token
    static setToken(token) {
        localStorage.setItem('auth_token', token);
    }
    
    // 获取Token
    static getToken() {
        return localStorage.getItem('auth_token');
    }
    
    // 清除Token
    static clearToken() {
        localStorage.removeItem('auth_token');
    }
    
    // 检查是否已认证
    static isAuthenticated() {
        return !!this.getToken();
    }
    
    // 构建请求头
    static getHeaders(contentType = 'application/json') {
        const headers = {
            'Content-Type': contentType
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    // 处理API响应
    static async handleResponse(response) {
        let responseData;
        
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = { success: false, message: '无法解析响应数据' };
        }
        
        if (!response.ok) {
            // 未授权错误处理
            if (response.status === 401) {
                console.log('API请求未授权，检查登录状态');
                if (USE_MOCK) {
                    console.log('开发模式：使用模拟数据');
                    return this.mockResponse(response.url, response.method);
                }
            }
            
            throw {
                status: response.status,
                ...responseData
            };
        }
        
        return responseData;
    }
    
    // 模拟API响应
    static mockResponse(url, method, data = {}) {
        console.log(`模拟响应: ${method} ${url}`, data);
        
        // 提取API路径
        const apiPath = url.replace(API_BASE_URL, '');
        
        // 登录接口
        if (apiPath === '/auth/login' && method === 'POST') {
            const { username, password } = data;
            
            // 验证管理员账户
            if (username === 'admin' && password === 'admin888') {
                return {
                    success: true,
                    data: {
                        token: 'mock_admin_token_' + Date.now(),
                        user: {
                            id: 'admin_id',
                            username: 'admin',
                            name: '系统管理员',
                            role: 'admin',
                            email: 'admin@example.com',
                            avatar: null,
                            avatarType: 'default',
                            createTime: new Date().toISOString(),
                            lastLoginTime: new Date().toISOString()
                        }
                    }
                };
            }
            
            // 验证测试用户账户
            if (username === 'user' && password === 'user888') {
                return {
                    success: true,
                    data: {
                        token: 'mock_user_token_' + Date.now(),
                        user: {
                            id: 'user_id',
                            username: 'user',
                            name: '普通用户',
                            role: 'user',
                            email: 'user@example.com',
                            avatar: null,
                            avatarType: 'default',
                            createTime: new Date().toISOString(),
                            lastLoginTime: new Date().toISOString()
                        }
                    }
                };
            }
            
            // 验证注册用户
            const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
            const matchedUser = registeredUsers.find(u => u.username === username && u.password === password);
            
            if (matchedUser) {
                // 返回用户信息，不包含密码
                const { password: _, ...userWithoutPassword } = matchedUser;
                
                return {
                    success: true,
                    data: {
                        token: 'mock_registered_token_' + Date.now(),
                        user: {
                            ...userWithoutPassword,
                            lastLoginTime: new Date().toISOString()
                        }
                    }
                };
            }
            
            // 登录失败
            return {
                success: false,
                message: '用户名或密码不正确',
                status: 401
            };
        }
        
        // 注册接口
        if (apiPath === '/auth/register' && method === 'POST') {
            const { username, password } = data;
            
            // 验证用户名和密码
            if (!username || !password) {
                return {
                    success: false,
                    message: '用户名和密码不能为空',
                    status: 400
                };
            }
            
            // 获取已注册用户
            const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
            
            // 检查用户名是否已存在
            if (registeredUsers.some(user => user.username === username)) {
                return {
                    success: false,
                    message: '用户名已存在',
                    status: 409
                };
            }
            
            // 创建新用户
            const newUser = {
                id: 'user_' + Date.now(),
                username,
                password, // 注意：实际应用中应该加密存储
                name: username,
                role: 'user',
                email: data.email || '',
                avatar: null,
                avatarType: 'default',
                registerTime: new Date().toISOString(),
                lastLoginTime: new Date().toISOString()
            };
            
            // 添加到已注册用户列表
            registeredUsers.push(newUser);
            localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
            
            // 添加到管理员端用户列表显示
            // 从localStorage获取现有用户列表
            const adminUsers = JSON.parse(localStorage.getItem('users') || '[]');
            
            // 避免重复添加，检查用户名是否已存在
            if (!adminUsers.some(user => user.username === username)) {
                adminUsers.push(newUser);
                localStorage.setItem('users', JSON.stringify(adminUsers));
                
                // 更新MOCK_DATA.users
                MOCK_DATA.users = adminUsers;
                // 保存模拟数据
                saveMockData();
            }
            
            console.log('用户注册成功:', username);
            
            return {
                success: true,
                message: '注册成功',
                data: {
                    username: username,
                    role: 'user'
                }
            };
        }
        
        // 根据API路径返回模拟数据
        if (apiPath.startsWith('/applications')) {
            // 申请列表
            if (apiPath === '/applications' && method === 'GET') {
                // 已不自动生成模拟数据，保持空数组
                // 只有通过createApplication方法手动添加的申请才会出现在列表中
                
                // 获取当前用户
                let filteredApplications = [...MOCK_DATA.applications];
                
                // 根据请求参数处理
                if (data) {
                    // 如果指定了角色,且不是admin角色,则只返回属于当前用户的申请
                    if (data.role && data.role !== 'admin') {
                        // 获取当前用户 - 确保安全处理
                        try {
                            const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                            const username = currentUser.username || '';
                            if (username) {
                                filteredApplications = filteredApplications.filter(app => app.applicant === username);
                            }
                        } catch (err) {
                            console.error('Error getting currentUser:', err);
                        }
                    }
                    
                    // 根据状态筛选
                    if (data.status) {
                        filteredApplications = filteredApplications.filter(app => app.status === data.status);
                    }
                }
                
                return {
                    success: true,
                    data: {
                        applications: filteredApplications,
                        total: filteredApplications.length
                    }
                };
            }
            
            // 申请统计
            if (apiPath === '/applications/statistics' && method === 'GET') {
                // 根据实际申请统计数据生成分布情况
                const typeDistribution = {};
                const statusDistribution = { pending: 0, approved: 0, rejected: 0 };
                
                // 计算类型分布
                MOCK_DATA.applications.forEach(app => {
                    // 类型分布
                    if (app.itemCategory) {
                        typeDistribution[app.itemCategory] = (typeDistribution[app.itemCategory] || 0) + 1;
                    }
                    
                    // 状态分布
                    if (app.status) {
                        statusDistribution[app.status] = (statusDistribution[app.status] || 0) + 1;
                    }
                });
                
                // 如果没有数据，返回零值统计
                if (MOCK_DATA.applications.length === 0) {
                    return {
                        success: true,
                        data: {
                            typeDistribution: {
                                "文具": 0,
                                "电子设备": 0,
                                "办公用品": 0,
                                "家具": 0,
                                "其他": 0
                            },
                            statusDistribution: {
                                pending: 0,
                                approved: 0,
                                rejected: 0
                            },
                            total: 0
                        }
                    };
                }
                
                return {
                    success: true,
                    data: {
                        typeDistribution: typeDistribution,
                        statusDistribution: statusDistribution,
                        total: MOCK_DATA.applications.length
                    }
                };
            }
            
            // 获取申请详情
            if (url.match(/\/applications\/(.+)$/) && method === 'GET' && !url.includes('/statistics')) {
                // 从URL中提取申请ID
                let applicationId = url.match(/\/applications\/(.+)$/)[1];
                
                // 处理带#和不带#的情况
                if (!applicationId.startsWith('#')) {
                    applicationId = `#${applicationId}`;
                }
                
                console.log('查找申请ID:', applicationId);
                
                // 在applications数组中查找匹配的申请
                let application = MOCK_DATA.applications.find(app => app.id === applicationId);
                
                // 尝试不区分大小写匹配
                if (!application) {
                    application = MOCK_DATA.applications.find(app => 
                        app.id.toLowerCase() === applicationId.toLowerCase());
                }
                
                // 如果没有找到匹配的申请，返回404错误
                if (!application) {
                    return {
                        success: false,
                        message: '申请不存在',
                        status: 404
                    };
                }
                
                // 返回申请详情
                return {
                    success: true,
                    data: {
                        ...application,
                        feedback: application.status !== 'pending' ? `这是对申请ID ${applicationId} 的${application.status === 'approved' ? '批准' : '拒绝'}反馈。` : '',
                        handlerName: application.status !== 'pending' ? '系统管理员' : '',
                        attachments: application.hasAttachments ? [
                            {
                                fileType: 'application/pdf',
                                fileName: '申请附件.pdf',
                                url: '#'
                            }
                        ] : []
                    }
                };
            }
        }
        
        // 用户列表
        if (apiPath === '/users' && method === 'GET') {
            // 从localStorage获取用户列表
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // 如果没有用户数据，添加默认用户
            if (users.length === 0) {
                const defaultUsers = [
                    {
                        id: 'admin_id',
                        username: 'admin',
                        name: '系统管理员',
                        role: 'admin',
                        email: 'admin@example.com',
                        avatar: null,
                        avatarType: 'default',
                        createTime: new Date().toISOString(),
                        lastLoginTime: new Date().toISOString()
                    },
                    {
                        id: 'user_id',
                        username: 'user',
                        name: '普通用户',
                        role: 'user',
                        email: 'user@example.com',
                        avatar: null,
                        avatarType: 'default',
                        createTime: new Date().toISOString(),
                        lastLoginTime: new Date().toISOString()
                    }
                ];
                
                // 保存默认用户到localStorage
                localStorage.setItem('users', JSON.stringify(defaultUsers));
                
                // 更新内存中的用户数据
                MOCK_DATA.users = defaultUsers;
                
                return {
                    success: true,
                    data: {
                        users: defaultUsers,
                        total: defaultUsers.length
                    }
                };
            }
            
            // 更新内存中的用户数据
            MOCK_DATA.users = users;
            
            return {
                success: true,
                data: {
                    users: users,
                    total: users.length
                }
            };
        }
        
        // 用户数量
        if (apiPath === '/users/count' && method === 'GET') {
            // 从localStorage获取用户列表
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            return {
                success: true,
                data: {
                    count: users.length
                }
            };
        }
        
        // 设置
        if (apiPath === '/settings' && method === 'GET') {
            return {
                success: true,
                data: {
                    avatar: null,
                    avatarType: 'default',
                    avatarColor: '#7B68EE',
                    displayName: '用户设置',
                    email: 'user@example.com',
                    phone: '13800138000',
                    themeColor: '#7B68EE',
                    fontSize: '14',
                    notifications: {
                        statusChange: true,
                        systemUpdate: true
                    }
                }
            };
        }
        
        // 默认返回空结果
        return {
            success: true,
            data: {}
        };
    }
    
    // GET请求
    static async get(endpoint, params = {}) {
        try {
            // 开发模式使用模拟数据
            if (USE_MOCK) {
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'GET', params);
            }
            
            // 构建查询字符串
            const queryString = Object.keys(params).length > 0
                ? '?' + new URLSearchParams(params).toString()
                : '';
            
            // 发起请求
            const response = await fetch(`${API_BASE_URL}${endpoint}${queryString}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`GET 请求 ${endpoint} 失败:`, error);
            
            // 开发模式下出错时返回模拟数据
            if (USE_MOCK) {
                console.log('使用模拟数据替代失败的请求');
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'GET', params);
            }
            
            throw {
                status: error.status || 500,
                success: false,
                message: error.message || '网络连接失败，请检查您的互联网连接或联系管理员'
            };
        }
    }
    
    // POST请求
    static async post(endpoint, data = {}) {
        try {
            // 开发模式使用模拟数据
            if (USE_MOCK) {
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'POST', data);
            }
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`POST 请求 ${endpoint} 失败:`, error);
            
            // 开发模式下出错时返回模拟数据
            if (USE_MOCK) {
                console.log('使用模拟数据替代失败的请求');
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'POST', data);
            }
            
            throw {
                status: error.status || 500,
                success: false,
                message: error.message || '网络连接失败，请检查您的互联网连接或联系管理员'
            };
        }
    }
    
    // PUT请求
    static async put(endpoint, data = {}) {
        try {
            // 开发模式使用模拟数据
            if (USE_MOCK) {
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'PUT', data);
            }
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`PUT 请求 ${endpoint} 失败:`, error);
            
            // 开发模式下出错时返回模拟数据
            if (USE_MOCK) {
                console.log('使用模拟数据替代失败的请求');
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'PUT', data);
            }
            
            throw {
                status: error.status || 500,
                success: false,
                message: error.message || '网络连接失败，请检查您的互联网连接或联系管理员'
            };
        }
    }
    
    // PATCH请求
    static async patch(endpoint, data = {}) {
        try {
            // 开发模式使用模拟数据
            if (USE_MOCK) {
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'PATCH', data);
            }
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`PATCH 请求 ${endpoint} 失败:`, error);
            
            // 开发模式下出错时返回模拟数据
            if (USE_MOCK) {
                console.log('使用模拟数据替代失败的请求');
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'PATCH', data);
            }
            
            throw {
                status: error.status || 500,
                success: false,
                message: error.message || '网络连接失败，请检查您的互联网连接或联系管理员'
            };
        }
    }
    
    // DELETE请求
    static async delete(endpoint) {
        try {
            // 开发模式使用模拟数据
            if (USE_MOCK) {
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'DELETE');
            }
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`DELETE 请求 ${endpoint} 失败:`, error);
            
            // 开发模式下出错时返回模拟数据
            if (USE_MOCK) {
                console.log('使用模拟数据替代失败的请求');
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'DELETE');
            }
            
            throw {
                status: error.status || 500,
                success: false,
                message: error.message || '网络连接失败，请检查您的互联网连接或联系管理员'
            };
        }
    }
    
    // 文件上传
    static async uploadFile(endpoint, formData) {
        try {
            // 开发模式使用模拟数据
            if (USE_MOCK) {
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'UPLOAD');
            }
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                    // 注意：使用FormData时不需要设置Content-Type，浏览器会自动设置
                },
                body: formData
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`文件上传 ${endpoint} 失败:`, error);
            
            // 开发模式下出错时返回模拟数据
            if (USE_MOCK) {
                console.log('使用模拟数据替代失败的请求');
                return this.mockResponse(`${API_BASE_URL}${endpoint}`, 'UPLOAD');
            }
            
            throw {
                status: error.status || 500,
                success: false,
                message: error.message || '网络连接失败，请检查您的互联网连接或联系管理员'
            };
        }
    }
}

// 用户认证相关接口
class AuthApi {
    // 用户登录
    static async login(username, password) {
        try {
            const response = await ApiService.post('/auth/login', { username, password });
            
            // 检查API响应格式，确保包含必要的用户信息
            if (response.success) {
                // 保存token
                if (response.data && response.data.token) {
                    ApiService.setToken(response.data.token);
                }
                
                // 如果后端返回的数据格式不符合前端预期，进行适配
                if (!response.data || !response.data.user) {
                    console.log('API返回的数据格式不符合预期，进行格式适配');
                    
                    // 从响应中提取有用信息构建用户对象
                    const token = response.data?.token || response.token || `token_${Date.now()}`;
                    
                    // 构建用户对象
                    const user = {
                        id: response.data?.userId || response.userId || username + '_id',
                        username: username,
                        name: response.data?.name || response.name || username,
                        role: response.data?.role || response.role || 'user',
                        email: response.data?.email || response.email || '',
                        avatar: response.data?.avatar || response.avatar || null,
                        avatarType: response.data?.avatarType || response.avatarType || 'default',
                        createTime: response.data?.createTime || response.createTime || new Date().toISOString(),
                        lastLoginTime: new Date().toISOString()
                    };
                    
                    // 构建符合前端预期的响应格式
                    return {
                        success: true,
                        data: {
                            token: token,
                            user: user
                        }
                    };
                }
                
                // 记录原始响应以便调试
                console.log('原始登录响应:', response);
            }
            
            return response;
        } catch (error) {
            console.error('登录失败:', error);
            
            // 如果是401错误，给出更友好的提示
            if (error.status === 401) {
                console.log('提示: 可以使用开发测试账户 admin/admin888 或 user/user888 登录');
                throw {
                    status: 401,
                    success: false,
                    message: '用户名或密码不正确 (开发模式可使用 admin/admin888 或 user/user888 登录)'
                };
            }
            
            throw error;
        }
    }
    
    // 用户注册
    static async register(userData) {
        return ApiService.post('/auth/register', userData);
    }
    
    // 忘记密码
    static async forgotPassword(email) {
        return ApiService.post('/auth/forgot-password', { email });
    }
    
    // 重置密码
    static async resetPassword(token, newPassword) {
        return ApiService.post('/auth/reset-password', { token, newPassword });
    }
    
    // 登出
    static logout() {
        ApiService.clearToken();
    }
}

// 用户管理相关接口
class UserApi {
    // 获取用户列表
    static async getUsers(params = {}) {
        return ApiService.get('/users', params);
    }
    
    // 获取用户数量
    static async getUserCount() {
        return ApiService.get('/users/count');
    }
    
    // 获取用户详情
    static async getUserDetail(userId) {
        return ApiService.get(`/users/${userId}`);
    }
    
    // 创建用户
    static async createUser(userData) {
        return ApiService.post('/users', userData);
    }
    
    // 更新用户信息
    static async updateUser(userId, userData) {
        return ApiService.put(`/users/${userId}`, userData);
    }
    
    // 修改密码
    static async changePassword(userId, currentPassword, newPassword) {
        return ApiService.patch(`/users/${userId}/password`, {
            currentPassword,
            newPassword
        });
    }
    
    // 删除用户
    static async deleteUser(userId) {
        return ApiService.delete(`/users/${userId}`);
    }
}

// 申请管理相关接口
class ApplicationApi {
    // 获取申请列表
    static async getApplications(params = {}) {
        return ApiService.get('/applications', params);
    }
    
    // 获取申请详情
    static async getApplicationDetail(applicationId) {
        return ApiService.get(`/applications/${applicationId}`);
    }
    
    // 创建申请
    static async createApplication(applicationData) {
        // 如果是Mock模式，手动处理申请创建
        if (USE_MOCK) {
            console.log('创建新申请:', applicationData);
            
            // 生成唯一ID
            const id = `#APL-${String(MOCK_DATA.applications.length + 1).padStart(3, '0')}`;
            
            // 获取当前用户
            let applicant = 'user';
            try {
                const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                if (currentUser && currentUser.username) {
                    applicant = currentUser.username;
                }
            } catch (err) {
                console.error('获取当前用户失败:', err);
            }
            
            // 创建新申请
            const newApplication = {
                id: id,
                itemName: applicationData.itemName || `新申请 ${id}`,
                itemCategory: applicationData.itemCategory || '其他',
                quantity: applicationData.quantity || 1,
                price: applicationData.price || 100,
                purpose: applicationData.purpose || '无说明',
                urgency: applicationData.urgency || '中',
                date: new Date().toISOString().split('T')[0],
                status: 'pending',
                applicant: applicant,
                submittedTime: new Date().toISOString(),
                hasAttachments: false
            };
            
            // 添加到申请列表
            MOCK_DATA.applications.push(newApplication);
            console.log('申请创建成功:', newApplication);
            
            // 保存数据到localStorage
            saveMockData();
            
            return {
                success: true,
                data: {
                    id: id,
                    message: '申请创建成功'
                }
            };
        }
        
        return ApiService.post('/applications', applicationData);
    }
    
    // 上传申请附件
    static async uploadAttachment(applicationId, file) {
        const formData = new FormData();
        formData.append('file', file);
        
        return ApiService.uploadFile(`/applications/${applicationId}/attachments`, formData);
    }
    
    // 批准申请
    static async approveApplication(applicationId, feedback = '') {
        // 如果是Mock模式，手动处理申请批准
        if (USE_MOCK) {
            console.log('批准申请:', applicationId, feedback);
            
            // 处理ID格式
            if (!applicationId.startsWith('#')) {
                applicationId = `#${applicationId}`;
            }
            
            // 查找对应申请
            const appIndex = MOCK_DATA.applications.findIndex(app => 
                app.id.toLowerCase() === applicationId.toLowerCase()
            );
            
            if (appIndex !== -1) {
                // 更新申请状态
                MOCK_DATA.applications[appIndex].status = 'approved';
                MOCK_DATA.applications[appIndex].feedback = feedback || '申请已批准';
                MOCK_DATA.applications[appIndex].handlerName = '系统管理员';
                
                console.log('申请批准成功:', MOCK_DATA.applications[appIndex]);
                
                // 保存数据到localStorage
                saveMockData();
                
                return {
                    success: true,
                    data: {
                        message: '申请批准成功'
                    }
                };
            } else {
                return {
                    success: false,
                    message: '申请不存在',
                    status: 404
                };
            }
        }
        
        return ApiService.patch(`/applications/${applicationId}/approve`, { feedback });
    }
    
    // 拒绝申请
    static async rejectApplication(applicationId, feedback = '') {
        // 如果是Mock模式，手动处理申请拒绝
        if (USE_MOCK) {
            console.log('拒绝申请:', applicationId, feedback);
            
            // 处理ID格式
            if (!applicationId.startsWith('#')) {
                applicationId = `#${applicationId}`;
            }
            
            // 查找对应申请
            const appIndex = MOCK_DATA.applications.findIndex(app => 
                app.id.toLowerCase() === applicationId.toLowerCase()
            );
            
            if (appIndex !== -1) {
                // 更新申请状态
                MOCK_DATA.applications[appIndex].status = 'rejected';
                MOCK_DATA.applications[appIndex].feedback = feedback || '申请已拒绝';
                MOCK_DATA.applications[appIndex].handlerName = '系统管理员';
                
                console.log('申请拒绝成功:', MOCK_DATA.applications[appIndex]);
                
                // 保存数据到localStorage
                saveMockData();
                
                return {
                    success: true,
                    data: {
                        message: '申请拒绝成功'
                    }
                };
            } else {
                return {
                    success: false,
                    message: '申请不存在',
                    status: 404
                };
            }
        }
        
        return ApiService.patch(`/applications/${applicationId}/reject`, { feedback });
    }
    
    // 获取申请统计
    static async getStatistics(days = 7, userId = '') {
        const params = { days };
        if (userId) {
            params.userId = userId;
        }
        
        return ApiService.get('/applications/statistics', params);
    }
    
    // 获取申请统计（别名，与getStatistics功能相同）
    static async getApplicationsStatistics(params = {}) {
        return this.getStatistics(params.days, params.userId);
    }
    
    // 删除申请
    static async deleteApplication(applicationId) {
        // 如果是Mock模式，手动处理申请删除
        if (USE_MOCK) {
            console.log('删除申请:', applicationId);
            
            // 处理ID格式
            if (!applicationId.startsWith('#')) {
                applicationId = `#${applicationId}`;
            }
            
            // 查找对应申请的索引
            const appIndex = MOCK_DATA.applications.findIndex(app => 
                app.id.toLowerCase() === applicationId.toLowerCase()
            );
            
            if (appIndex !== -1) {
                // 从数组中删除申请
                const deletedApp = MOCK_DATA.applications.splice(appIndex, 1)[0];
                console.log('申请删除成功:', deletedApp);
                
                // 保存数据到localStorage
                saveMockData();
                
                return {
                    success: true,
                    data: {
                        message: '申请删除成功'
                    }
                };
            } else {
                return {
                    success: false,
                    message: '申请不存在',
                    status: 404
                };
            }
        }
        
        return ApiService.delete(`/applications/${applicationId}`);
    }
}

// 用户设置相关接口
class SettingsApi {
    // 获取用户设置
    static async getSettings() {
        return ApiService.get('/settings');
    }
    
    // 获取用户设置（别名，与getSettings功能相同）
    static async getUserSettings() {
        return this.getSettings();
    }
    
    // 更新用户设置
    static async updateSettings(settingsData) {
        return ApiService.put('/settings', settingsData);
    }
    
    // 更新用户设置（别名，与updateSettings功能相同）
    static async updateUserSettings(settingsData) {
        return this.updateSettings(settingsData);
    }
}

// 文件管理相关接口
class FileApi {
    // 上传文件
    static async uploadFile(file, type = 'attachment') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        return ApiService.uploadFile('/files/upload', formData);
    }
    
    // 删除文件
    static async deleteFile(fileId) {
        return ApiService.delete(`/files/${fileId}`);
    }
}

// 导出所有API服务
export {
    ApiService,
    AuthApi,
    UserApi,
    ApplicationApi,
    SettingsApi,
    FileApi
}; 