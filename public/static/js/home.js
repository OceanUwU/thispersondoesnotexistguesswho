function typecode() {
    $('#code').val($('#code').val().toUpperCase());
}

function join() {
    window.location.href = `/play.html?intent=join&code=${$('#code').val()}`;
}

//replay animation
let logoSrc = $('#logo').attr('src');
$('#logo').attr('src', '');
$('#logo').attr('src', logoSrc);
//play banner sfx
(new Audio('/static/sfx.mp3')).play();

//show error (if any)
if (queryParams.hasOwnProperty('err'))
    bootbox.alert(queryParams.err);