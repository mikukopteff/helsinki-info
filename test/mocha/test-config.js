require.config({
    baseUrl: '../../',
    paths: {
        'test-helpers': 'test/mocha/test-helpers',
        'mocha': 'test/mocha/vendor/mocha',
        'chai': 'test/mocha/vendor/chai',
        'chai-jquery': 'test/mocha/vendor/chai-jquery',
        'jquery': "resources/public/js/vendor/jquery",
        'bootstrap': "resources/public/js/vendor/bootstrap.min",
        'underscore': "resources/public/js/vendor/underscore-min"
    },
    shim: {
        'bootstrap': ['jquery'],
        'chai-jquery': ['jquery', 'chai']
    }
});

require(['require', 'chai', 'chai-jquery', 'mocha', 'test-helpers', 'bootstrap'],
    function(require, chai, chaiJquery, helpers) {

        chai.use(chaiJquery);

        assert = chai.assert;
        should = chai.should();
        expect = chai.expect;

        mocha.setup('bdd');

        require(['test/mocha/test_main', 'test/mocha/test_case', 'test/mocha/test_utils'], function(){
            mocha.run();
        });

    });