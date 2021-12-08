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
        "image": "https://example.com/your_logo",
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

