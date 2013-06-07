require.config({
    baseUrl: '../',
    paths: {
        'test-helpers': 'test/test-helpers',
        'mocha': 'test/vendor/mocha',
        'chai': 'test/vendor/chai',
        'chai-jquery': 'test/vendor/chai-jquery',
        'jquery': "js/vendor/jquery",
        'bootstrap': "js/vendor/bootstrap.min",
        'underscore': "js/vendor/underscore-min"
    },
    shim: {
        'bootstrap': ['jquery'],
        'chai-jquery': ['jquery', 'chai']
    }
});

require(['require', 'chai', 'chai-jquery', 'test-helpers', 'mocha'],
    function(require, chai, chaiJquery, helpers) {

        chai.use(chaiJquery);

        assert = chai.assert;
        should = chai.should();
        expect = chai.expect;

        mocha.setup({ ui: 'bdd', timeout: 10000 });

        require(['test/test_main'], function(){
            $('#test-controls .toggle-view').click(function() { $('#sut, #mocha').toggle() });
            helpers.showSut();

            if (window.mochaPanthomJS) {
                mochaPanthomJS.run();
            } else {
                mocha.run(helpers.showResults);
            }
        });
    });