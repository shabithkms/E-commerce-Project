//Checkout
$('#checkout-form').submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/place-order',
        method: 'post',
        data: $('#checkout-form').serialize(),
        success: (response) => {
            if (response.codSuccess) {
                console.log("cod success")
                location.href = "/order-success"
            } else if (response.razorpay) {

                razorpayPayment(response.resp)
                console.log(response)
            } else {
                location.href = response.url 
            }
        }
    })
})

function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_uHpEhuefBwxSUI", // Enter the Key ID generated from the Dashboard
        "amount": "response.amount", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Watchin",
        "description": "Test Transaction",
        "image": "data:image/png;base64,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",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {


            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Muhammed Shabith K",
            "email": "shabithkms2035@gmail.com",
            "contact": "7025259794"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(response, order) {

    $.ajax({
        url: '/verify-payment',
        data: {
            response,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                location.href = '/order-success'
            } else {
                location.href = '/cancelled'
            }
        }
    })
}

//Buy now

$('#buyNow-form').submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/buyNow',
        method: 'post',
        data: $('#buyNow-form').serialize(),
        success: (response) => {
            if (response.codSuccess) {
                console.log("cod success")
                location.href = "/order-success"
            } else if (response.razorpay) {

                razorpayBuyNowPayment(response.resp)
                console.log(response)
            } else {
                location.href = response.url
            }
        }
    })
})

function razorpayBuyNowPayment(order) {
    var options = {
        "key": "rzp_test_uHpEhuefBwxSUI", // Enter the Key ID generated from the Dashboard
        "amount": "response.amount", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Watchin",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {


            verifyBuyNowPayment(response, order)
        },
        "prefill": {
            "name": "Muhammed Shabith K",
            "email": "shabithkms2035@gmail.com",
            "contact": "7025259794"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyBuyNowPayment(response, order) {

    $.ajax({
        url: '/verify-buyNowPayment',
        data: {
            response,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                location.href = '/order-success'
            } else {
                location.href = '/cancelled'

            }
        }
    })
}

//Delete cart product

function deleteCartPro(cartId, proId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/delete-cart-product',
                data: {
                    cart: cartId,
                    product: proId,

                },
                method: 'post',
                success: (response) => {
                    if (response.removeProduct) {


                    } else {
                        alert("some error")
                    }
                }
            })
            Swal.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            )
            location.reload()

        }
    })
}

//Cancel order
function cancelOrder(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    alert(link)
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {

            Swal.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            )
            window.location = link;

        } else {
            return false
        }
    })
}

//Change product quantity in Cart
function changeQuantity(cartId, proId, stock, userId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    count = parseInt(count)
    console.log(userId)
    console.log(stock)
    if (quantity >= stock && count == 1) {
        swal.fire('Maximum stock limit')
    } else {


        $.ajax({
            url: '/change-product-quantity',
            data: {
                user: userId,
                cart: cartId,
                product: proId,
                count: count,
                quantity: quantity
            },
            method: 'post',
            success: (response) => {
                if (response.lastProduct) {

                    document.getElementById(proId + "a").disabled = true

                } else {
                    document.getElementById(proId).innerHTML = quantity + count
                    document.getElementById(proId + "a").disabled = false
                    console.log(response)
                    document.getElementById('total1').innerHTML = response.total
                    document.getElementById('total2').innerHTML = response.total
                    document.getElementById('subTotal' + proId).innerHTML = response.subTotal
                }
            }
        })
    }
}

