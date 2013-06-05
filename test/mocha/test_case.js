define([
  'test-helpers',
  'chai',
  'chai-jquery',
  'resources/public/js/case'
], function(helpers, chai, chaiJquery, Case) {
  describe('Case', function() {

    beforeEach(function(done) {
      helpers.clearTestArea();
      done();
    });

    it('should be available', function() {
      expect(Case).to.not.equal(null);
    });

  });
});