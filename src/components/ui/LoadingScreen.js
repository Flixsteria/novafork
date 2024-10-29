class LoadingScreen {
  constructor() {
    this.messages = [
      {
        message: 'Contacting server...', icon: 'fas fa-satellite', minProgress: 0, maxProgress: 20,
      },
      {
        message: 'Fetching data...', icon: 'fas fa-download', minProgress: 20, maxProgress: 40,
      },
      {
        message: 'URL received...', icon: 'fas fa-link', minProgress: 40, maxProgress: 60,
      },
      {
        message: 'Parsing data...', icon: 'fas fa-search', minProgress: 60, maxProgress: 75,
      },
      {
        message: 'Streaming in 4K HDR...', icon: 'fas fa-tv', minProgress: 75, maxProgress: 90,
      },
      {
        message: 'Almost ready...', icon: 'fas fa-hourglass-half', minProgress: 90, maxProgress: 100,
      },
    ];
    this.createLoadingScreen();
    this.isLoading = false;
    this.currentMessageIndex = -1;
  }

  createLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 hidden';

    loadingScreen.innerHTML = `
            <div class="text-center loading-screen-content">
                <div class="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                    <div id="progressBar" class="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"></div>
                </div>
                <div id="loadingMessageContainer" class="h-8">
                    <p id="loadingMessage" class="text-white text-lg font-semibold opacity-0 transform translate-y-2 transition-all duration-300">Initializing...</p>
                </div>
            </div>
        `;

    document.body.appendChild(loadingScreen);
  }

  delay(ms) {
    let timeoutId;
    const promise = new Promise(resolve => {
      timeoutId = setTimeout(resolve, ms);
    });
    promise.cancel = () => clearTimeout(timeoutId);
    return promise;
  }

  async updateMessage(index, loadingMessage) {
    if (index === this.currentMessageIndex) return;

    const { message, icon } = this.messages[index];

    loadingMessage.classList.add('opacity-0', 'translate-y-2');
    await this.delay(100);
    loadingMessage.innerHTML = `<i class="${icon}"></i> ${message}`;
    loadingMessage.classList.remove('opacity-0', 'translate-y-2');
    this.currentMessageIndex = index;
  }

  async show(duration = 2000) {
    if (this.isLoading) return;
    this.isLoading = true;

    const loadingScreen = document.getElementById('loadingScreen');
    const progressBar = document.getElementById('progressBar');
    const loadingMessage = document.getElementById('loadingMessage');

    if (!loadingScreen || !progressBar || !loadingMessage) {
      this.isLoading = false;
      return;
    }

    loadingScreen.classList.remove('hidden');
    loadingMessage.classList.remove('opacity-0', 'translate-y-2');
    this.currentMessageIndex = -1;

    const startTime = Date.now();
    let currentProgress = 0;

    const animate = async () => {
      while (this.isLoading && currentProgress < 100) {
        const elapsedTime = Date.now() - startTime;
        currentProgress = Math.min((elapsedTime / duration) * 100, 100);
        progressBar.style.width = `${currentProgress}%`;

        for (let i = this.messages.length - 1; i >= 0; i--) {
          if (currentProgress >= this.messages[i].minProgress) {
            await this.updateMessage(i, loadingMessage);
            break;
          }
        }

        if (currentProgress >= 100) {
          await this.delay(200);
          this.hide();
          break;
        }

        await this.delay(16);
      }
    };

    animate();
  }

  hide() {
    this.isLoading = false;
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingMessage = document.getElementById('loadingMessage');

    if (loadingMessage) {
      loadingMessage.classList.add('opacity-0', 'translate-y-2');
    }

    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }, 200);
  }
}

export default new LoadingScreen();
