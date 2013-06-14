define(['jquery', 'underscore'], function() {
    return function(pageSwitchElement) {
        var that = this;
        var itemFetcher;
        var currentPage = 1;

        $(pageSwitchElement).on('click', '.page-link', function(event) {
            event.preventDefault();
            that.switchPage($(event.target).text());
        });

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
                    var li = $('<li></li>');
                    if(i == 0) {
                        li.attr('class', 'disabled');
                    }
                    li.append(link);
                    pages.append(li);
                });
                pages.append('<li class="disabled"><a href="#">&raquo;</a></li>');
            });
        }

        this.getPage = function() {
            return currentPage;
        }

        this.getItemsPerPage = function() {
            return 2;
        }

        this.switchPage = function(page) {
            currentPage = page;
            $(pageSwitchElement).find(".disabled").attr('class', '');
            var elementNum = parseInt(page) + 1;
            var li = $(pageSwitchElement).find("li:nth-child(" + elementNum + ")");
            console.log(li);
            $(li).attr('class', 'disabled');
            itemFetcher();
        }

        this.setItemFetcher = function(iFetcher) {
            itemFetcher = iFetcher;
            return that;
        }
    }
});
