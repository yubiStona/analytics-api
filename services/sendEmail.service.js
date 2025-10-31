const nodemailer = require('nodemailer');
const { exec, spawn } = require('child_process');
const path = require('path');

const runPython = (token) => new Promise((resolve, reject) => {
  const inputData = JSON.stringify({
    accessToken: token
  });
  const pythonProcess = spawn('python.exe', ['python/generate_report.py'])
  let stdout = '';
  let stderr = '';

  pythonProcess.stdout.on('data', (data) => {
    stdout += data.toString();
    console.log("stdout",stdout)
  });

  pythonProcess.stderr.on('data', (data) => {
    stderr += data.toString();
    console.log("stderr",stderr)
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(`Python script exited with code ${code}: ${stderr}`));
    } else {
      resolve(stdout);
    }
  });

  pythonProcess.on('error', (error) => {
    console.log("error",error)
    reject(error);
  });

  pythonProcess.stdin.write(inputData);
  pythonProcess.stdin.end();

});
const sendEmailService = async(to, token)=>{
  try{
    await runPython(token);
  
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to,
      subject: "Data Analysis Report",
      attachments: [
        {
          filename: 'data_analysis.xlsx',
          path: path.resolve(__dirname, '../data_analysis.xlsx'), 
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
      // {
      //   filename: 'plType.jpg',
      //   content: attachments.plType.split(',')[1], 
      //   encoding: 'base64',
      //   cid: 'plType'
      // },
      // {
      //   filename: 'agent.jpg',
      //   content: attachments.agent.split(',')[1],
      //   encoding: 'base64',
      //   cid: 'agent'
      // },
      //       {
      //   filename: 'member.jpg',
      //   content: attachments.members.split(',')[1],
      //   encoding: 'base64',
      //   cid: 'members' 
      // },
      // {
      //   filename: 'policy.jpg',
      //   content: attachments.policy.split(',')[1],
      //   encoding: 'base64',
      //   cid: 'policy'
      // },
      //       {
      //   filename: 'tier.jpg',
      //   content: attachments.tier.split(',')[1], 
      //   encoding: 'base64',
      //   cid: 'tier' 
      // },
      // {
      //   filename: 'reinstated.jpg',
      //   content: attachments.reinstated.split(',')[1],
      //   encoding: 'base64',
      //   cid: 'reinstated'
      // },
    ]
    };
    await transporter.sendMail(mailOptions);
    return {message:"Email sent successfully"};
  }catch(err){
    console.error(err);
    return err;
  }

}
module.exports = sendEmailService;