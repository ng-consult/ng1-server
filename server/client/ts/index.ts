/**
 * Created by antoine on 11/09/16.
 */

import $EngineQueueProvider from './provider/engineQueue';
import $QProvider from './provider/q';

angular.module('server', [])
    .provider('$engineQueue', $EngineQueueProvider)
    .provider('$q', $QProvider);