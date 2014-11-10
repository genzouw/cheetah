(function($) {
	if ($.ajaxPrefilter) {
		$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
			if(originalOptions.type.toLowerCase() == 'post'){
				options.data = jQuery.param($.extend(originalOptions.data||{}, {
					timeStamp: new Date().getTime()
				}));
			}
		});
	}

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
			url: "//s3-ap-northeast-1.amazonaws.com/daito-lead-time-info/products/update_date.json",
			type: "GET",
			dataType: "json",
			success: function( data, status ) {
				var updateDate = data.update_date;
				$.ajax({
					// url: "//s3-ap-northeast-1.amazonaws.com/daito-lead-time-info/products/" + productCode + ".json?_=" + (new Date()),
					url: "//s3-ap-northeast-1.amazonaws.com/daito-lead-time-info/products/" + productCode + ".json",
					type: "GET",
					dataType: "json",
					success: function( data, status ) {
						data["データ出力日時"] = updateDate;
						setting.success( data, status );
					},
					error:setting.error
				});
			},
			error: setting.error
		});

		return this;
	};
})(jQuery);
