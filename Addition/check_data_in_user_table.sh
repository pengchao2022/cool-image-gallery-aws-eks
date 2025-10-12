node -e "import('./src/config/database.js').then(async ({ sequelize }) => { 
  await sequelize.authenticate();
  const [users] = await sequelize.query('SELECT id, username, email, role, created_at FROM users ORDER BY id');
  console.log('👥 users 表数据:');
  console.log('总共 ' + users.length + ' 个用户');
  users.forEach(user => console.log('  ID: ' + user.id + ', 用户名: ' + user.username + ', 邮箱: ' + user.email + ', 角色: ' + user.role + ', 创建时间: ' + user.created_at));
}).catch(e => console.error('错误:', e.message))"
