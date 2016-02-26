/**
 * Created by antoine on 17/02/16.
 */
export default class ErrorCtrl {

    constructor($log) {

        const error1 = 'Catchable Error()';
        const error2 = 'Catchable Exception()';
        const error3 = 'Uncatchable Error() - should crash the app.';

        $log.log('Will....' + error1);

        try {
            this.throwError(error1)
        } catch (e1) {
            $log.log('I catched an Error/Exception: ' + e1 );
            try {
                $log.log('Will....' + error2);
                this.throwException(error2);
            } catch (e2) {
                $log.log('I catched an Error/Exception: ' + e2 );
                $log.log('Will....' + error3);
                this.throwException(error3);

            }
        }
    }

    throwError = (text) => {
        throw new Error(text);
    };

    throwException = (text) => {
        throw text;
    };

}