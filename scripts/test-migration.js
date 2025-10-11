import dotenv from 'dotenv';
import { runMigration } from './migrate.js';

// 加载本地环境变量
dotenv.config({ path: '.env.local' });

async function testMigration() {
  console.log('🧪 Testing database migration...');
  
  // 检查环境变量
  const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.log('💡 Please set these variables in your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
  
  try {
    await runMigration();
    console.log('🎉 Migration test completed successfully!');
  } catch (error) {
    console.error('💥 Migration test failed:', error.message);
    process.exit(1);
  }
}

testMigration();