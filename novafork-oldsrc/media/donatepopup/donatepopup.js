function showDonationPopup() {
    // Check if the popup has been shown before
    if (!localStorage.getItem('donationPopupShown')) {
        $('#donationPopup').removeClass('hidden');
        localStorage.setItem('donationPopupShown', 'true');
    }
}

$(document).ready(function() {
    setTimeout(showDonationPopup, 3000); // Show popup after 3 seconds on page load

    $('#closeDonationPopup').on('click', function() {
        $('#donationPopup').addClass('hidden');
    });
});
