const {pool, pool2}=require('../config/db');
const RedisClient = require('../utils/redisClient');

const getUnregisteredMembersService = async()=>{
  try{
    const cachedData = await RedisClient.get("memberStatusCachedData")
    if(cachedData){
      console.log("fetched memberStatusCachedData from redis")
      return JSON.parse(cachedData)
    }
    const [reg] = await pool.query(`SELECT DISTINCT cemail FROM health_company1.userinfo WHERE cemail IN (SELECT email FROM ssoapp.sso_users where user_type = 'M')`);
    const [unreg] = await pool.query(`SELECT DISTINCT cemail FROM health_company1.userinfo WHERE cemail NOT IN (SELECT email FROM ssoapp.sso_users where user_type = 'M')`);
    const result = {unreg:unreg, reg:reg, unreg_counts:unreg.length, reg_counts:reg.length};
    if(result){
      await RedisClient.set("memberStatusCachedData", JSON.stringify(result), "EX", 1800)
    }
    return result
  } catch (err) {
    console.error(err);
    return err;
  }
}

module.exports = getUnregisteredMembersService;