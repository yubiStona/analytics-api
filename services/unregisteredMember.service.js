const {pool, pool2}=require('../config/db');

const getUnregisteredMembersService = async()=>{
  try{
    const [reg] = await pool.query(`SELECT cemail FROM health_company1.userinfo WHERE cemail IN (SELECT email FROM ssoapp.sso_users where user_type = 'M')`);
    const [unreg] = await pool.query(`SELECT cemail FROM health_company1.userinfo WHERE cemail NOT IN (SELECT email FROM ssoapp.sso_users where user_type = 'M')`);
    return {unreg:unreg, reg:reg, unreg_counts:unreg.length, reg_counts:reg.length};
  } catch (err) {
    console.error(err);
    return err;
  }
}

module.exports = getUnregisteredMembersService;