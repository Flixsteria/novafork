function showModal() {
    const lastShown = localStorage.getItem('popupLastShown');
    const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
    
    if (!lastShown || (Date.now() - new Date(lastShown).getTime()) > sevenDaysInMillis) {
        $('#shareModal').removeClass('hidden');
    }
}

$('#closeModal').on('click', function() {
    $('#shareModal').addClass('hidden');
    localStorage.setItem('popupLastShown', new Date().toISOString()); // Store the current date and time
});

// Show the modal on page load
$(window).on('load', showModal);
