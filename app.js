const express = require('express');
const app = express();
const router = require('./routes/routes')
const { pool, pool2 } = require('./config/db');
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.get('/', (req, res) => {
    res.send('Welcome to the Analytics API');
});

// app.get('/members', async(req, res) => {
//     const [query] = await pool.query('SELECT id FROM sso_users');
//     const [query2] = await pool2.query(`SELECT userid FROM userinfo`);
//     const result = query2.filter(item => !query.includes(item.userid));
//     console.log(result.length);
    
//     res.json(result);
// });
app.use("/api/un-reg", router);
app.use("/api/sold", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
