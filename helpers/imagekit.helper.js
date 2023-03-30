require('dotenv').config()
const ImageKit = require('imagekit')
const Media = require('../model/Media')

// SDK initialization
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL,
})

// Upload function internally uses the ImageKit.io javascript SDK
const uploadMedia = async (media, folder, new_name) => {
    let nodeEnv = process.env.NODE_ENV
    let baseFolder = `${nodeEnv.charAt(0).toUpperCase() + nodeEnv.slice(1)}`
    const uploaded = imagekit
        .upload({
            folder: `${baseFolder}/${folder}`,
            file: media,
            fileName: new_name,
        })
        .then(async (result) => {
            const insertedMedia = await Media.create({
                url: result.url,
                response: result,
            })

            return insertedMedia
        })
        .catch((error) => {
            console.log('ERR', error)
            return false
        })

    return uploaded
}

module.exports = {
    uploadMedia,
}
