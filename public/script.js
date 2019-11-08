(function() {
    let canvas = $("#canvas-body");
    let x, y;
    let drawing = false;
    const c = canvas[0].getContext("2d");
    //console.log(c);
    const rect = canvas[0].getBoundingClientRect();

    const sign = $("#sig");
    console.log("sigh ", sign.input);
    //console.log(rect);

    // canvas.on("click", e => {
    //     console.log(e);
    // });
    canvas.on("mousedown", e => {
        drawing = true;
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        // console.log(y, x);
    });

    canvas.on("mousemove", e => {
        if (drawing === true) {
            draw(c, x, y, e.clientX - rect.left, e.clientY - rect.top);
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
    });

    canvas.on("mouseup", e => {
        drawing = false;
        //console.log(e.toDataUrl);
        const dataURL = canvas[0].toDataURL();
        sign.val(dataURL);
        console.log(sign.val());
    });

    function draw(c, x1, y1, x2, y2) {
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.closePath();
    }
})();
