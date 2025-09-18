const {pool, pool2}=require('../config/db');

const getUnregisteredMembersService = async()=>{
    try {
    const [rows] = await pool.query('SELECT id FROM sso_users');
    const ids = rows.map(row => row.id);
    const [users] = await pool2.query('SELECT userid FROM userinfo');
    const result = users.filter(user => !ids.includes(user.userid));
    return {data:result, length:result.length};
  } catch (err) {
    console.error(err);
    return err;
  }
}

module.exports = getUnregisteredMembersService;