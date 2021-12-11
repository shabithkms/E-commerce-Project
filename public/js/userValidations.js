$(document).ready(function () {
    $('#user-signup').validate({
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
                minlength: 5,
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
                minlength: "Password must be in 5-20 characters"
            }
        }
    })
})

$(document).ready(function () {
    $('#setPassword').validate({
        rules: {
            password1: {
                required: true,
                minlength: 5,
                maxlength: 20

            },
            password2: {
                required: true,
                minlength: 5,
                maxlength: 20,        

            }
        }
    })
})

jQuery(function ($) {

    $(".sidebar-dropdown > a").click(function () {
        $(".sidebar-submenu").slideUp(200);
        if (
            $(this)
                .parent()
                .hasClass("active")
        ) {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .parent()
                .removeClass("active");
        } else {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .next(".sidebar-submenu")
                .slideDown(200);
            $(this)
                .parent()
                .addClass("active");
        }
    });

    $("#close-sidebar").click(function () {
        $(".page-wrapper").removeClass("toggled");
    });
    $("#show-sidebar").click(function () {
        $(".page-wrapper").addClass("toggled");
    });
});

$(document).ready(function () {
    $('#address-form').validate({
        rules: {
            FirstName: {
                required: true,
                minlength: 4,
                maxlength: 20

            },
            LastName: {
                required: true,
                minlength: 4,
                maxlength: 15

            },
            House:{
                required:true,
                minlength:10,
                maxlength:50
            },
            Street:{
                required:true,
                minlength:5
            },
            Town:{
                required:true,
                minlength:5
            },
            PIN:{
                required:true,
                number:true,
                minlength:6,
                maxlength:6
            },
            Mobile: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
            Email: {
                required: true,
                email: true
            }
        },        
    })
})

$(document).ready(function () {
    $('#change-password').validate({
        rules: {
            password1: {
                required: true,
                minlength: 5,
                maxlength: 20

            },
            password2: {
                required: true,
                minlength: 5,
                maxlength: 20,
            },
            current:{
                required:true,
                minlength:5,
                maxlength:20
            }
        }
    })
})
$(document).ready(function () {
    $('#profile').validate({
        rules: {
            firstname: {
                required: true,
                minlength: 5,
                maxlength: 20

            },
            lastname: {
                required: true,
                minlength: 5,
                maxlength: 20,
            },
            mobileNo:{
                required:true,
                number:true,
                minlength:5,
                maxlength:20
            },
            email:{
                email:true,
                required:true
            },
        }
    })
})