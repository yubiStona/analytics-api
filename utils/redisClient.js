const { Redis } = require('ioredis');

const RedisClient = new Redis();

if(RedisClient.status === 'connecting'){
console.log("redis client connected")
}

module.exports = RedisClient