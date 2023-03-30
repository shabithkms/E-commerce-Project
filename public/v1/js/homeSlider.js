
$('.slider-active').owlCarousel({
    loop: true,
    nav: true,
    autoplay: false,
    autoplayTimeout: 5000,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    item: 1,
    navText: ['<i class="ion-ios-arrow-left"></i>', '<i class="ion-ios-arrow-right"></i>'],
    responsive: {
        0: {
            items: 1
        },
        768: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})


/* product slider active */
$('.product-slider-active').owlCarousel({
    loop: true,
    nav: false,
    item: 4,
    responsive: {
        0: {
            items: 1
        },
        768: {
            items: 2
        },
        992: {
            items: 3
        },
        1000: {
            items: 4
        },
        1200: {
            items: 4
        }
    }
})



$(document).ready(function () {
    $(".cur_toggle").click(function () {
        $(".cur_drop").slideToggle(500);
    });
});
