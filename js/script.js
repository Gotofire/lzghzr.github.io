class PlayFire {
    constructor() {
        this.elmCanvas = document.querySelector('canvas');
        this.cavContext = this.elmCanvas.getContext('2d');
        this.elmImage = document.querySelector('img');
        this.IsFirefox();
    }
    LetsPlay() {
        if (!this.isFirefox)
            return;
        this.elmCanvas.style.cssText = 'cursor: none;';
        this.elmCanvas.width = window.innerWidth;
        this.elmCanvas.height = window.innerHeight;
        this.elmCanvas.addEventListener('mousemove', (ev) => {
            if (Math.random() > 0.9) {
                this.cavContext.clearRect(0, 0, this.elmCanvas.width, this.elmCanvas.height);
                this.cavContext.drawImage(this.elmImage, ev.clientX, ev.clientY, 19, 19);
            }
        });
        this.elmCanvas.addEventListener('mouseout', (ev) => {
            this.cavContext.clearRect(0, 0, this.elmCanvas.width, this.elmCanvas.height);
        });
        window.addEventListener('onresize', () => {
            this.elmCanvas.width = window.innerWidth;
            this.elmCanvas.height = window.innerHeight;
        });
    }
    IsFirefox() {
        let elmVideo = document.createElement('video');
        this.isFirefox = (elmVideo.mozHasAudio === false);
        elmVideo = null;
    }
}
const play = new PlayFire();
play.LetsPlay();
