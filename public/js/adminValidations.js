//Add Product

$(document).ready(function () {
    $('#add-prod').validate({
        rules: {
            name: {
                required: true,
                minlength: 4
            },
            brand: {
                required: true
            },
            category: {
                required: true

            },
            cost: {
                required: true
            },
            price: {
                required: true

            },
            stock: {
                required: true
            },
            image1: {
                required: true
            },
            image2: {
                required: true
            },
            image3: {
                required: true
            },
            image4: {
                required: true
            }


        }
    })

})

//Edit product

$(document).ready(function () {
    $('#edit-prod').validate({
        rules: {
            name: {
                required: true,
                minlength: 4
            },
            brand: {
                required: true
            },
            category: {
                required: true

            },
            cost: {
                required: true
            },
            price: {
                required: true

            },
            stock: {
                required: true
            }



        },
        submitHandler: function submitForm(form) {
            console.log(form)
            swal({
                title: "Are you sure?",
                text: "This form will be submitted",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((isOkay) => {
                if (isOkay) {
                    console.log("isokay")
                    form.submit();
                }
            });
            return false;
        }
    })

})

//Add brands

$(document).ready(function () {
    $('#add-brand').validate({
        rules: {

            brand: {
                required: true
            },
            description: {
                required: true
            },
            logo: {
                required: true
            }



        }
    })

})

//Edit brands

$(document).ready(function () {
    $('#edit-brand').validate({
        rules: {

            brand: {
                required: true
            },
            description: {
                required: true
            }



        },
        submitHandler: function submitFormBrand(form) {
            console.log(form)
            swal({
                title: "Are you sure?",
                text: "This form will be submitted",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((isOkay) => {
                if (isOkay) {
                    console.log("isokay")
                    form.submit();
                }
            });
            return false;
        }
    })

})

//Add Category

$(document).ready(function () {
    $('#add-cat').validate({
        rules: {
            category: {
                required: true,
                minlength: 4
            }
        }
    })
})

$(document).ready(function () {
    $('#edit-cat').validate({
        rules: {
            category: {
                required: true,
                minlength: 4
            }
        },
        submitHandler: function submitFormCat(form) {
            console.log(form)
            swal({
                title: "Are you sure?",
                text: "This form will be submitted",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((isOkay) => {
                if (isOkay) {
                    console.log("isokay")
                    form.submit();
                }
            });
            return false;
        }
    })
})

//Admin login

$(document).ready(function () {
    $('#adminLogin').validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                minlength: 4,
                required: true
            }

        },
        messages: {
            email: {
                required: "Enter a email",
                email: "Enter a valid email"
            },
            password: {
                required: "Enter a Password",
                minlength: "Password must be in 4-20 characters",
                maxlength: "Password must be in 4-20 characters"
            }
        }
    })

})

//Offers
$(document).ready(function () {
    $('#productPage').validate({
        rules: {
            Coupon: {
                required: true,
                minlength: 5,
                maxlength:20,
            },
            Starting:{
                required:true,
            },
            Expiry:{
                required:true,
            },
            Offer:{
                required:true,
            },
            Category:{
                required:true,
            },
            Product:{
                required:true,
            }

        }
    })
})

