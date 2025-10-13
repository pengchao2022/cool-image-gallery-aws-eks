export const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 ========== AUTHENTICATE 中间件开始 ==========');
    console.log('🔐 请求路径:', req.path);
    console.log('🔐 请求方法:', req.method);
    console.log('🔐 Content-Type:', req.headers['content-type']);
    console.log('🔐 完整的 Authorization header:', req.headers.authorization);
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ 未提供 token');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    console.log('🔑 提取的 token:', token.substring(0, 20) + '...');
    console.log('🔑 Token 长度:', token.length);
    console.log('🔑 使用的 JWT_SECRET:', config.JWT_SECRET ? `已设置 (长度: ${config.JWT_SECRET.length})` : '未设置');
    
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('✅ Token 解码成功');
    console.log('✅ decoded payload:', decoded);
    console.log('✅ userId:', decoded.userId);
    
    // 使用 Sequelize 的正确方法：findByPk
    console.log('🔍 查询数据库用户，使用 findByPk...');
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      console.log('❌ 用户不存在, userId:', decoded.userId);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }

    console.log('✅ 用户验证成功:', {
      id: user.id,
      username: user.username,
      email: user.email
    });
    
    req.user = user;
    console.log('🔐 ========== AUTHENTICATE 中间件结束 ==========');
    next();
  } catch (error) {
    console.error('❌ Token 验证错误:', error.message);
    console.error('❌ 错误名称:', error.name);
    console.error('❌ 错误堆栈:', error.stack);
    
    // 更详细的错误分类
    if (error.name === 'JsonWebTokenError') {
      console.error('❌ JWT 格式错误');
    } else if (error.name === 'TokenExpiredError') {
      console.error('❌ Token 已过期');
    } else if (error.name === 'NotBeforeError') {
      console.error('❌ Token 尚未生效');
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    console.log('🔐 [optionalAuth] 被调用');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      console.log('🔐 [optionalAuth] 找到 token，尝试验证');
      const decoded = jwt.verify(token, config.JWT_SECRET);
      // 使用 Sequelize 的正确方法
      const user = await User.findByPk(decoded.userId);
      req.user = user;
      console.log('🔐 [optionalAuth] 用户设置完成');
    } else {
      console.log('🔐 [optionalAuth] 未找到 token，跳过认证');
    }
    
    next();
  } catch (error) {
    console.error('🔐 [optionalAuth] 错误:', error.message);
    next();
  }
};