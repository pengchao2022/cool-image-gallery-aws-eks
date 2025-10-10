// Mock database functions for development
export const query = async (text, params) => {
    console.log('Mock query:', text, params);
    // 返回模拟数据
    if (text.includes('SELECT')) {
        return [{ id: 1, username: 'testuser', email: 'test@example.com' }];
    }
    return [{ affectedRows: 1 }];
};

export const connect = async () => {
    console.log('Mock database connected');
    return true;
};
