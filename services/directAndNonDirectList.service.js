const { pool2 } = require("../config/db");

const directListService = async(req)=>{
    try{
        const agent_ga = req.body.agent_ga
        const [rows]= await pool2.query(`SELECT 
            a.agent_fname as First_Name,
            a.agent_lname as Last_Name,
            a.agent_email as Email,
            a.agent_state as state,
            a.agent_phone1 as Phone,
            a.agent_level as Level,
            SUM(CASE WHEN p.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
            SUM(CASE WHEN p.status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
            SUM(CASE WHEN p.status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
            FROM agent_info a
            LEFT JOIN policies p ON a.agent_id = p.p_agent_num
            WHERE a.agent_status = 'A' AND a.agent_ga = ?
            GROUP BY a.agent_id, a.agent_fname, a.agent_lname, a.agent_email, a.agent_state, a.agent_phone1, a.agent_level`, [agent_ga])
        return rows;
    }catch(err){
        console.error(err);
        return err;
    }
}
const nonDirectListService = async(agent_ga)=>{
    try{
        // const [rows]= await pool2.query(`SELECT 
        //     a.agent_fname as First_Name,
        //     a.agent_lname as Last_Name,
        //     a.agent_email as Email,
        //     a.agent_state as state,
        //     a.agent_phone1 as Phone,
        //     a.agent_level as Level,
        //     SUM(CASE WHEN p.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
        //     SUM(CASE WHEN p.status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
        //     SUM(CASE WHEN p.status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
        //     FROM agent_info a
        //     LEFT JOIN policies p ON a.agent_id = p.p_agent_num
        //     WHERE a.agent_status = 'A' AND a.agent_ga in (Select a.agent_id from agent_info a where a.agent_ga = ?)
        //     GROUP BY a.agent_id, a.agent_fname, a.agent_lname, a.agent_email, a.agent_state, a.agent_phone1, a.agent_level`, [agent_ga])
        // for (let agent of rows) {
        //     agent.downlines = await nonDirectListService(agent.agent_id);
        // }

        // return rows;
    const [rows] = await pool2.query(`WITH RECURSIVE downline_hierarchy AS (
        SELECT 
        agent_id, agent_fname, agent_lname, agent_email, agent_state, agent_phone1, agent_level, agent_ga,
        1 AS level
        FROM agent_info
        WHERE agent_ga = ? AND agent_status = 'A'

        UNION ALL

        SELECT 
        a.agent_id, a.agent_fname, a.agent_lname, a.agent_email, a.agent_state, a.agent_phone1, a.agent_level, a.agent_ga,
        dh.level + 1 AS level
        FROM agent_info a
        INNER JOIN downline_hierarchy dh ON a.agent_ga = dh.agent_id
        WHERE a.agent_status = 'A'
        )

        SELECT 
        dh.agent_fname AS First_Name,
        dh.agent_lname AS Last_Name,
        dh.agent_email AS Email,
        dh.agent_state AS State,
        dh.agent_phone1 AS Phone,
        dh.agent_level AS Level,
        SUM(CASE WHEN p.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
        SUM(CASE WHEN p.status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
        SUM(CASE WHEN p.status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
        FROM downline_hierarchy dh
        LEFT JOIN policies p ON dh.agent_id = p.p_agent_num
        WHERE dh.level > 1 
        GROUP BY dh.agent_id, dh.agent_fname, dh.agent_lname, dh.agent_email, dh.agent_state, dh.agent_phone1, dh.agent_level;`, [agent_ga]);
    return rows;
    }catch(err){
        console.error(err);
        return err;

    }
}
module.exports = {directListService, nonDirectListService};