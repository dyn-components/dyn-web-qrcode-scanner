import BaseComponent from "./BaseComponent";
import jsQR from "jsqr";
class WebComponent extends BaseComponent {
	private video: HTMLVideoElement;
	private scanning: boolean;
	constructor() {
		super();
		const container = document.createElement("video");
		container.classList.add("dyn-component--web-components", "dyn-qrcode-scanner");
		this.shadowRoot!.appendChild(container);
		this.video = container;
		this.scanning = false;
	}

	connectedCallback() {
		super.connectedCallback();
		this.startScanQRCode();
	}


	startScanQRCode() {
		if (!this.scanning) {
			const onAnimationFrame = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d', { willReadFrequently: true });
				if (this.video.readyState === this.video.HAVE_ENOUGH_DATA && ctx) {
					canvas.width = this.video.videoWidth;
					canvas.height = this.video.videoHeight;
					ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);

					const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
					const code = jsQR(imageData.data, imageData.width, imageData.height);

					if (code) {
						this.scanning = false;
						console.log(`Found QR code: ${code.data}`);
						this.dispatchEvent(new CustomEvent('scanned', { detail: code.data }));
					} else {
						console.log('No QR code found.');
						requestAnimationFrame(onAnimationFrame);
					}
				} else {
					console.log('Waiting for video data...');
					onAnimationFrame();
				}
			};
			this.scanning = true;
			// 请求摄像头权限并打开后置摄像头
			navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
				.then(stream => {
					this.video.srcObject = stream;
					this.video.play();
					this.video.addEventListener('canplay', onAnimationFrame);
				})
				.catch(err => {
					this.scanning = false;
					console.error("Error accessing camera: ", err);
					alert("无法访问摄像头: " + err.message);
				});
		}
	}
	stopCamera() {
		this.video.pause();
		this.scanning = false;
		this.video.srcObject = null;
	}
}

const define = (name: string, options?: ElementDefinitionOptions) => {
	if (!customElements.get(name)) {
		customElements.define(name, WebComponent, options);
	}
};

export { define };
export default WebComponent;
