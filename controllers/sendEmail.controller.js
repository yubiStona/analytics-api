const sendEmailService = require("../services/sendEmail.service")
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const sendEmail = async(req, res) => {
    try{
        const {to, token} = req.body;
        if(!to || !token){
            return res.status(400).json({error: 'Missing required fields: to or token'});
        } 
        const mail = await sendEmailService(to, token);
        res.status(200).json(mail);  
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const saveBase64Image= async(req,res)=> {
    cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
    });
  const {base64Data, originalName}= req.body
//   const filename = `${uuidv4()}.${originalName.split('.').pop()}`;
//   const base64Image = await base64Data.split(';base64,').pop();
//   await fs.promises.writeFile(`./public/uploads/${filename}`, base64Image, { encoding: 'base64' });
//   const url = `http://127.0.0.1:3000/uploads/${filename}`; 
//   res.status(200).json({ url });
  // If base64Data doesn't include data URI prefix, construct it
  const dataUri = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/${originalName.split('.').pop()};base64,${base64Data}`;

    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      public_id: uuidv4(),
      resource_type: "image"
    });

    const url = uploadResponse.secure_url;
    res.status(200).json({ url });
}

module.exports = {sendEmail, saveBase64Image};