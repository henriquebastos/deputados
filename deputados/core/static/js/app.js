
	var request = function ( url, param, callback) {
	
		var req = $.get( url, param, function( data ) { 
			callback(JSON.parse(data)); 
		})
		  .fail(function () { 
			callback(null);
			console.log('request failed - resource : ' + url);
		});
	};

	var retornaPorcentagem = function( valor, total ) {
		return (valor / total) * 100;
	};

	var queryString = (function(a) {
		if (a == "") return {};
		var r = {};
		for (var i = 0; i < a.length; i++) {
			var q = a[i].split('=');
			r[q[0]] = decodeURIComponent(q[1]);
		};
		return r;
	})(window.location.search.substring(1).split('&'));

	Handlebars.registerHelper('list', function(context, options) {
		var ret = "";
		if (context instanceof Array) {
			for (var i = 0; i < context.length; i++) {
				ret = ret + options.fn(context[i]);
			}
		} else {
			ret = options.fn(context);
		}
		return ret;
	});
