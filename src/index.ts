class CanvasAnnotate {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D | null
  img: HTMLImageElement
  constructor(canvasId: string, imgUrl: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')
    this.img = new Image()
    if (!this.canvas || !this.ctx || !this.img) {
      console.error('Canvas or ctx or img is null')
      return
    }
    this.img.onload = this.initStage.bind(this)
    this.img.src = imgUrl
  }
  /** 将传入的图片绘制到画布 */
  initStage() {
    // 计算图片的缩放比例
    const scale = Math.min(
      this.canvas.width / this.img!.width,
      this.canvas.height / this.img!.height
    )
    const width = this.img.width * scale
    const height = this.img.height * scale

    // 清除画布
    this.ctx!.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )

    // Draw the image from the top-left corner of the offscreen canvas
    this.ctx!.drawImage(this.img, 0, 0, width, height)

    // 后续绘制
  }
}

// Usage
const canvasAnnotate = new CanvasAnnotate('myCanvas', './dist/imgs/1.jpg')
