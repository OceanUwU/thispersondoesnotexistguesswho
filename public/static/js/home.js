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

//show error (if any)
if (queryParams.hasOwnProperty('err'))
    bootbox.alert(queryParams.err);

$('.extra').hide();

function showExtra() {
    $('#showExtra').hide()
    $('.extra').show();
}