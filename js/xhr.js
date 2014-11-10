(function( jQuery ) {
	if ( window.XDomainRequest ) {
		jQuery.ajaxTransport(function( s, userOptions, jqXHR ) {
			if ( s.crossDomain && s.async ) {
				if ( s.timeout ) {
					s.xdrTimeout = s.timeout;
					delete s.timeout;
				}
				var xdr;
				var progressEvent = {lengthComputable: false, loaded: 0, total: 0};
				return {
					send: function( _, complete ) {
						function callback( status, statusText, responses, responseHeaders ) {
							xdr.onload = xdr.onerror = xdr.ontimeout = xdr.onprogress = jQuery.noop;
							xdr = undefined;
							complete( status, statusText, responses, responseHeaders );
						}
						xdr = new XDomainRequest();
						xdr.open( s.type, s.url );
						xdr.onload = function() {
							callback( 200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType );
						};
						if ( userOptions.progress ) {
							xdr.onprogress = function() {

								progressEvent.loaded = xdr.responseText.length;
								return userOptions.progress(jqXHR, progressEvent);
							};
						} else {
							xdr.onprogress = function() {};
						}
						xdr.onerror = function() {
							callback( 404, "Not Found" );
						};
						if ( s.xdrTimeout ) {
							xdr.ontimeout = function() {
								callback( 0, "timeout" );
							};
							xdr.timeout = s.xdrTimeout;
						}
						xdr.send( ( s.hasContent && s.data ) || null );
					},
					abort: function() {
						if ( xdr ) {
							xdr.onerror = jQuery.noop();
							xdr.abort();
						}
					}
				};
			}
		});
	}
})( jQuery );
