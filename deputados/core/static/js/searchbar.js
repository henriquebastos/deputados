 
 (function ( $ , session ) {
 
 	var input 	         = $('.input-search-bar'),
 		btn_search       = $('#btn-search-bar'),
 		tipo_pesquisa    = $('#search-bar-text'),
 		opcoesPesquisa	 = $('#search-bar-menu li a'),
		textoOpcaoPesquisaSelecionada = $('#search-bar-text');
 		
 	var tpl      = $('#template-typeahead'),
		template = Handlebars.compile(tpl.html());
	
	var tipo_session                  = session.get('tipo-pesquisa') == null ? "pessoas" : session.get('tipo-pesquisa'),
		popover_tipo_pesquisa_session = session.get('popover-tipo-pesquisa') == null ? false : session.get('popover-tipo-pesquisa');
	
	$.each(opcoesPesquisa, function(key, el){
		
		var self = $(el);

		if (tipo_session == self.data('tipo-pesquisa')) {

			var text = self.clone()  
						   .children()
						   .remove() 
						   .end()
						   .text(),

    	    icone = self.find('span').clone();

    		textoOpcaoPesquisaSelecionada.html(icone).append(text);
		};
	});

	btn_search.popover({
		animation : true,
		placement : 'bottom',
		container : 'body',
		content   : 'Informe o tipo de pesquisa!'
	});

	btn_search.on('shown.bs.popover', function () {
		if (!popover_tipo_pesquisa_session) {
	  		setTimeout(function() {
				btn_search.popover('destroy');	
			} , 3000);
		} else {
			btn_search.popover('hide');
		}
	});

	btn_search.on('click', function() {
		$('.popover').remove();
	});
	
    opcoesPesquisa.on('click', function(e) {

    	e.preventDefault();

    	var self = $(this),
    		text = self.clone()  
					   .children()
					   .remove() 
					   .end()
					   .text(),

    	    icone    = $(this).find('span').clone();

    	textoOpcaoPesquisaSelecionada.html(icone).append(text);

    	session.update('tipo-pesquisa', text.trim().toLowerCase());
    });


 	input.typeahead({
 		 name: 'deputados',
 		 template: template,
 		 engine: Handlebars,
 		 limit: 8,
 		 remote: {
 		 	url     : '/parlamentar/autocomplete?tipo=%TIPO&chave=%CHAVE',
 		 	dataType: 'json',
 		 	cache: false,
 		 	replace: function(url, query) {
 		 		
 		 		var tipo = session.get('tipo-pesquisa') == null ? "pessoas" : session.get('tipo-pesquisa');

 		 		var rpl = url.replace('%TIPO', tipo).replace('%CHAVE', query);

 		 		return rpl;
 		 	},
 		 	filter: function(data) {
 		 		
 		 		var array = [];

 		 		var tipo_selecionado = session.get('tipo-pesquisa');

				$.map(data, function( item ) {

	 		 		switch (tipo_selecionado) {

	 		 			case "pessoas":
	 		 			  	array.push(item.nomeDeputado);
	 		 				break;

	 		 			case "partidos":
	 		 			  	array.push(item.partido);
	 		 				break;

	 		 			case "estados":
	 		 			  	array.push(item.uf)
	 		 				break;
	 		 		}; 		 			
		 		});

		 		return array;
 		 	}
 		}
	})
	.on('typeahead:selected', function(e, data) {
		
		var tipo  = session.get('tipo-pesquisa');
		
 		window.location.href = '/parlamentar/pesquisa?tipo=' + tipo + '&chave=' + data.value;
 	});

	input.on('keypress', function(e) {
		if (e.keyCode == 13) {
			if (input.val()) {
				var tipo = session.get('tipo-pesquisa');
				window.location.href = '/parlamentar/pesquisa?tipo=' + tipo + '&chave=' + input.val();		
			};
		};
	});

	if (!popover_tipo_pesquisa_session) {
		btn_search.popover('show');
		session.store('popover-tipo-pesquisa', true);
	}
	
})( jQuery , SessionStorage );