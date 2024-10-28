function donate(){
    const token = localStorage.getItem('authToken');
    if (token) {
        Swal.fire({
            title: 'Unlock Langmentor PRO 🌟',
            html: 'Just $2 <br>🚫 Ad-free experience <br> ♾️ Unlimited learning time<br>Keep this project alive.<br>Thank you 🙏',
            icon: 'info',
            showCancelButton: true,
            cancelButtonText: 'Maybe Later 😞',
            confirmButtonText: ' Donate Now 💖',
            confirmButtonColor: '#0F8AFD',
            cancelButtonColor: "#b9babd",
            customClass: {
                title: 'swal2-title',
                htmlContainer: 'swal2-text'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Abre a página de doação em uma nova aba
                window.open('https://buy.stripe.com/6oE5oa8H21m93i86oq', '_blank');
            }
        });
    }   
}
