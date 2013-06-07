define([
  'test-helpers',
  'chai',
  'chai-jquery'
], function(helpers, chai, chaiJquery) {
  describe('Main site', function() {

    before(function(done) {
      helpers.setHtml('/index.html')
      $('#sut').load(function() {
        helpers.waitForAjax(done)
      })
    });


    describe('Search test', function() {

      var search_input
      var search_button

      before(function() {
        search_input = helpers.findFromSUT('#search-input')
        search_button = helpers.findFromSUT('#search')
      });

      describe('Search elements', function() {
        it('should exist', function() {
          expect(search_input.length).to.not.equal(0);
          expect(search_button.length).to.not.equal(0);
        });
      });

      describe('Input \"kauko\"', function() {
        it('should find at least one result', function(done) {
          search_input.val("kauko")
          search_button.click()
          helpers.waitForAjax(function() {
            var listing_header = helpers.findFromSUT('#listing-header')
            expect(listing_header.length).to.not.equal(0);
            expect(listing_header.text()).to.match(/Haulla \'kauko\' löytyi [1-9][0-9]* tulosta:/);
            done();
          });
        });
      });

      describe('Input \"asdasdasd\"', function() {
        it('should find no results', function(done) {
          search_input.val("asdasdasd")
          search_button.click()
          helpers.waitForAjax(function() {
            var listing_header = helpers.findFromSUT('#listing-header')
            expect(listing_header.length).to.not.equal(0);
            expect(listing_header.text()).to.equal("Haulla \'asdasdasd\' löytyi 0 tulosta:");
            done();
          });
        });
      });
    });

    describe('Newest items test', function() {

      var rows

      before(function() {
        rows = helpers.findFromSUT('#listing .row')
      });

      describe('Two rows', function() {
        it('should exist', function() {
          expect(rows.length).to.equal(2);
        });
      });

      describe('Listing items', function() {

        var links

        before(function() {
          links = rows.find('.span6').find('a')
        });

        describe('Four links', function() {
          it('should exist', function() {
            expect(links.length).to.equal(4);
          });
        });

        it('should link to case.html', function() {
          links.each(function() {
            expect($(this).attr('href')).to.match(/case\.html\?id=hel/);
          });
        });
      });
    });
  });
});