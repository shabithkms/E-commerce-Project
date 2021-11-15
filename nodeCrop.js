const sharp=require('sharp')

const originalImage = "618fec3eec2a814ebe8b9d27d.jpg"

let outputImage='new-Image.jpg'

sharp(originalImage).extract({width:400,height:400,top:0,left:0}).toFile(outputImage)
.then(function (newFile){
    console.log("image cropeed");
})
.catch((err)=>{
    console.log(err);
})