
function deleteproduct(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Brand has been deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
function deleteBrand(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Brand has been deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}

function deleteCategory(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Brand has been deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}





function fileValidation() {
    const imagebox = document.getElementById('image-box')
    const crop_btn = document.getElementById('crop-btn')
    var fileInput = document.getElementById('file');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please upload image only!',

        })
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%">`
        const image = document.getElementById('image')
        document.getElementById('image-box').style.display = 'block'
        document.getElementById('crop-btn').style.display = 'block'
        document.getElementById('confirm-btn').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('file');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgview1').src = url
                document.getElementById('image-box').style.display = 'none'
                document.getElementById('crop-btn').style.display = 'none'
                document.getElementById('confirm-btn').style.display = 'block'
            });
        });
    }
}

function fileValidation1() {
    const imagebox = document.getElementById('image-box1')
    const crop_btn = document.getElementById('crop-btn1')
    var fileInput = document.getElementById('file1');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please upload image only!',

        })
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%">`
        const image = document.getElementById('image')
        document.getElementById('image-box1').style.display = 'block'
        document.getElementById('crop-btn1').style.display = 'block'
        document.getElementById('confirm-btn1').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('file1');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgview1').src = url
                document.getElementById('image-box1').style.display = 'none'
                document.getElementById('crop-btn1').style.display = 'none'
                document.getElementById('confirm-btn1').style.display = 'block'
            });
        });
    }
}
function fileValidation2() {
    const imagebox = document.getElementById('image-box1')
    const crop_btn = document.getElementById('crop-btn1')
    var fileInput = document.getElementById('file2');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please upload image only!',

        })
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%">`
        const image = document.getElementById('image')
        document.getElementById('image-box1').style.display = 'block'
        document.getElementById('crop-btn1').style.display = 'block'
        document.getElementById('confirm-btn1').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('file2');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgview2').src = url
                document.getElementById('image-box1').style.display = 'none'
                document.getElementById('crop-btn1').style.display = 'none'
                document.getElementById('confirm-btn1').style.display = 'block'
            });
        });
    }
}
function fileValidation3() {
    const imagebox = document.getElementById('image-box1')
    const crop_btn = document.getElementById('crop-btn1')
    var fileInput = document.getElementById('file3');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please upload image only!',

        })
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%">`
        const image = document.getElementById('image')
        document.getElementById('image-box1').style.display = 'block'
        document.getElementById('crop-btn1').style.display = 'block'
        document.getElementById('confirm-btn1').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('file3');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgview3').src = url
                document.getElementById('image-box1').style.display = 'none'
                document.getElementById('crop-btn1').style.display = 'none'
                document.getElementById('confirm-btn1').style.display = 'block'
            });
        });
    }
}
function fileValidation4() {
    const imagebox = document.getElementById('image-box1')
    const crop_btn = document.getElementById('crop-btn1')
    var fileInput = document.getElementById('file4');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please upload image only!',

        })
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%">`
        const image = document.getElementById('image')
        document.getElementById('image-box1').style.display = 'block'
        document.getElementById('crop-btn1').style.display = 'block'
        document.getElementById('confirm-btn1').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('file4');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgview4').src = url
                document.getElementById('image-box1').style.display = 'none'
                document.getElementById('crop-btn1').style.display = 'none'
                document.getElementById('confirm-btn1').style.display = 'block'
            });
        });
    }
}


// function viewMainImage(event) {
//     document.getElementById('imgView').src = URL.createObjectURL(event.target.files[0])
//     let file = event.target.files[0].name
//     let extension = file.split('.').pop()
//     if (extension == 'jpeg' || extension == 'png' || extension == 'jpg') {
//         $('#imgView').show()
//         $('#sub').show()
//         $('#errMsg').hide()

//     }
//     else {
//         $('#sub').hide()
//         $('#errMsg').show()
//     }
// }

// function viewImage1(event) {
//     document.getElementById('imgView1').src = URL.createObjectURL(event.target.files[0])
//     let file = event.target.files[0].name
//     let extension = file.split('.').pop()
//     if (extension == 'jpeg' || extension == 'png' || extension == 'jpg') {
//         $('#imgView1').show()
//         $('#sub').show()
//         $('#errMsg').hide()

//     }
//     else {
//         $('#sub').hide()
//         $('#errMsg').show()
//     }
// }
// function viewImage2(event) {
//     document.getElementById('imgView2').src = URL.createObjectURL(event.target.files[0])
//     let file = event.target.files[0].name
//     let extension = file.split('.').pop()
//     if (extension == 'jpeg' || extension == 'png' || extension == 'jpg') {
//         $('#imgView2').show()
//         $('#sub').show()
//         $('#errMsg').hide()
//     }
//     else {
//         $('#sub').hide()
//         $('#errMsg').show()
//     }
// }
// function viewImage3(event) {
//     document.getElementById('imgView3').src = URL.createObjectURL(event.target.files[0])
//     let file = event.target.files[0].name
//     let extension = file.split('.').pop()
//     if (extension == 'jpeg' || extension == 'png' || extension == 'jpg') {
//         $('#imgView3').show()
//         $('#sub').show()
//         $('#errMsg').hide()
//     }
//     else {
//         $('#sub').hide()
//         $('#errMsg').show()
//     }
// }



