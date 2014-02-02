#-*- coding: utf-8 -*-

import urllib
import urllib2
import xml.etree.ElementTree as ET
import operator
import xmldict
import pickle
import math
import datetime
import itertools


WEBSERVICES = {
	'WSDeputados' 		  : 'http://www.camara.gov.br/SitCamaraWS/Deputados.asmx/ObterDeputados',
	'WSDeputado'   		  : 'http://www.camara.gov.br/SitCamaraWS/Deputados.asmx/ObterDetalhesDeputado',
	'WSPresencasDeputado' : 'http://www.camara.gov.br/SitCamaraWS/sessoesreunioes.asmx/ListarPresencasParlamentar',
}

class WSDeputados(object):
	""" 
		Esta classe retorna uma lista de dicionarios contendo todos os Deputados
	"""
	def __init__(self):
		self.xml = None

	def request(self):
		request  = urllib2.Request(WEBSERVICES['WSDeputados'])
		response = urllib2.urlopen(request)  
		self.xml = ET.fromstring(response.read())

		print 'WSDeputados request'

	def read(self):
		result    = {}
		deputados = []

		for deputado in self.xml:
			deputados.append({
				'idCadastro'   : deputado.find('ideCadastro')    .text,
				'nomeDeputado' : deputado.find('nomeParlamentar').text,
				'uf' 		   : deputado.find('uf')			 .text,
				'partido' 	   : deputado.find('partido')		 .text,
				'foto' 		   : deputado.find('urlFoto')		 .text,
				'matricula'    : deputado.find('matricula')      .text,
			})

		# ordena os dados pelo nome
		deputados.sort(key=operator.itemgetter('nomeDeputado'))

		result['deputados'] =  deputados

		return result

class WSDeputado(object):
	""" 
		Esta classe retorna um dicionario contendo os dados de um deputado pelo seu ideCadastro
	"""
	def __init__(self, deputado=''):
		self.deputado  = deputado
		self.xml       = None
	
	def request(self):
		params 	 = urllib.urlencode({ 'ideCadastro' : self.deputado, 'numLegislatura' : '' })
		request  = urllib2.Request(WEBSERVICES['WSDeputado'], params)
		response = urllib2.urlopen(request)
		self.xml = ET.fromstring(response.read())

		print 'WSDeputado request'

	def read(self):
		result   = {}
		
		tree = ET.tostring( self.xml[ len(self.xml) - 1 ] )

		result['deputado']  = xmldict.xml_to_dict(tree)	

		return result

class WSPresencasDeputado(object):
	"""
		Esta classe retorna um objeto contendo uma lista de presenca em um determinado periodo
	"""
	def __init__(self, matricula, dataIni, dataFim):
		self.matricula = matricula
		self.dataIni   = dataIni
		self.dataFim   = dataFim
		self.xml       = None

	def request(self):
		params   = urllib.urlencode({ 'dataIni' : self.dataIni, 'dataFim' : self.dataFim, 'numMatriculaParlamentar' : self.matricula })
		request  = urllib2.Request(WEBSERVICES['WSPresencasDeputado'], params)
		response = urllib2.urlopen(request)
		self.xml = ET.fromstring(response.read())

		print 'WSPresencasDeputado request!'

	def read(self):
		presencas  = []
		result     = {}
		
		for diasDeSessoes  in self.xml.iter('diasDeSessoes2'):
			for dias  in diasDeSessoes.findall('dia'):
				ano_sessao = datetime.datetime.strptime(dias.find('data').text, '%d/%m/%Y').year

				ausencia = 0 
				presenca = 0 
				qtdsessoes  = 0

			 	for sessoes in dias.findall('sessoes'):
			 	 	for sessao in sessoes.findall('sessao'):
			 	
			 	 		frequencia = sessao.find('frequencia').text

			 	 		qtdsessoes = qtdsessoes + 1

			 	 		if 'Ausência'.decode('utf-8') in frequencia:
			 	 			ausencia = ausencia + 1
			 	 		else:
			 	 			presenca = presenca + 1
			 	
				presencas.append({ 'anoSessao' : ano_sessao, 'sessoes'   : qtdsessoes, 'ausencia'  : ausencia, 'presenca'  : presenca, })

		for k, v in itertools.groupby(sorted(presencas), key=operator.itemgetter('anoSessao')):
			
			ausencias = 0 
			presencas = 0 
			total = 0
			
			for sessao in list(v):
				 ausencias += sessao['ausencia']
				 presencas += sessao['presenca']
				 total     += sessao['sessoes']
			
			result[k] = {
				'sessoes'   : total,
				'presencas' : presencas,
				'ausencias' : ausencias
			}

		return result

