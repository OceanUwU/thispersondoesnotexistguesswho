jQuery.extend({
    getQueryParameters: str => (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0]
});

var queryParams = $.getQueryParameters();
for (let i in queryParams)
    if (typeof queryParams[i] == 'string')
        queryParams[i] = decodeURIComponent(queryParams[i]);
history.replaceState({}, $('title').html(), '/');