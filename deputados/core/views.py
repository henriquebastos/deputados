from django.shortcuts  import render_to_response
from django.http       import HttpResponse, HttpResponseRedirect
from django.core.cache import cache
from django.utils      import simplejson

import datetime

# log - debug toolbar
import logging

# # web services - parlamento
from webservices import WSDeputados, WSDeputado, WSPresencasDeputado

# utils - paginator
from utils import paginate

# xml to dictionary
import xmldict


def index(request):

    deputados = cache.get('deputados')

    if not deputados:

        ws        = WSDeputados()
        wsrequest = ws.request()
        deputados = ws.read()

        if 'error' in deputados:
           return render_to_response('errors.html', deputados)

        cache.set('deputados', deputados['deputados'], timeout=2592000)

    result = deputados['deputados'] if 'deputados' in deputados else deputados

    context = {
        'deputados': result[:16],
        'total' : len(result)
    }

    return render_to_response('app/deputados.html', context)


def detalhes(request):

    if request.is_ajax():
        
        ide      = request.GET['ide']

        deputado = cache.get('deputado_%s' % ide)
        
        if not deputado:

            ws        = WSDeputado(deputado=ide)
            wsrequest = ws.request() 
            deputado  = ws.read()

            if 'error' in deputado:
                return render_to_response('errors.html', deputado)

            cache.set('deputado_%s' % ide, deputado['deputado'], timeout=1296000)

        result = deputado if 'deputado' not in deputado else deputado['deputado']

        json = simplejson.dumps(result)

        return HttpResponse(json)
        
    return HttpResponse(500)


def pesquisa(request):

    tipo  = request.GET.get('tipo' , None)
    chave = request.GET.get('chave', None)
    page  = request.GET.get('page', None)
    
    resultados = []

    if tipo and chave:
        resultados = buscar_deputados_cache(tipo, chave)
    else:
        resultados = cache.get('deputados')

    deputados = paginate(request, resultados, 16)

    context = { 
        'deputados': deputados, 
    }

    print deputados.number

    if request.is_ajax():
        if int(page) <= deputados.number:
            return HttpResponse(simplejson.dumps({ 'deputados' : deputados.object_list }))
        else:
            return HttpResponse(None)

    return render_to_response('app/deputados.html', context)


def autocomplete(request):

    if request.is_ajax():
    
        tipo  = request.GET['tipo']
        chave = request.GET['chave']

        resultados = buscar_deputados_cache(tipo, chave)

        json = simplejson.dumps(resultados)

        return HttpResponse(json)


def grafico(request):
    
    if request.is_ajax():

        matricula   = request.GET['matricula']
        data_inicio = request.GET['dataIni']
        data_fim    = request.GET['dataFim']

        if not data_fim:
            data_fim = datetime.date.today().strftime('%d/%m/%Y')

        periodo_exec = cache.get('%s-%s-%s' % (matricula, data_inicio, data_fim))
        
        if not periodo_exec:
            ws           = WSPresencasDeputado(matricula=matricula, dataIni=data_inicio, dataFim=data_fim)
            wsrequest    = ws.request()
            periodo_exec = ws.read()

            cache.set('%s-%s-%s' % (matricula, data_inicio, data_fim), periodo_exec, timeout=1296000)
        
        json = simplejson.dumps(periodo_exec)

        return HttpResponse(json)


def buscar_deputados_cache(tipo, chave):
    
    deputados  = cache.get('deputados')

    resultados = []

    chave_lower = chave.lower()

    if 'pessoas' in tipo:
        resultados = [deputado for deputado in deputados if  chave_lower in deputado['nomeDeputado'].lower()]

    elif 'partidos' in tipo:
        resultados = [deputado for deputado in deputados if  chave_lower in deputado['partido'].lower()]

    elif 'estados' in tipo:
        resultados = [deputado for deputado in deputados if  chave_lower in deputado['uf'].lower()]

    return resultados

    