let list = [];
let speed = 0
let selectedPoint = null;
let selectedOrigin = null;
let distanceThreshhold = 10;
let lastLine = null;
let lastPolygon = null;
let colorPicker, backgroundClr;
let voro;
addEventListener("contextmenu", (e) => {
  e.preventDefault();
  return false;
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorPicker = createColorPicker("#ffffff");
  backgroundClr = createColorPicker([0,64,0]);
  colorPicker.position(10, 10);
  backgroundClr.position(80, 10);
}

function draw() {
  // speed = (mouseX / width) * 10;
  background(backgroundClr.color());
  // list.forEach(function (obj) {
  //   obj.draw();
  //   // obj.move(random(-speed, speed), random(-speed, speed), true);
  // });

  // Cria digrama voronoi
  if (list.length > 0) {
    doVoronoi()
  }

  // edges = Voronoi_oldW();
  // edges.forEach(function (obj) {
  //   obj.draw();
  //   // obj.move(random(-speed, speed), random(-speed, speed), true);
  // });

  fill(255);
  noStroke();
  text(
    "Controls:\nLeft Click: Move Point\nRight Click: Delete Point\n" +
    "Shift + Click: Create Point\n" +
    // "Control + Click: Create Line\n" +
    // "Alt + Click: Create Polygon\n" +
    // "Alt + Control + Click: Create noFill Polygon",
    10,
    height - 100
  );
}

//------------------------------------------------------------------------------

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = colorPicker.color();
  }

  move(x, y, relative = false) {
    if (relative) {
      this.x += x;
      this.y += y;
    } else {
      this.x = x;
      this.y = y;
    }
  }

  setColor(color) {
    this.color = color;
  }

  draw() {
    this.x =  wrap(this.x, width)
    this.y =  wrap(this.y, height)

    this.move(random(-speed, speed), random(-speed, speed), true);

    stroke(this.color);
    strokeWeight(10);
    point(this.x, this.y);
  }
}

//------------------------------------------------------------------------------

class Line {
  constructor(pointList) {
    this.points = pointList;
    this.color = colorPicker.color();
  }

  move(x, y) {
    this.points[0].move(x, y, true);
    this.points[1].move(x, y, true);
  }

  setColor(color) {
    this.color = color;
  }

  draw() {
    if (this.points.length == 0) {
      var myIndex = list.indexOf(this);
      if (myIndex !== -1) {
        list.splice(myIndex, 1);
      }
    }
    // this.move(random(-speed, speed), random(-speed, speed), true);
    stroke(this.color);
    noFill();
    strokeWeight(3);

    beginShape();
    for (let i = 0; i < this.points.length; i++) {
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
  }
}

// //------------------------------------------------------------------------------

// class Polygon {
//   constructor(pointList) {
//     this.points = pointList;
//     this.color = colorPicker.color();
//     this.fill = true;
//   }

//   move(x, y) {
//     // this.start.move(x, y, true);
//     // this.end.move(x, y, true);
//   }

//   setColor(color) {
//     this.color = color;
//   }

//   draw() {
//     if (this.points.length == 0) {
//       var myIndex = list.indexOf(this);
//       if (myIndex !== -1) {
//         list.splice(myIndex, 1);
//       }
//     }

//     stroke(this.color);
//     if (this.fill) fill(this.color);
//     else noFill();
//     strokeWeight(3);

//     beginShape();
//     for (let i = 0; i < this.points.length; i++) {
//       vertex(this.points[i].x, this.points[i].y);
//     }
//     endShape(CLOSE);
//   }
// }

//------------------------------------------------------------------------------

function wrap(x, max) {
  x = x % max;
  return x < 0 ? max - x : x;
}

function mousePressed(event) {
  selectedPoint = null;
  // console.log(event);

  // poligono sem preenchimento
  // if (event.altKey && event.ctrlKey) {
  //   lastLine = null;
  //   // console.log("Alt click");

  //   if (lastPolygon == null) {
  //     poly = new Polygon([new Point(mouseX, mouseY)]);
  //     poly.fill = false;
  //     list.push(poly);
  //     lastPolygon = poly;
  //   } else {
  //     lastPolygon.points.push(new Point(mouseX, mouseY));
  //   }

  //   return;
  // }

  // Criar ponto
  if (event.shiftKey) {
    lastPolygon = null;
    lastLine = null;
    // console.log("Shift click");
    a = new Point(mouseX, mouseY);
    list.push(a);
    return;
  }

  // // Criar Linha
  // if (event.ctrlKey) {
  //   lastPolygon = null;
  //   // console.log("Control click");

  //   if (lastLine == null) {
  //     lines = new Line([new Point(mouseX, mouseY)]);
  //     list.push(lines);
  //     lastLine = lines;
  //   } else {
  //     lastLine.points.push(new Point(mouseX, mouseY));
  //   }
  //   return;
  // }

  // // Criar Poligono
  // if (event.altKey) {
  //   lastLine = null;
  //   // console.log("Alt click");

  //   if (lastPolygon == null) {
  //     poly = new Polygon([new Point(mouseX, mouseY)]);
  //     list.push(poly);
  //     lastPolygon = poly;
  //   } else {
  //     lastPolygon.points.push(new Point(mouseX, mouseY));
  //   }

  //   return;
  // }
  lastPolygon = null;
  lastCreated = null;
  moveMouse();

  if (mouseButton === RIGHT && selectedOrigin != null) {
    var myIndex = selectedOrigin.indexOf(selectedPoint);
    if (myIndex !== -1) {
      selectedOrigin.splice(myIndex, 1);
    }
  }

  return false;
}

function mouseDragged() {
  if (selectedPoint != null) {
    selectedPoint.x = mouseX;
    selectedPoint.y = mouseY;
  }
}

function moveMouse() {
  let pnt = null;
  let org = null;
  let dst;

  // pnt = list[0];
  // dst = dist(mouseX, mouseY, pnt.x, pnt.y);

  list.forEach(function (obj) {
    if (obj instanceof Point) {
      let dst2 = (st = dist(mouseX, mouseY, obj.x, obj.y));
      if (dst2 < dst || pnt == null) {
        pnt = obj;
        dst = dst2;
        org = list;
      }
    } else {
      obj.points.forEach(function (obj2) {
        let dst2 = (st = dist(mouseX, mouseY, obj2.x, obj2.y));
        if (dst2 < dst || pnt == null) {
          pnt = obj2;
          dst = dst2;
          org = obj.points;
        }
      });
    }
  });

  if (dst < distanceThreshhold) {
    // console.log(pnt, dst);
    selectedPoint = pnt;
    selectedOrigin = org;
  } else {
    selectedPoint = null;
    selectedOrigin = null;
  }
}
