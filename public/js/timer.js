// const startingMinutes = 1
// let time = startingMinutes * 60

// const countdownEl = document.getElementById('countdown')

// setInterval(updateCountdown, 1000)

// function updateCountdown() {
//     const minutes = Math.floor(time / 60)
//     let seconds = time % 60
//     seconds = seconds < 1 ? '0' + seconds : seconds
//     countdownEl.innerHTML = `${minutes}:${seconds}`

//     time--


// }

let timerOn = true;
function timer(remaining) {
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    document.getElementById("countdown").innerHTML = `Time left: ${m} : ${s}`;
    remaining -= 1;
    if (remaining >= 0 && timerOn) {
        setTimeout(function () {
            timer(remaining);
        }, 1000);
        document.getElementById("resend").innerHTML = `
    `;
        return;
    }
    if (!timerOn) {
        return;
    }
    document.getElementById("resend").innerHTML = `Don't receive the code?
    <span class="font-weight-bold text-color cursor" onclick="timer(60)"><a href="/login/resend-otp">Resend</a>
    </span>`;
}
timer(60);
