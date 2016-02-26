/**
 * Created by antoine on 9/02/16.
 */
import MainCtrl from './controllers/Main';
import TodoCtrl from './controllers/Todo';
import ErrorCtrl from './controllers/Error';

//import {InjectServer} from '../angular/server';

export default function($routeProvider, $locationProvider, $sceProvider) {


    $sceProvider.enabled(false);

    $routeProvider.when('/Main', {
        templateUrl: './views/products.html',
        controller: MainCtrl,
        controllerAs: 'vm'
    });

    $routeProvider.when('/Todo', {
        templateUrl: './views/todos.html',
        controller: TodoCtrl,
        controllerAs: 'vm'
    });

    $routeProvider.when('/Error', {
        templateUrl: './views/error.html',
        controller: ErrorCtrl,
        controllerAs: 'vm'
    });

    $routeProvider.otherwise('/Main');


    $locationProvider.html5Mode(true);

};