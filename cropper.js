// const imageURL = "public/productImages/618feb0cec2a814ebe8b9d26a.jpg";
// // const inputImage = new Image();
// inputImage.src = imageURL;
// // this image will hold our source image data
// const inputImage = new Image();

// // we want to wait for our image to load
// inputImage.onload = () => {
//   // create a canvas that will present the output image
//   const outputImage = document.createElement("canvas");

//   // set it to the same size as the image
//   outputImage.width = inputImage.naturalWidth;
//   outputImage.height = inputImage.naturalHeight;

//   // draw our image at position 0, 0 on the canvas
//   const ctx = outputImage.getContext("2d");
//   ctx.drawImage(inputImage, 0, 0);

//   // show both the image and the canvas
//   document.body.appendChild(inputImage);
//   document.body.appendChild(outputImage);
// };

// // start loading our image
// inputImage.src = imageURL;

// // the desired aspect ratio of our output image (width / height)
// const outputImageAspectRatio = 1;

// // this image will hold our source image data
// const inputImage = new Image();

// // we want to wait for our image to load
// inputImage.onload = () => {
//   // let's store the width and height of our image
//   const inputWidth = inputImage.naturalWidth;
//   const inputHeight = inputImage.naturalHeight;

//   // get the aspect ratio of the input image
//   const inputImageAspectRatio = inputWidth / inputHeight;

//   // if it's bigger than our target aspect ratio
//   let outputWidth = inputWidth;
//   let outputHeight = inputHeight;
//   if (inputImageAspectRatio > outputImageAspectRatio) {
//     outputWidth = inputHeight * outputImageAspectRatio;
//   } else if (inputImageAspectRatio < outputImageAspectRatio) {
//     outputHeight = inputWidth / outputImageAspectRatio;
//   }

//   // create a canvas that will present the output image
//   const outputImage = document.createElement("canvas");

//   // set it to the same size as the image
//   outputImage.width = outputWidth;
//   outputImage.height = outputHeight;

//   // draw our image at position 0, 0 on the canvas
//   const ctx = outputImage.getContext("2d");
//   ctx.drawImage(inputImage, 0, 0);

//   // show both the image and the canvas
//   document.body.appendChild(inputImage);
//   document.body.appendChild(outputImage);
// };

// // start loading our image
// inputImage.src = imageURL;
// // the desired aspect ratio of our output image (width / height)
// const outputImageAspectRatio = 1;

// // this image will hold our source image data
// const inputImage = new Image();

// // we want to wait for our image to load
// inputImage.onload = () => {
//   // let's store the width and height of our image
//   const inputWidth = inputImage.naturalWidth;
//   const inputHeight = inputImage.naturalHeight;

//   // get the aspect ratio of the input image
//   const inputImageAspectRatio = inputWidth / inputHeight;

//   // if it's bigger than our target aspect ratio
//   let outputWidth = inputWidth;
//   let outputHeight = inputHeight;
//   if (inputImageAspectRatio > outputImageAspectRatio) {
//     outputWidth = inputHeight * outputImageAspectRatio;
//   } else if (inputImageAspectRatio < outputImageAspectRatio) {
//     outputHeight = inputWidth / outputImageAspectRatio;
//   }

//   // calculate the position to draw the image at
//   const outputX = (outputWidth - inputWidth) * 0.5;
//   const outputY = (outputHeight - inputHeight) * 0.5;

//   // create a canvas that will present the output image
//   const outputImage = document.createElement("canvas");

//   // set it to the same size as the image
//   outputImage.width = outputWidth;
//   outputImage.height = outputHeight;

//   // draw our image at position 0, 0 on the canvas
//   const ctx = outputImage.getContext("2d");
//   ctx.drawImage(inputImage, outputX, outputY);

//   // show both the image and the canvas
//   document.body.appendChild(inputImage);
//   document.body.appendChild(outputImage);
// };

// // start loading our image
// inputImage.src = imageURL;


// var fs=require('fs')


/**
 * @param {string} url - The source image
 * @param {number} aspectRatio - The aspect ratio
 * @return {Promise<HTMLCanvasElement>} A Promise that resolves with the resulting image as a canvas element
 */
function crop(url, aspectRatio) {
    // we return a Promise that gets resolved with our canvas element
    return new Promise((resolve) => {
        // this image will hold our source image data
        const inputImage = new Image();

        // we want to wait for our image to load
        inputImage.onload = () => {
            // let's store the width and height of our image
            const inputWidth = inputImage.naturalWidth;
            const inputHeight = inputImage.naturalHeight;

            // get the aspect ratio of the input image
            const inputImageAspectRatio = inputWidth / inputHeight;

            // if it's bigger than our target aspect ratio
            let outputWidth = inputWidth;
            let outputHeight = inputHeight;
            if (inputImageAspectRatio > aspectRatio) {
                outputWidth = inputHeight * aspectRatio;
            } else if (inputImageAspectRatio < aspectRatio) {
                outputHeight = inputWidth / aspectRatio;
            }

            // calculate the position to draw the image at
            const outputX = (outputWidth - inputWidth) * 0.5;
            const outputY = (outputHeight - inputHeight) * 0.5;

            // create a canvas that will present the output image
            const outputImage = document.createElement("canvas");

            // set it to the same size as the image
            outputImage.width = outputWidth;
            outputImage.height = outputHeight;

            // draw our image at position 0, 0 on the canvas
            const ctx = outputImage.getContext("2d");
            ctx.drawImage(inputImage, outputX, outputY);
            resolve(outputImage);
        };

        // start loading our image
        inputImage.src = url;
        console.log(url);
    });
}




crop("https://res.cloudinary.com/demo/image/upload/c_crop,g_face/woman.jpg", 1 / 1).then(canvas => {
    let a=canvas.toDataURL();
    console.log(a);
    document.body.appendChild(canvas);
});

crop("https://res.cloudinary.com/demo/image/upload/c_crop,g_face/woman.jpg", 16 / 9).then(canvas => {
    document.body.appendChild(canvas);
});

crop("https://res.cloudinary.com/demo/image/upload/c_crop,g_face/woman.jpg", 2 / 3).then(canvas => {
    document.body.appendChild(canvas);
});