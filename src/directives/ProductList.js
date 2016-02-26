export default function($http) {
    return {
        restrict: 'E',
        replace: true,
        transclude: false,
        //scope: { products: { data: [ { name: 'test', price: 1 }] } },
        template: '<li ng-repeat="product in products">{{product.name}} {{product.price}}</li>',
        link: function (scope, element, attrs) {

            $http.get('/products').success(function (data) {
                //console.log(data);
                scope.products = data;
            });
        }
    };
};
