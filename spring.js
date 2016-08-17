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
  constructor(center, mass, length, unstretchedHeight) {
    this.center = center
    this.length = length
    this.position = new Vec2(this.center.x, this.center.y + this.length)
    this.velocity = new Vec2(0, 0)
    this.mass = mass
    this.stiffness = 1000
    this.friction = 10
    this.y0 = unstretchedHeight

    this.radius = Math.sqrt(this.mass) / Math.PI
    this.fill = U.randomColorCode()
    this.stroke = "rgba(68, 68, 68, 0.5)"
  }

  // http://www.myphysicslab.com/spring1.html
  move(deltaTime) {
    var kx = (this.position.y - this.y0) * this.stiffness
    var bv = this.velocity.y * this.friction
    var dv = (kx + bv) / this.mass
    this.velocity.y -= dv * deltaTime
    this.position.y += this.velocity.y * deltaTime
  }

  draw() {
    // canvas.context.strokeStyle = this.stroke
    // canvas.drawLine(this.position, this.center)

    canvas.context.fillStyle = this.fill
    canvas.drawPoint(this.position, this.radius)
  }
}

window.addEventListener("visibilitychange", onVisibilityChange, false)
var canvas = new Canvas(window.innerWidth, 512)
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
  var numSpring = 1024
  var maxLength = 100
  for (var i = 1; i <= numSpring; ++i) {
    spring.push(new Spring(
      new Vec2(i * canvas.width / (numSpring + 1), 0),
      i,
      0,//maxLength * i / numSpring,
      canvas.center.y
    ))
  }
  return spring
}

function onVisibilityChange() {
  timer.tick() // ここでtickしないとdeltaTimeが大きくなりすぎておかしくなる。
}

function onClickCanvas(event) {
  console.log("here")
  for (var i = 0; i < spring.length; ++i) {
    spring[i].velocity.y += 100 * Math.random()
  }
}