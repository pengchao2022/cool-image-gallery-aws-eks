# 查看 users 表结构在 pod 里面执行
node -e "import('./src/config/database.js').then(async ({ sequelize }) => { 
  await sequelize.authenticate();
  const [columns] = await sequelize.query('SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = \\'users\\' ORDER BY ordinal_position');
  console.log('👥 users 表结构:');
  columns.forEach(col => console.log('  ' + col.column_name + ' (' + col.data_type + ') - Nullable: ' + col.is_nullable + ' - Default: ' + col.column_default));
}).catch(e => console.error('错误:', e.message))"
