node -e "import('./src/config/database.js').then(async ({ sequelize }) => { 
  await sequelize.authenticate();
  const [dbInfo] = await sequelize.query('SELECT current_database(), version()');
  console.log('🗄️ 数据库信息:');
  console.log('  数据库名: ' + dbInfo[0].current_database);
  console.log('  版本: ' + dbInfo[0].version);
}).catch(e => console.error('错误:', e.message))"
