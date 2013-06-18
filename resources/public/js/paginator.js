define(['jquery', 'underscore'], function() {
    return function(pageSwitchElement) {
        var that = this;
        var itemFetcher = undefined;
        var currentPage = 1;
        var pageCount = undefined;

        $(pageSwitchElement).on('click', '.page-link', function(event) {
            event.preventDefault();
            that.switchPage($(event.target).text());
        });

        $(pageSwitchElement).on('click', '#first-page-link', function(event) {
            event.preventDefault();
            that.switchPage(1);
        })

        $(pageSwitchElement).on('click', '#last-page-link', function(event) {
            event.preventDefault();
            that.switchPage(pageCount);
        })

        function numberOfPages(amountOfItems) {
            var itemsPerPage = that.getItemsPerPage();
            var fullPages = Math.floor(amountOfItems / that.getItemsPerPage());
            return fullPages % itemsPerPage === 0 ? fullPages : fullPages+1;
        }

        this.updatePagination = function(countProvider) {
            countProvider(function(amount) {
                var pages = $(pageSwitchElement);
                pageCount = numberOfPages(amount);
                pages.empty();
                pages.append($('<li></li>').attr('id', 'first-page-link').attr('class', 'disabled').
                    append($('<a></a>').attr('href', '#').html('&laquo;')));

                _(pageCount).times(function(i) {
                    var link = $('<a href="#"></a>').attr('class', 'page-link').text(i+1);
                    var li = $('<li></li>');
                    if(i == 0) {
                        li.attr('class', 'disabled');
                    }
                    li.append(link);
                    pages.append(li);
                });

                pages.append($('<li></li>').append($('<a></a>').attr('href', '#').html('&raquo;')).attr('id', 'last-page-link'));
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
            var pageNum = parseInt(page);

            if(pageNum === 1) {
                $('#first-page-link').attr('class', 'disabled');
            } else if(pageNum === pageCount) {
                $('#last-page-link').attr('class', 'disabled');
            }

            var elementNum = pageNum + 1;
            var li = $(pageSwitchElement).find("li:nth-child(" + elementNum + ")");
            $(li).attr('class', 'disabled');
            itemFetcher();
        }

        this.setItemFetcher = function(iFetcher) {
            itemFetcher = iFetcher;
            return that;
        }
    }
});
