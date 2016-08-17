const G = 9.8

class Timer {
  constructor() {
    this.now = Date.now() * 0.001
    this.delta = 0
  }

  tick() {
    var now = Date.now() * 0.001
    this.delta = now - this.now
    this.now = now
  }
}

class Spring {
  constructor(center, mass1, mass2, height1, height2, stiffness1, stiffness2, unstretchedHeight) {
    this.center = center
    this.R1 = unstretchedHeight * 0.5
    this.position1 = new Vec2(this.center.x, height1)
    this.velocity1 = new Vec2(0, 0)
    this.mass1 = mass1
    this.stiffness1 = stiffness1
    this.damping1 = 1
    this.radius1 = 1 + Math.sqrt(mass1 * 10) / Math.PI

    this.R2 = unstretchedHeight * 0.5
    this.position2 = new Vec2(this.center.x, height1 + height2)
    this.velocity2 = new Vec2(0, 0)
    this.mass2 = mass2
    this.stiffness2 = stiffness2
    this.damping2 = 1
    this.radius2 = 1 + Math.sqrt(mass2 * 10) / Math.PI

    this.fill1 = U.randomColorCode()
    this.fill2 = U.randomColorCode()
    this.stroke = "rgba(100, 100, 100, 0.08)"
  }

  // http://www.myphysicslab.com/dbl_spring1.html
  move(deltaTime) {
    var x = this.simulate(
      deltaTime,
      this.velocity1.y,
      this.velocity2.y,
      this.position1.y,
      this.position2.y
    )

    this.velocity1.y = x[0]
    this.velocity2.y = x[1]
    this.position1.y = x[2]
    this.position2.y = x[3]
  }

  simulate(t, v1, v2, p1, p2) {
    var y1 = p1
    var y2 = p2
    var w1 = this.radius1 + this.radius1
    var l1 = y1 - this.R1
    var l2 = y2 - y1 - w1 - this.R2

    var A = this.stiffness1 * l1
    var B = this.stiffness2 * l2
    var C = this.damping1 * v1
    var D = this.damping2 * v2
    var E = A + C
    var F = B + D
    var dv1 = (F - E) / this.mass1
    var dv2 = -F / this.mass2
    var v1r = v1 + t * dv1
    var v2r = v2 + t * dv2

    return [
      v1r,
      v2r,
      p1 + t * v1r,
      p2 + t * v2r
    ]
  }

  rungeKutta4(dt, v1, v2, p1, p2) {
    var h = dt
    var h2 = h / 2
    var x = [v1, v2, p1, p2]
    var aa = this.rkSimulate(0, p1, p2, v1, v2)
    var a = this.addmul(aa, x, h2)
    var bb = this.rkSimulate(h2, a[0], a[1], a[2], a[3])
    var b = this.addmul(bb, x, h2)
    var cc = this.rkSimulate(h2, b[0], b[1], b[2], b[3])
    var c = this.addmul(cc, x, h)
    var dd = this.rkSimulate(h, c[0], c[1], c[2], c[3])

    var h6 = h / 6
    for (var i = 0; i < x.length; ++i) {
      x[i] += h6 * (aa[i] + 2 * bb[i] + 2 * cc[i] + dd[i])
    }
    return x
  }

  addmul(a, x, h) {
    var y = new Array(a.length)
    for (var i = 0; i < a.length; ++i) {
      y[i] = a[i] * h + x[i]
    }
    return y
  }

  rkSimulate(t, v1, v2, p1, p2) {
    var y1 = p1
    var y2 = p2
    var w1 = this.radius1 + this.radius1
    var l1 = y1 - this.R1
    var l2 = y2 - y1 - w1 - this.R2

    var A = this.stiffness1 * l1
    var B = this.stiffness2 * l2
    var C = this.damping1 * v1
    var D = this.damping2 * v2
    var E = A + C
    var F = B + D
    var dv1 = t * (F - E) / this.mass1
    var dv2 = -t * F / this.mass2

    return [dv1, dv2, t * (v1 + dv1), t * (v2 + dv2)]
  }

  draw() {
    canvas.context.strokeStyle = this.stroke
    canvas.context.lineWidth = 400 / this.stiffness1
    canvas.drawLine(this.position1, this.center)

    canvas.context.strokeStyle = this.stroke
    canvas.context.lineWidth = 400 / this.stiffness2
    canvas.drawLine(this.position2, this.position1)

    canvas.context.fillStyle = this.fill1
    canvas.drawPoint(this.position1, this.radius1)

    canvas.context.fillStyle = this.fill2
    canvas.drawPoint(this.position2, this.radius2)
  }
}

window.addEventListener("visibilitychange", onVisibilityChange, false)
var canvas = new Canvas(window.innerWidth, window.innerHeight * 0.8)
canvas.canvas.addEventListener("click", onClickCanvas, false)
var timer = new Timer()
var spring = makeSpring()

animate()

function animate() {
  timer.tick()
  move()
  draw()
  requestAnimationFrame(animate)
}

function move() {
  for (var i = 0; i < spring.length; ++i) {
    spring[i].move(timer.delta)
  }
}

function draw() {
  canvas.clearWhite()

  for (var i = 0; i < spring.length; ++i) {
    spring[i].draw()
  }
}

function makeSpring() {
  var spring = []
  var numSpring = 100
  var massRatio = 0.1 + Math.random() * 0.8
  var height = Math.random() * canvas.center.y
  var heightRatio = Math.random()
  var stiffness1 = 480 * Math.random()
  var stiffness2 = 20 + (480 - stiffness1)
  for (var i = 1; i <= numSpring; ++i) {
    var mass = 2 * i
    spring.push(new Spring(
      new Vec2(i * canvas.width / (numSpring + 1), 0),
      mass * massRatio,
      mass * (1 - massRatio),
      height * heightRatio,
      height * (1 - heightRatio),
      stiffness1,
      stiffness2,
      canvas.center.y
    ))
  }
  return spring
}

function onVisibilityChange() {
  timer.tick() // ここでtickしないとdeltaTimeが大きくなりすぎておかしくなる。
}

function onClickCanvas(event) {
  spring = makeSpring()
}