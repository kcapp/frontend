module.exports = {
    onMount() {
        document.write('<script type="text/javascript" src="/javascripts/qrcode.min.js"><\/script>');
        $(function() {
            new QRCode(document.getElementById("qrcode"), {
                text: window.location.href,
                width: 256,
                height: 256,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            $("#qrcode > img").css({"margin":"auto"});
        });
    }
};