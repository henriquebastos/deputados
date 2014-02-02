from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger



def paginate(request,
             object_list,
             per_page,
             orphans=0,
             allow_empty_first_page=True,
             query_string_name="page"):
    """
    Returns a Page object using the page number from the URL query string.
    """
    paginator = Paginator(object_list,
                          per_page,
                          orphans=orphans,
                          allow_empty_first_page=allow_empty_first_page)

    page_number = request.GET.get(query_string_name, "1")
    try:
        page = paginator.page(page_number)
    except PageNotAnInteger:
        # Page number is not an integer: deliver the first page.
        page = paginator.page(1)
    except EmptyPage:
        # Page number is out of range: deliver the last page.
        page = paginator.page(paginator.num_pages)
    return page