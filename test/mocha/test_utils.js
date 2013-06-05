define([
  'test-helpers',
  'chai',
  'chai-jquery',
  'resources/public/js/utils'
], function(helpers, chai, chaiJquery, Utils) {
  describe('Utils', function() {

    beforeEach(function(done) {
      helpers.clearTestArea();
      done();
    });

    it('should be available', function() {
      expect(Utils).to.not.equal(null);
    });

    describe('getParameterByName', function() {
      it('should be available', function() {
        expect(Utils.getParameterByName).to.not.equal(null);
      });

      it('non-existing parameter should return empty string', function() {
        expect(Utils.getParameterByName('does_not_exist')).to.equal('');
      });
    });

    describe('ajaxLoader', function() {
      it('should be available', function() {
        expect(Utils.ajaxLoader).to.not.equal(null);
      });
    });
  });
});