(function() {
    let canvas = $("#canvas-body");
    let x, y;
    let drawing = false;
    const c = canvas[0].getContext("2d");
    const rect = canvas[0].getBoundingClientRect();
    const sign = $("#sig");
    const submit = $("#submit");
    const form = $(".registration");

    submit.on("click", e => {
        for (let i = 0; i <= 2; i++) {
            if (!form[0][i].value) {
                $("#error").css("visibility", "visible");
                e.preventDefault();
            }
        }
    });

    canvas.on("mousedown", e => {
        drawing = true;
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    });

    canvas.on("mousemove", e => {
        if (drawing === true) {
            draw(c, x, y, e.clientX - rect.left, e.clientY - rect.top);
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
    });

    canvas.on("mouseup", () => {
        drawing = false;
        const dataURL = canvas[0].toDataURL();
        sign.val(dataURL);
        //console.log(sign.val());
    });

    function draw(c, x1, y1, x2, y2) {
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.closePath();
    }
})();
