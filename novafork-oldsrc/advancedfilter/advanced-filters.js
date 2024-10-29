$(document).ready(function() {
    // Toggle Advanced Filters
    $('#toggleFiltersButton').on('click', function() {
        $('#additionalFilters').slideToggle('fast');

        // Update the arrow icon
        var $toggleIcon = $('#toggleIcon');
        if ($toggleIcon.text() === '▼') {
            $toggleIcon.text('▲');
        } else {
            $toggleIcon.text('▼');
        }
    });
});
