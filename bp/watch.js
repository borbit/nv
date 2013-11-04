var sock = new SockJS('/io');

sock.onopen = function() {
  sock.send(JSON.stringify({
    url: window.location.pathname
  , type: 'watch'
  }));
};

sock.onmessage = function(e) {
  var message = JSON.parse(e.data);
  if (message.type == 'reload') {
    window.location.reload();
  }
};