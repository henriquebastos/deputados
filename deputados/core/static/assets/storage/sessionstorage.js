	
	var SessionStorage = ( function ( sessionStorage ) {
		
		var store = function (base, data) {
			sessionStorage.setItem(base, data);
		};

		var drop = function () {
			sessionStorage.clear();
		};
		
		var get = function (base){
			return sessionStorage.getItem(base);
		};
		
		var update = function (base, data){
			store(base, data);
		};
		
		return {
			store : store,
			drop  : drop,
			get   : get,
			update: update
		};
		
	})( window.sessionStorage );