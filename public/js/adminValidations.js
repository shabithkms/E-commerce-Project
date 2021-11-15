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

//User Login

$(document).ready(function () {
    $('#userLogin').validate({
        rules: {
            mobileNo: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
            password: {
                minlength: 4,
                required: true,
                maxlength: 20
            },
            otp: {

                required: true,
                number: true
            }



        },
        messages: {
            mobileNo: {
                required: "Enter a mobile number",
                number: "Enter a valid mobile number",
                minlength: "Enter 10 numbers",
                maxlength: "Enter without country code"
            },
            password: {

                required: "Enter a password",
                minlength: "Password must be in 4-20 characters",
                maxlength: "Password must be in 4-20 characters"
            },
            otp: {
                required: "Enter a OTP",
                number: "Enter a valid OTP"

            }
        }
    })

})

//User signup

$(document).ready(function () {
    $('#signup').validate({
        rules: {
            firstName: {
                required: true,
                minlength: 4,
                maxlength: 20

            },
            lastName: {
                required: true,
                minlength: 4,
                maxlength: 15

            },
            mobileNo: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
            email: {
                required: true,
                email: true
            },
            password: {
                minlength: 4,
                required: true,

            }



        },
        messages: {
            firstName: {
                required: "Enter your firstname",
                minlength: "Enter at least 4 characters",
                maxlength: "Enter maximumm 20 caharacters"

            },
            lastName: {
                required: "Enter your lastname",
                minlength: "Enter minimum 4 characters",
                maxlength: "Enter maximum 15 characters"

            },
            mobileNo: {
                required: "Enter your mobile number",
                nnumber: "Enter a valid number",
                minlength: "Enter 10 numbers"
            },
            email: {
                required: "Enter your Email",
                email: "Enter a valid Email"
            },
            password: {
                required: "Enter a password",
                minlength: "Password must be in 4-20 characters"
            }
        }
    })

})
