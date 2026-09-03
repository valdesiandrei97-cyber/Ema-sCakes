emailjs.init({
    publicKey: "xeTPCgSK8mgwHugHW"
});

function sendReservation(date){
    return emailjs.send(
        "service_7gdn8hj",
        "template_iob8td6",
        {
            selected_date: date,
            selected_time: "After 20:00"
        }
    );
}
