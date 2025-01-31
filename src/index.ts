enum EventEnum {
  'CLICK' = 'click'
}
const defaultColor = '#666'

class CanvasAnnotate {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D | null
  img: HTMLImageElement
  shapes: BaseShape[] = []
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
    const rect0 = new Rectangle(0, this.ctx!, defaultColor, 0, 0, 100, 100)
    const rect1 = new Rectangle(1, this.ctx!, defaultColor, 300, 0, 100, 100)
    this.shapes.push(rect0, rect1)
    this.draw()
    rect0.on(EventEnum.CLICK, (e) => {
      const x = e.offsetX
      const y = e.offsetY
      const isInRegion = rect0.isPointInRegion(x, y)
      if (isInRegion) {
        console.log(rect0.id)
      }
    })
    rect1.on(EventEnum.CLICK, (e) => {
      const x = e.offsetX
      const y = e.offsetY
      const isInRegion = rect1.isPointInRegion(x, y)
      if (isInRegion) {
        console.log(rect1.id)
      }
    })
    this.handleListeners()
  }

  draw() {
    this.shapes.forEach(shape => {
      this.ctx!.fillStyle = shape.color
      this.ctx!.fill(shape.path)
    })

    requestAnimationFrame(this.draw.bind(this))
  }

  handleListeners() {
    this.canvas.addEventListener(EventEnum.CLICK, (e) => {
      this.shapes.forEach(shape => {
        const listeners = shape.listeners[EventEnum.CLICK]
        if (listeners)
          listeners.forEach(listener => {
            listener(e)
          })
      })
    })
  }
}

/** 所有形状的抽象类 */
abstract class BaseShape {
  abstract id: number
  abstract color: string
  abstract listeners: { [key in EventEnum]?: ((e: any) => void)[] }
  // 获取路径
  abstract get path(): Path2D
  // 判断点是否在路径区域内
  abstract isPointInRegion(x: number, y: number): boolean
}

/** 矩形 */
class Rectangle extends BaseShape {
  listeners: { [key in EventEnum]?: ((e: any) => void)[] } = {
    [EventEnum.CLICK]: [
      (e) => {
        const x = e.offsetX
        const y = e.offsetY
        const isInRegion = this.isPointInRegion(x, y)
        this.color = isInRegion ? 'red' : defaultColor
      }
    ]
  }
  constructor(public id: number, public ctx: CanvasRenderingContext2D, public color: string, public x: number, public y: number, public width: number, public height: number) {
    super()
  }

  get path(): Path2D {
    const rectPath = new Path2D()
    rectPath.rect(this.x, this.y, this.width, this.height)
    return rectPath
  }

  isPointInRegion(x: number, y: number): boolean {
    return this.ctx.isPointInPath(this.path, x, y)
  }

  on(eventName: EventEnum, callback: (e: any) => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }
    this.listeners[eventName]?.push(callback)
  }
}
