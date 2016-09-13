/**
 * Created by antoine on 12/09/16.
 */
jQuery(document).ready(function() {
    jQuery('.ui.sticky').sticky({
        context: '#mainContainer',
        offset: 50,
        bottomOffset: 50,
        pushing: false
    });
})