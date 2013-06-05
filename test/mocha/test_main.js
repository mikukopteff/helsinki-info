define([
  'test-helpers',
  'chai',
  'chai-jquery',
  'resources/public/js/main'
], function(helpers, chai, chaiJquery, Main) {
  describe('Main', function() {

    beforeEach(function(done) {
      helpers.clearTestArea();
      done();
    });

    it('should be available', function() {
      expect(Main).to.not.equal(null);
    });

  });
});