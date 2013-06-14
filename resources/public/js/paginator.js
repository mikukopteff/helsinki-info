function Paginator(pageSwitchElement) {;
    var that = this;

    function numberOfPages(amountOfItems) {
        var itemsPerPage = that.getItemsPerPage();
        var fullPages = Math.floor(amountOfItems / that.getItemsPerPage());
        return fullPages % itemsPerPage === 0 ? fullPages : fullPages+1;
    }

    this.updatePagination = function(countProvider) {
        countProvider(function(amount) {
            var pages = $(pageSwitchElement);
            pages.empty();
            pages.append('<li class="disabled"><a href="#">&laquo;</a></li>');
            _(numberOfPages(amount)).times(function(i) {
                var link = $('<a href="#"></a>').attr('class', 'page-link').text(i+1);
                pages.append($('<li></li>').append(link));
            });
            pages.append('<li class="disabled"><a href="#">&raquo;</a></li>');
        });
    }

    this.getPage = function() {
        if(!window.currentPage) window.currentPage = 1;
        return window.currentPage;
    }

    this.getItemsPerPage = function() {
        return 2;
    }

}
