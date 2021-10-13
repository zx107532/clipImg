import Mouse from "./mouse";
interface ClipData {
    url: string;
    blob: Blob;
}
interface Config {
    el: HTMLDivElement;
    reviewCall?: (url: string) => void;
}

interface ImageCtx {
    x: number;
    y: number;
    width: number;
    height: number;
    n: number;
    img: HTMLImageElement;
    draw: () => void;
}

let mouse: Mouse;
export default class ClipImg {
    private readonly el: HTMLDivElement;
    private readonly canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private imgCtx: ImageCtx;
    private readonly controllerBox: HTMLDivElement;
    private controllerIsDown: boolean;
    private readonly reviewCall;
    private reviewSrc: string;
    constructor(config: Config) {
        this.reviewSrc = ''
        this.controllerIsDown = false;
        this.el = config.el;
        this.reviewCall = config.reviewCall;
        this.canvas = document.createElement("canvas");
        this.controllerBox = document.createElement("div");
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.imgCtx = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            n: 0,
            img: document.createElement("img"),
            draw: () => {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.context.drawImage(
                    this.imgCtx.img,
                    this.imgCtx.x,
                    this.imgCtx.y,
                    this.imgCtx.width,
                    this.imgCtx.height
                );
                this.getClipView();
            },
        };
        mouse = new Mouse();
        this.init();
    }

    private init(): void {
        console.log(2222)
        this.el.style.position = "relative";
        this.el.appendChild(this.canvas);
        this.canvas.width = this.el.clientWidth;
        this.canvas.height = this.el.clientHeight;
        this.getEvent();
        this.createControlBox();
        this.createControlBoxImg()
    }

    private createControlBoxImg(): void {
        if (this.reviewSrc) {
            this.controllerBox.style.backgroundImage = `url('${this.reviewSrc}')`;
            this.controllerBox.style.backgroundSize = '100% 100%';
            this.controllerBox.style.backgroundPosition = '0 0';
        }
    }

    private getEvent(): void {
        let isDown = false;
        let lx: number;
        let ly: number;
        this.el.addEventListener("mousedown", (e: MouseEvent) => {
            if (this.controllerIsDown) {
                return;
            }
            const offsetX = e.pageX-this.el.getBoundingClientRect().x;
            const offsetY = e.pageY - this.el.getBoundingClientRect().y;
            lx = this.imgCtx.x - offsetX;
            ly = this.imgCtx.y - offsetY;
            isDown = true;
        });
        this.el.addEventListener("mousemove", (e: MouseEvent) => {
            if (this.controllerIsDown) {
                return;
            }
            const offsetX = e.pageX-this.el.getBoundingClientRect().x;
            const offsetY = e.pageY - this.el.getBoundingClientRect().y;
            // 判断鼠标是否指向图片
            if (
                offsetX > this.imgCtx.x &&
                offsetX < this.imgCtx.x + this.imgCtx.width &&
                offsetY > this.imgCtx.y &&
                offsetY < this.imgCtx.y + this.imgCtx.height
            ) {
                // 判断鼠标是否按下
                if (isDown) {
                    this.imgCtx.x = offsetX + lx;
                    this.imgCtx.y = offsetY + ly;
                    this.imgCtx.draw();
                }
            }
        });
        this.el.addEventListener("mouseleave", () => {
            isDown = false;
        });
        this.el.addEventListener("mouseup", () => {
            isDown = false;
        });
        const n = 8;
        mouse.scrollDown = () => {
            this.imgCtx.width += n;
            if (this.imgCtx.width <= this.canvas.width * 3) {
                this.imgCtx.height = this.imgCtx.width / this.imgCtx.n;
                this.imgCtx.x -= n / 2;
                this.imgCtx.y -= n / 2;
            } else {
                this.imgCtx.width = this.canvas.width * 3;
                this.imgCtx.height = this.imgCtx.width / this.imgCtx.n;
            }
            this.imgCtx.draw();
        };
        mouse.scrollUp = () => {
            this.imgCtx.width -= n;
            if (this.imgCtx.width >= 50) {
                this.imgCtx.height = this.imgCtx.width / this.imgCtx.n;
                this.imgCtx.x += n / 2;
                this.imgCtx.y += n / 2;
            } else {
                this.imgCtx.width = 50;
                this.imgCtx.height = this.imgCtx.width / this.imgCtx.n;
            }
            this.imgCtx.draw();
        };
    }

    /**
     * 写入图片
     * @param file<File> 图片文件
     */
    public setImg(file: File): void {
        const img: HTMLImageElement = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            const n = imgWidth / imgHeight;
            let width = this.canvas.width;
            let height = this.canvas.height;
            if (n > 1.7777777) {
                width = this.canvas.width;
                height = width / n;
            } else if (n < 1.7777777) {
                height = this.canvas.height;
                width = height * n;
            }
            const x = (this.canvas.width - width) / 2;
            const y = (this.canvas.height - height) / 2;
            this.imgCtx.x = x;
            this.imgCtx.y = y;
            this.imgCtx.width = width;
            this.imgCtx.height = height;
            this.imgCtx.n = n;
            this.imgCtx.img = img;
            this.imgCtx.draw();
        };
    }

    /**
     * 设置图片裁剪范围比例
     * @param width
     * @param height
     */
    public setSize(width = 160, height = 90): void {
        this.controllerBox.style.width = width + "px";
        this.controllerBox.style.height = height + "px";
    }

    private createControlBox() {
        this.controllerBox.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        border: 1px solid #5c5c5c;
    `;
        this.setSize(160, 90);
        const pointBtn = [
            this.createControlBtn(8, 8, "lt"),
            this.createControlBtn(8, 8, "rt"),
            this.createControlBtn(8, 8, "lb"),
            this.createControlBtn(8, 8, "rb"),
        ];

        pointBtn.forEach((btn: HTMLDivElement) => {
            this.controllerBox.appendChild(btn);
        });

        this.el.appendChild(this.controllerBox);
    }

    private createControlBtn(
        width: number,
        height: number,
        type: string
    ): HTMLDivElement {
        const div = document.createElement("div");
        div.style.cssText = `
        width: ${width}px;
        height: ${height}px;
        position: absolute;
        cursor: pointer;
        background: #cccccc;
    `;
        div.setAttribute("type", type);
        if (type === "lt" || type === "rt") {
            div.style.top = -height / 2 + "px";
        }
        if (type === "lt" || type === "lb") {
            div.style.left = -width / 2 + "px";
        }
        if (type === "lb" || type === "rb") {
            div.style.bottom = -height / 2 + "px";
        }
        if (type === "rt" || type === "rb") {
            div.style.right = -width / 2 + "px";
        }
        let divType = "";
        let n = 0;
        div.addEventListener("mousedown", () => {
            n = this.controllerBox.offsetWidth / this.controllerBox.offsetHeight;
            divType = div.getAttribute("type") as string;
            this.controllerIsDown = true;
        });
        this.el.addEventListener("mouseup", () => {
            divType = "";
            this.controllerIsDown = false;
        });
        this.el.addEventListener("mouseleave", () => {
            divType = "";
            this.controllerIsDown = false;
        });

        this.el.addEventListener(
            "mousemove",
            (e: MouseEvent) => {
                if (this.controllerIsDown) {
                    const parent: HTMLDivElement = div.parentNode as HTMLDivElement;
                    // const x = e.pageX - this.clientX(this.el);
                    const x = e.pageX-this.el.getBoundingClientRect().x;
                    // console.log(x, e.pageX-this.el.getBoundingClientRect().x)
                    if (divType === "lt" || divType === "lb") {
                        let width = this.canvas.width - x * 2;
                        width = width>this.canvas.width?this.canvas.width:width
                        parent.style.width = width + "px";
                        parent.style.height = width / n + "px";
                        this.getClipView();
                    }
                    if (divType === "rt" || divType === "rb") {
                        let width = this.canvas.width - (this.canvas.width - x) * 2;
                        width = width>this.canvas.width?this.canvas.width:width
                        parent.style.width = width + "px";
                        parent.style.height = width / n + "px";
                        this.getClipView();
                    }
                }
            },
            true
        );
        return div;
    }

    private getClipView() {
        const opt = this.controllerBox.getBoundingClientRect();
        const x = this.controllerBox.offsetLeft - opt.width / 2;
        const y = this.controllerBox.offsetTop - opt.height / 2;
        const width = opt.width;
        const height = opt.height;
        const data = this.context.getImageData(x, y, width, height);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.putImageData(data, 0, 0);
        this.reviewSrc = canvas.toDataURL('image/jpeg')
        this.createControlBoxImg()
        if (this.reviewCall) {
            this.reviewCall(this.reviewSrc);
        }
        // canvas.toBlob((blob) => {
        //     const url = URL.createObjectURL(blob);
        //     this.reviewSrc = url
        //     this.createControlBoxImg()
        //     if (this.reviewCall) {
        //         this.reviewCall(url);
        //     }
        // });
    }

    /**
     * 获取裁剪图片
     * @param size<Number>
     */
    public getClipData(size = 4096): Promise<ClipData> {
        return new Promise((resolve) => {
            document.body.appendChild(this.imgCtx.img);
            const opt = this.controllerBox.getBoundingClientRect();
            const x = this.controllerBox.offsetLeft - opt.width / 2;
            const y = this.controllerBox.offsetTop - opt.height / 2;
            const width = opt.width;
            const height = opt.height;
            const n = this.imgCtx.img.offsetWidth / this.imgCtx.width;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            canvas.width = this.imgCtx.img.offsetWidth;
            canvas.height = this.imgCtx.img.offsetHeight;
            document.body.removeChild(this.imgCtx.img);
            ctx.drawImage(this.imgCtx.img, 0, 0, canvas.width, canvas.height);

            const data = ctx.getImageData(
                (x - this.imgCtx.x) * n,
                (y - this.imgCtx.y) * n,
                width * n,
                height * n
            );

            const canvas2 = document.createElement("canvas");
            const ctx2 = canvas2.getContext("2d") as CanvasRenderingContext2D;
            canvas2.width = width * n;
            canvas2.height = height * n;
            ctx2.putImageData(data, 0, 0);
            canvas2.toBlob(async (blob) => {
                let blobs = await this.compress(blob as Blob);
                //判断图片是否小于规定大小,没有继续压缩
                while (blobs.size / 1024 > size) {
                    blobs = await this.compress(blobs);
                }
                const url = URL.createObjectURL(blobs);
                resolve({
                    url: url,
                    blob: blobs,
                });
            });
        });
    }

    /**
     * 压缩图片
     * @param blob<Blob>
     * @private
     */
    private compress(blob: Blob): Promise<Blob> {
        return new Promise<Blob>((resolve) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            const img = new Image();
            img.style.cssText = `
      position:absolute;
      top:-9999999px;
      left:-99999999;
      `;
            document.body.appendChild(img);
            img.onload = () => {
                canvas.width = img.width * 0.9;
                canvas.height = img.height * 0.9;
                document.body.removeChild(img);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blobs) => {
                    resolve(blobs as Blob);
                }, "image/jpeg");
            };
            img.src = URL.createObjectURL(blob);
        });
    }

    clientX(el: HTMLElement): number {
        return this.pageX(el) - this.scrollX();
    }

    clientY(el: HTMLElement): number {
        return this.pageY(el) - this.scrollY();
    }

    pageX(el: HTMLElement): number {
        let parent = el;
        let x = 0;

        while (parent) {
            x += parent.offsetLeft;
            parent = parent.offsetParent as HTMLElement;
        }

        return x;
    }

    pageY(el: HTMLElement): number {
        let parent = el;
        let y = 0;

        while (parent) {
            y += parent.offsetTop;
            parent = parent.offsetParent as HTMLElement;
        }

        return y;
    }

    scrollX(elOrWindow?: Element): number {
        let x = 0;
        // if (this.isWindow(elOrWindow)) {
        //   const win = elOrWindow as Window;
        //   x =
        //     win.scrollX ||
        //     win.pageXOffset ||
        //     win.document.documentElement.scrollLeft;
        // } else if (this.isElement(elOrWindow)) {
        //   x = (elOrWindow as Element).scrollLeft;
        // }
        if (elOrWindow) {
            x = (elOrWindow as Element).scrollLeft;
        }
        return x;
    }

    scrollY(elOrWindow?: Element): number {
        let y = 0;
        if (elOrWindow) {
            y = (elOrWindow as Element).scrollTop;
        }
        return y;
    }
}
