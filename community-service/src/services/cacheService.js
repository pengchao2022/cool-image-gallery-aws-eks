const redis = require('redis');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.connect();
  }

  async set(key, value, expiration = 3600) {
    await this.client.set(key, JSON.stringify(value), {
      EX: expiration
    });
  }

  async get(key) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key) {
    await this.client.del(key);
  }

  async incrementViewCount(discussionId) {
    const key = `discussion:${discussionId}:views`;
    await this.client.incr(key);
  }
}

module.exports = new CacheService();