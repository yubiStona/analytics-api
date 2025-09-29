const {pool, pool2}=require('../config/db');

const getUnregisteredMembersService = async()=>{
  try{
    const [reg] = await pool.query(`SELECT distinct userid FROM health_company1.userinfo WHERE userid IN (SELECT distinct id FROM ssoapp.sso_users)`);
    const [unreg] = await pool.query(`SELECT distinct userid FROM health_company1.userinfo WHERE userid NOT IN (SELECT distinct id FROM ssoapp.sso_users)`);
    return {unreg:unreg, reg:reg, unreg_counts:unreg.length, reg_counts:reg.length};
  } catch (err) {
    console.error(err);
    return err;
  }
}

module.exports = getUnregisteredMembersService;