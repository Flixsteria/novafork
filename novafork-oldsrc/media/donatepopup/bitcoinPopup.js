
const openBitcoinPopup = document.getElementById('openBitcoinPopup');
const bitcoinPopup = document.getElementById('bitcoinPopup');
const closeBitcoinPopup = document.getElementById('closeBitcoinPopup');

openBitcoinPopup.addEventListener('click', () => {
    bitcoinPopup.classList.remove('hidden');
});

// Close popup on click
closeBitcoinPopup.addEventListener('click', () => {
    bitcoinPopup.classList.add('hidden');
});

// Close popup when clicking outside the popup
window.addEventListener('click', (event) => {
    if (event.target == bitcoinPopup) {
        bitcoinPopup.classList.add('hidden');
    }
});
