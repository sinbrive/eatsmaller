import p5 from 'p5'
import 'p5/lib/addons/p5.play'

const sketch = (p) => {
  let gray = 0
  let circles
  let boxes
  let allSprites = []
  let bubblys
  let hero
  let sun
  let gravity
  const SCENEW = 2560
  const SCENEH = 1440
  //初始化太阳
  let initSun = () => {
    sun = p.createSprite(p.random(SCENEW / 6, SCENEW * 5 / 6), p.random(SCENEH / 6, SCENEH * 5 / 6))
    sun.addAnimation('glow', 'assets/sun1.png', 'assets/sun3.png')
    sun.mass = 50
    sun.setSpeed(p.random(1, 2), p.random(0, 360))
    sun.setCollider('circle', 0, 0, 70)
    gravity = p.createSprite(sun.position.x, sun.position.y)
    gravity.draw = () => {}
    gravity.setCollider('circle', 0, 0, 700, 700)
    gravity.debug = true
    allSprites.push(sun)
  }
  //初始化主角
  let initHero = () => {
    let heroface = p.loadImage('assets/face.png')
    hero = p.createSprite(p.width / 2, p.height / 2, 10, 10)
    hero.setCollider('circle', 0, 0, 50, 50)
    // hero.addAnimation('crazy', 'assets/sun1.png', 'assets/sun3.png')
    hero.draw = function() {
      p.fill(237, 205, 0)
      p.push()
      p.rotate(p.radians(this.getDirection()))
      p.ellipse(0, 0, 100 + this.getSpeed(), 100 - this.getSpeed() / 1.5)
      p.pop()
      p.image(heroface, this.deltaX * 2, this.deltaY * 2)
    }
    hero.maxSpeed = 10
  }
  //主角移动
  let heroUpdate = () => {
    // hero.setCollider('circle', 0, 0, 50 + hero.getSpeed() / 2, 50 - hero.getSpeed() / 3)
    hero.velocity.x = (p.camera.mouseX - hero.position.x) / 20
    hero.velocity.y = (p.camera.mouseY - hero.position.y) / 20
  }

  p.setup = () => {
    p.createCanvas(1440, 768)
    let border = p.createSprite(SCENEW / 2, SCENEH / 2)
    border.setCollider('rectangle', 0, 0, SCENEW + 150, SCENEH + 150)
    border.debug = true
    border.draw = () => {}
    circles = new p.Group()
    //添加圆形
    for (let i = 0; i < 20; i++) {
      let circle = p.createSprite(p.random(0, p.width), p.random(0, p.height))
      circle.addAnimation('normal', 'assets/asterisk_circle0006.png', 'assets/asterisk_circle0008.png')
      circle.setCollider('circle', -2, 2, 55)
      circle.setSpeed(p.random(1, 3), p.random(0, 360))
      circle.scale = p.random(0.1, 0.8)
      circle.mass = circle.scale
      circle.maxSpeed = 10
      circles.add(circle)
      allSprites.push(circle)
    }
    //添加方形
    boxes = new p.Group()

    for (let i = 0; i < 8; i++) {
      let box = p.createSprite(p.random(SCENEW / 10, SCENEW * 9 / 10), p.random(SCENEH / 10, SCENEH * 9 / 10))
      box.addAnimation('normal', 'assets/box0001.png', 'assets/box0003.png')
      box.immovable = true
      if (i % 2 == 0)
        box.rotation = 90
      boxes.add(box)
    }
    //添加加速泡泡
    bubblys = new p.Group()
    for (let i = 0; i < 5; i++) {
      let bubbly = p.createSprite(p.random(SCENEW / 10, SCENEW * 9 / 10), p.random(SCENEH / 10, SCENEH * 9 / 10))
      bubbly.addAnimation('normal', 'assets/bubbly0001.png', 'assets/bubbly0004.png')
      bubbly.setCollider('rectangle', 0, 0, 80, 120)
      bubblys.add(bubbly)
      if (i % 2 == 0)
        bubbly.rotation = 90
      allSprites.push(bubbly)
    }
    initSun()
    initHero()
  }
  //游戏机制
  let bigEatSmall = (clctor, clcted) => {
    clcted.velocity.x += clctor.velocity.x / 10
    clcted.velocity.y += clctor.velocity.y / 10
    if (clctor.scale >= clcted.scale) {
      if (clctor.scale < 3) {
        clctor.scale += clcted.scale / 20
      }
      if (clcted.scale <= clctor.scale / 15) {
        clcted.remove()
      } else {
        clcted.scale -= clctor.scale / 15
      }
    } else {
      if (clctor.scale <= clcted.scale / 15) {
        clctor.remove()
      } else {
        clctor.scale -= clcted.scale / 15
      }
      if (clcted.scale < 3) {
        clcted.scale += clctor.scale / 20
      }
    }
  }
  //太阳引力
  let gravityEffect = (clctor, clcted) => {
    clctor.velocity.x += (clcted.position.x - clctor.position.x) / 4000
    clctor.velocity.y += (clcted.position.y - clctor.position.y) / 4000
  }

  p.draw = () => {
    p.background(255, 255, 255)
    gravity.position.x = sun.position.x
    gravity.position.y = sun.position.y
    if (p.random(0, 100) <= 5) {
      let circle = p.createSprite(p.random(0, p.width), p.random(0, p.height))
      circle.addAnimation('normal', 'assets/asterisk_circle0006.png', 'assets/asterisk_circle0008.png')
      circle.setCollider('circle', -2, 2, 55)
      circle.setSpeed(p.random(2, 3), p.random(0, 360))
      circle.scale = p.random(0.1, 1)
      circle.mass = circle.scale
      circles.add(circle)
      allSprites.push(circle)
    }
    circles.overlap(circles, bigEatSmall)
    circles.bounce(boxes)
    hero.collide(bubblys)
    circles.overlap(bubblys, (clctor, clcted) => {
      clcted.rotation === 90
        ? clctor.velocity.x += 0.5
        : clctor.velocity.y -= 0.5
    })
    bubblys.collide(boxes)
    boxes.collide(boxes)
    circles.collide(sun)
    circles.overlap(gravity, gravityEffect)
    sun.displace(boxes)
    sun.displace(bubblys)
    hero.collide(boxes)
    hero.displace(sun)
    hero.overlap(circles, bigEatSmall)

    for (var i = 0; i < allSprites.length; i++) {
      var s = allSprites[i]
      if (s.position.x < 0) {
        s.position.x = 1
        s.velocity.x = p.abs(s.velocity.x)
      }

      if (s.position.x > SCENEW) {
        s.position.x = SCENEW - 1
        s.velocity.x = -p.abs(s.velocity.x)
      }

      if (s.position.y < 0) {
        s.position.y = 1
        s.velocity.y = p.abs(s.velocity.y)
      }

      if (s.position.y > SCENEH) {
        s.position.y = SCENEH - 1
        s.velocity.y = -p.abs(s.velocity.y)
      }
      s.velocity.x /= 1.001
      s.velocity.y /= 1.001
    }
    p.camera.position.x = hero.position.x
    p.camera.position.y = hero.position.y

    //limit the hero movements
    if (hero.position.x < 0)
      hero.position.x = 0
    if (hero.position.y < 0)
      hero.position.y = 0
    if (hero.position.x > SCENEW)
      hero.position.x = SCENEW
    if (hero.position.y > SCENEH)
      hero.position.y = SCENEH

    heroUpdate()

    p.drawSprites()
  }

  p.mousePressed = () => {
    console.log(circles[0])
  }
}

new p5(sketch)