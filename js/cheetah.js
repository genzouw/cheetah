(function($) {
	$.outputLeadTimes = function(productCode, options) {
		var defaultOptions = {
			"success": function( json, status ) {
			},
			"error": function() {
			}
		};
		var setting = $.extend(defaultOptions, options);

		$.ajax({
			// url: "//s3-ap-northeast-1.amazonaws.com/daito-lead-time-info/products/" + productCode + ".json?_=" + (new Date()),
			url: "//s3-ap-northeast-1.amazonaws.com/daito-lead-time-info/products/" + productCode + ".json",
			type: "GET",
			dataType: "json",
			"async":false,
			"success":setting.success,
			"error":setting.error
		});

		return this;
	};
})(jQuery);
