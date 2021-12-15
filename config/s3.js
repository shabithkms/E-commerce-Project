const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')


const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretKey = process.env.AWS_SECRET_KEY

// const s3 = new s3({
//     region,
//     accessKeyId,
//     secretKey
// })
module.exports={
 //upload a file to s3

    uploadFile : (file) => {
        // const fileStream = fs.createReadStream(file.path)
        const fileContent = fs.readFileSync(file)

        const uploadParams = {
            Bucket: bucketName,
            Body: fileStream,
            Key: file.filename
        } 
        return s3.upload(uploadParams, (err, data) => {
            if (err) {
                throw err;
                console.log(err);
            } else {
                console.log(`uploaded successfully.${data.Location}`);
            }
        })
    },
    
}

