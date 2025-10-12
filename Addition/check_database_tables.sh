# 查看所有表 在pod 里面执行
node -e "import('./src/config/database.js').then(async ({ sequelize }) => { 
  await sequelize.authenticate();
  const [tables] = await sequelize.query('SELECT tablename FROM pg_tables WHERE schemaname = \\'public\\' ORDER BY tablename');
  console.log('📋 数据库中的所有表:');
  tables.forEach(table => console.log('  ' + table.tablename));
}).catch(e => console.error('错误:', e.message))"
