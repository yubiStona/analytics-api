const {pool, pool2}=require('../config/db');

const getUnregisteredMembersService = async()=>{
    try {
    const [rows] = await pool.query('SELECT distinct id FROM sso_users');
    const ids = rows.map(row => row.id);
    const [users] = await pool2.query('SELECT distinct userid FROM userinfo');
    const unreg = users.filter(user => !ids.includes(user.userid));
    const reg = users.filter(user => ids.includes(user.userid));
    return {unreg:unreg, reg:reg, unreg_counts:unreg.length, reg_counts:reg.length};
  } catch (err) {
    console.error(err);
    return err;
  }
}

module.exports = getUnregisteredMembersService;