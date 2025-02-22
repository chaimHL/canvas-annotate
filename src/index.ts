enum EventEnum {
  'CLICK' = 'click'
}
const defaultColor = '#666'

class CanvasAnnotate {
  canvas: HTMLCanvasElement | null = null
  ctx: CanvasRenderingContext2D | null = null
  img: HTMLImageElement
  shapes: BaseShape[] = []
  width = 0
  height = 0
  private isDrawing = false
  private handleClick: (e: MouseEvent) => void = () => { }
  constructor(canvasId: string, imgUrl: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement ?? null
    this.ctx = this.canvas.getContext('2d')
    this.img = new Image()
    if (!this.canvas || !this.ctx) {
      console.error('Canvas 或 Canvas context 为空')
      return
    }
    this.img.onload = this.initStage.bind(this)
    this.img.onerror = () => console.error('图片加载失败')
    this.img.src = imgUrl
  }

  /** 将传入的图片绘制到画布 */
  initStage() {
    if (!this.canvas || !this.ctx || !this.img.complete) {
      console.error('Canvas/ctx/img 没有准备完毕')
      return
    }
    // 计算图片的缩放比例
    const scale = Math.min(
      // 如果图片损坏，则尺寸会为 0
      this.canvas.width / (this.img.width !== 0 ? this.img.width : 1),
      this.canvas.height / (this.img.height !== 0 ? this.img.height : 1)
    )
    this.width = this.img.width * scale
    this.height = this.img.height * scale

    // 清除画布
    this.ctx.clearRect(0, 0, this.width, this.height)
    // 绘制图片作为背景
    this.ctx.drawImage(this.img, 0, 0, this.width, this.height)

    // 添加要绘制的图形
    const rect0 = new Rectangle('rect0', this.ctx!, defaultColor, 0, 0, 100, 100)
    const rect1 = new Rectangle('rect1', this.ctx!, defaultColor, 300, 0, 100, 100)
    const circle0 = new CircleCircle('circle0', this.ctx!, defaultColor, 200, 200, 50, 0, 2 * Math.PI)
    this.shapes.push(rect0, rect1, circle0)
    // 绘制图形
    this.drawGraphics()

    // 添加事件回调
    this.addShapeClickListener(rect0)
    this.addShapeClickListener(rect1)
    this.addShapeClickListener(circle0)
    // 处理事件监听
    this.handleListeners()
  }

  addShapeClickListener(shape: BaseShape) {
    shape.on(EventEnum.CLICK, (e) => {
      if (e.offsetX !== undefined && e.offsetY !== undefined) {
        const isInRegion = shape.isPointInRegion(e.offsetX, e.offsetY)
        if (isInRegion) {
          console.log(shape.id)
        }
      }
    })
  }

  drawGraphics() {
    if (this.isDrawing) return
    this.isDrawing = true
    this.shapes.forEach(shape => {
      shape.draw()
    })
    this.isDrawing = false
  }

  handleListeners() {
    if (!this.canvas) {
      console.error('Canvas is null')
      return
    }
    this.handleClick = (e: MouseEvent) => {
      this.shapes.forEach((shape) => {
        const listeners = shape.listeners[EventEnum.CLICK]
        if (listeners) {
          listeners.forEach((listener) => listener(e))
        }
      })
    }
    this.canvas.addEventListener(EventEnum.CLICK, this.handleClick)
  }

  // 供外部调用的 destroy 方法
  destroy() {
    if (this.canvas && this.handleClick) {
      this.canvas.removeEventListener(EventEnum.CLICK, this.handleClick)
    }
  }
}

/** 所有形状的基类 */
class BaseShape {
  listeners: { [key in EventEnum]?: ((e: MouseEvent) => void)[] } = {}
  constructor(
    public id: string,
    public ctx: CanvasRenderingContext2D,
    public color: string
  ) { }

  // 路径
  get path(): Path2D {
    return new Path2D()
  }

  // 绘制
  draw() {
    this.ctx.fillStyle = this.color
    this.ctx.fill(this.path)
  }
  on(eventName: EventEnum, callback: (e: any) => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }
    this.listeners[eventName]?.push(callback)
  }
  // 判断点是否在路径区域内
  isPointInRegion(x: number, y: number): boolean {
    return this.ctx.isPointInPath(this.path, x, y)
  }
}

/** 矩形 */
class Rectangle extends BaseShape {
  listeners = {
    [EventEnum.CLICK]: [
      (e: MouseEvent) => {
        const x = e.offsetX
        const y = e.offsetY
        const isInRegion = this.isPointInRegion(x, y)
        const oldColor = this.color
        const newColor = isInRegion ? 'red' : defaultColor
        if (oldColor !== newColor) {
          this.color = newColor
          this.draw()
        }
      }
    ]
  }
  constructor(
    id: string,
    ctx: CanvasRenderingContext2D,
    color: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {
    super(id, ctx, color)
  }

  get path() {
    const rectPath = new Path2D()
    rectPath.rect(this.x, this.y, this.width, this.height)
    return rectPath
  }
}

/** 圆 */
class CircleCircle extends BaseShape {
  constructor(
    id: string,
    ctx: CanvasRenderingContext2D,
    color: string,
    public x: number,
    public y: number,
    public radius: number,
    public startAngle: number,
    public endAngle: number
  ) {
    super(id, ctx, color)
  }

  get path() {
    const rectPath = new Path2D()
    rectPath.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle)
    return rectPath
  }
}
