function donate(){
    const token = localStorage.getItem('authToken');
    var lastDonationTime = localStorage.getItem('donateLangmentor');
    
    const currentTime = new Date().getTime();
    if (!lastDonationTime){
        Swal.fire({
            title: '🌍 Welcome to Langmentor',
            html: `
                🎮 Complete sentences in a fun minigame<br>
                📖 Read to practice your reading skills<br>
                🗣️ Improve your English speaking!<br><br>
            `,
            icon: 'success',
            confirmButtonText: 'Let\'s Start!',
            confirmButtonColor: '#0F8AFD',
        });
        localStorage.setItem('donateLangmentor', currentTime);
        lastDonationTime = currentTime
        localStorage.setItem('firstVisitLangmentor', new Date().toISOString());
    }

    // Se não existe tempo de doação ou se passaram mais de 5 minutos (300000 ms)
    if (token){
        if (!lastDonationTime || currentTime - lastDonationTime > 300000) {
            Swal.fire({
                title: 'Unlock Langmentor PRO 🌟',
                html: '🚫 Ad-free experience <br> ♾️ Unlimited learning time<br>Keep this project alive.<br>Thank you 🙏',
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
            localStorage.setItem('donateLangmentor', currentTime);
        }
    }
}