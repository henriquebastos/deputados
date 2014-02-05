(function ( $, _ ) {
	
	var paginate = $("#btn-paginate"),
		list     = $("#deputados-list"),
		tpl		 = _.compile($("#template-deputados").html());

	paginate.on('click', function () {

		var self = $(this),
			page = self.data('page') + 1;

		var qsTipo  = queryString['tipo'],
			qsChave = queryString['chave'];

		self.button('loading');

		var qs = { 'page' : page };

		if ( qsTipo && qsChave ) {
			qs['tipo']  =  qsTipo;
			qs['chave'] =  qsChave;
		};

		request('/parlamentar/pesquisa/', qs, function( data ) {
			if (data != null) {
				if (data.deputados.length < 16) { paginate.hide(); };
				list.append(tpl(data));
			} else{
				paginate.hide();
			}
		});

		self.data('page', page);
		
		setTimeout((function() {
			self.button('reset');
		}), 3000);
	});

})( jQuery, Handlebars );