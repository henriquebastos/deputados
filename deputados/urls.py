from django.conf.urls import patterns, include, url
from django.conf import settings


urlpatterns = patterns('',

   url(r'^$', 'deputados.core.views.index'),
   url(r'^parlamentar/detalhes/$', 'deputados.core.views.detalhes'),
   url(r'^parlamentar/pesquisa/$', 'deputados.core.views.pesquisa'),
   url(r'^parlamentar/autocomplete/$', 'deputados.core.views.autocomplete'),
   url(r'^parlamentar/grafico/$', 'deputados.core.views.grafico'),
)

if settings.DEBUG:
	urlpatterns += patterns('django.views.static',
		url(r'^static/(?P<path>.*)$', 'serve', { 'document_root' : settings.STATIC_ROOT }),
	)