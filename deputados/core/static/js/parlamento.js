
( function( $, _ ) {

	// modal
	var modalLoading = $('#modal-loading'),
		modal        = $('#modal-details'),
		modalContent = $('#modal-details .modal-content');

	// link and inputs
	var inputIdeParlamentar  	  = $('#ide-parlamentar'),
		inputFotoParlamentar 	  = $('#foto-parlamentar'),
		inputMatriculaParlamentar = $('#matricula-parlamentar');


	// templates

	var templates = {
		comissoes  : _.compile($('#template-comissao').html()),
		cargos     : _.compile($('#template-cargo-comissao').html()),
		liderancas : _.compile($('#template-lideranca').html()),
		exercicios : _.compile($('#template-periodo-exercicio').html()),
		detalhes   : _.compile($('#template-detalhe-parlamentar').html()),
	};
	
	
	$('body').on('click', '.view-detail', function() {
		
		var ide       = $(this).data('id'),
			foto      = $(this).data('foto'),
			matricula = $(this).data('matricula');

		inputIdeParlamentar      .val(ide);
		inputFotoParlamentar     .val(foto);
		inputMatriculaParlamentar.val(matricula);

		modalLoading.modal('show');

		request('/parlamentar/detalhes/', { 'ide' : ide }, function ( data ) {
			
			if (data) {
				
				data.Deputado.foto = foto;
				
				modalContent.html(templates.detalhes(data.Deputado));

				$('#tab-comissoes')      .html(templates.comissoes(data.Deputado.comissoes));
				$('#tab-cargo-comissoes').html(templates.cargos(data.Deputado.cargosComissoes));
				$('#tab-liderancas')     .html(templates.liderancas(data.Deputado.historicoLider));
				$('#tab-periodo-exec')   .html(templates.exercicios(data.Deputado.periodosExercicio));

				grafico();
				popover();
			};

			modalLoading.modal('hide');
				
			modal.modal('show');
		});
	});

	var grafico  = function (onload, dataInicio, dataFim ) {
		
		$('#tab-presencas #lista-periodos a').on('click', function () {
			
			$('#lista-periodos a').removeClass('active');
			
			$(this).addClass('active');

			$("#grafico-content-grafico").html("");

			grafico_loading_show();

			request('/parlamentar/grafico/', { 
				'matricula' : inputMatriculaParlamentar.val(), 
				'dataIni'   : $(this).data('inicio'), 
				'dataFim'   : $(this).data('fim') }, function ( data ) {

				if (data) {

					$("#grafico-content-grafico").html("");
				
					$.each(data, function (ano, sessoes) {
						
						var percPresencas = retornaPorcentagem(sessoes.presencas, sessoes.sessoes),
							percAusencias = retornaPorcentagem(sessoes.ausencias, sessoes.sessoes);

						var html = 	'<h4>' + ano + '</h4>' +
									'<div class="progress">' +
									  '<div class="progress-bar progress-bar-success" style="width: ' + percPresencas +'%">' +
									    '<span>' + Math.round(percPresencas)  +  '%</span>' +
									  '</div>';
									if (Math.round(percAusencias) > 0) {
									  html += '<div class="progress-bar progress-bar-danger" style="width: ' + percAusencias +'%">' +
									    		'<span>' + Math.round(percAusencias)  +  '%</span>' +
									  		  '</div>';
									};
						html += '</div>';

						grafico_loading_hide();

						$("#grafico-content-grafico").append(html);
					});
				};
			});
	    });
	};

	var popover = function() {

	};

	var grafico_loading_show = function ( ) {
		$('#grafico-loading').removeClass('hide');
	};

	var grafico_loading_hide = function ( ) {
		$('#grafico-loading').addClass('hide');
	};

})( jQuery, Handlebars );

