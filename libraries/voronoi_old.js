lista = []
cells = []
edges = []
edges2 = []

function Voronoi_old() {

    cells = []
    edges = []
    edges2 = []

    // cc = new Cell(new Point(-2 * width, -2 * height))
    // cc.edges.push(new Line([new Point(cc.site.x - 100, cc.site.y - 100), new Point(cc.site.x + 100, cc.site.y - 100)]))
    // cc.edges.push(new Line([new Point(cc.site.x + 100, cc.site.y - 100), new Point(cc.site.x, cc.site.y + 100)]))
    // cc.edges.push(new Line([new Point(cc.site.x, cc.site.y + 100), new Point(cc.site.x - 100, cc.site.y - 100)]))
    // cells.push(cc)

    // cc = new Cell(new Point(2 * width, -2 * height))
    // cc.edges.push(new Line([new Point(cc.site.x - 100, cc.site.y - 100), new Point(cc.site.x + 100, cc.site.y - 100)]))
    // cc.edges.push(new Line([new Point(cc.site.x + 100, cc.site.y - 100), new Point(cc.site.x, cc.site.y + 100)]))
    // cc.edges.push(new Line([new Point(cc.site.x, cc.site.y + 100), new Point(cc.site.x - 100, cc.site.y - 100)]))
    // cells.push(cc)


    // cc = new Cell(new Point(0.7 * width, 0.7 * height))
    // cc.edges.push(new Line([new Point(cc.site.x - 100, cc.site.y - 100), new Point(cc.site.x + 100, cc.site.y - 100)]))
    // cc.edges.push(new Line([new Point(cc.site.x + 100, cc.site.y - 100), new Point(cc.site.x, cc.site.y + 100)]))
    // cc.edges.push(new Line([new Point(cc.site.x, cc.site.y + 100), new Point(cc.site.x - 100, cc.site.y - 100)]))
    // cells.push(cc)

    // cc = new Cell(new Point(-2 * width, 2 * height))
    // cc.edges.push(new Line([new Point(cc.site.x - 100, cc.site.y - 100), new Point(cc.site.x + 100, cc.site.y - 100)]))
    // cc.edges.push(new Line([new Point(cc.site.x + 100, cc.site.y - 100), new Point(cc.site.x, cc.site.y + 100)]))
    // cc.edges.push(new Line([new Point(cc.site.x, cc.site.y + 100), new Point(cc.site.x - 100, cc.site.y - 100)]))
    // cells.push(cc)

    if (list.length > 0) {
        site = list[0]
        cell = new Cell(site)
        site.color = 'red'
        cell.edges = makeBorders();
        cells.push(cell)

    }

    for (i = 0; i < list.length; i++) {
        site = list[i]
        cell = new Cell(site)
        site.color = 'red'
        cell.edges = makeBorders();
        // cells.push(cell)
        for (j = 0; j < cells.length; j++) {
            c = cells[j]
            // edges2.push(c.site)
            pb = bisectLine(list[i], cells[j].site)
            pb.color = "blue"
            edges2.push(pb)
            // cells[i].edges.push(pb)
            // cell.edges.push(pb)
            // edges.push(pb)
            x = []
            for (k = 0; k < c.edges.length; k++) {
                // console.log("a")
                e = c.edges[k]
                // console.log(e)

                let temp = new Line([site, c.site])
                // console.log(site,c.site,temp)

                // console.log((doIntersect(temp, c.edges[k])))
                if (doIntersect(temp, c.edges[k])) {
                    dd1 = distanceToLine(e, site)
                    dd2 = distanceToLine(pb, site)

                    if (dd1 < dd2) {
                        // e.remove = true;
                        e.color = "green"
                    }
                }

                if (doIntersect(e, pb)) {
                    p_ = intersectLine(e, pb)
                    edges2.push(p_)
                    // c.edges[k] = clip(e, p_, site)
                    p_.color = "green"
                    x.push(p_)
                }

            }
            // console.log(x.length)
            if (x.length == 2) {
                edge = new Line([x[0], x[1]])
                c.edges.push(edge)
                cell.edges.push(edge)
                edges.push(edge)

                edges2.push(edge)
                // console.log("COLIDE")
            }

            c.edges = c.edges.filter(function (el) {
                return el.remove == false;
            });

            edges = edges.filter(function (el) {
                return el.remove == false;
            });



        }
        cells.push(cell)
    }

    // //15
    // border = [
    //     new Line([new Point(0, 0), new Point(0, width)]),
    //     new Line([new Point(height, width), new Point(0, width)]),
    //     new Line([new Point(0, 0), new Point(height, 0)]),
    //     new Line([new Point(height, 0), new Point(height, width)])

    // ]

    // // console.log(border)
    // for (j = 0; j < 4; j++) {
    //     pp = []
    //     pp.push(border[j].points[0], border[j].points[1])

    //     for (i = 0; i < edges.length; i++) {
    //         e = edges[i]
    //         if (isOutside(e.points[0], j) && isOutside(e.points[1], j)) {
    //             e.remove = true
    //         } 
    //         ip = intersectLine(e, border[j])
    //         if (distanceToLine(border[j], e) < 0.001) {
    //             // if (isOutside(e.points[0], j))
    //             //     e.points[0] = ip
    //             // if (isOutside(e.points[1], j))
    //             //     e.points[1] = ip
    //             pp.push(ip)
    //         }

    //         // for (k = 0; k < edges.length; k++) {
    //         //     e = edges[k]
    //         //     if (e.remove == true) {
    //         //         idx = edges.indexOf(e)
    //         //         edges.splice(idx, 1);
    //         //         k=0
    //         //         // e.color = "black"
    //         //     }

    //         // }


    //     }

    // }
    return edges


}

function clip(e, p, site) {
    let line1 = new Line([e.points[0], new Point(p.x, p.y)])
    let line2 = new Line([new Point(p.x, p.y), e.points[1]])

    let dist1 = distanceToLine(line1, site)
    let dist2 = distanceToLine(line2, site)

    if (dist1 > dist2) {
        line1.color = "red"
        return line1
    }

    line2.color = "red"
    return line2

}

function isOutside(p, border) {
    center = new Point(height / 2, width / 2)
    if (border <= 2)
        return distance(p, center) > width / 2
    else
        return distance(p, center) > height / 2
}

function bisectLine(p1, p2) {
    mid = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    // mid.color = "green"
    // edges2.push(mid)
    u = (p2.y - p1.y)
    d = (p2.x - p1.x)
    m1 = (u / d)
    m2 = - (d / u)

    b = -((m2 * mid.x) - mid.y)
    y1 = m2 * 0 + b
    y2 = m2 * width + b

    line = new Line([new Point(-0 * width, y1), new Point(1 * width, y2)])
    return line;
}

function distanceToLine(line, p1) {
    a = createVector(line.points[0].x, line.points[0].y)
    b = createVector(line.points[1].x, line.points[1].y)

    p = createVector(p1.x, p1.y)

    d1 = p5.Vector.sub(b, a);
    d2 = p5.Vector.sub(p, a);
    l1 = d1.mag();

    dotp = constrain(d2.dot(d1.normalize()), 0, l1);
    op = p5.Vector.add(a, d1.mult(dotp))
    return p5.Vector.dist(p, op);

}

function intersectLine(l1, l2) {
    // console.log(l1,l2)
    let p = intersectPoint(l1.points[0], l1.points[1], l2.points[0], l2.points[1])
    return p;
}

function distance(p1, p2) {
    var a = p1.x - p2.x;
    var b = p1.y - p2.y;

    return Math.sqrt(a * a + b * b);
}


class Cell {
    constructor(site) {
        this.edges = [];
        this.site = site;
    }
}
function intersectPoint(point1, point2, point3, point4) {
    let ua = ((point4.x - point3.x) * (point1.y - point3.y) -
        (point4.y - point3.y) * (point1.x - point3.x)) /
        ((point4.y - point3.y) * (point2.x - point1.x) -
            (point4.x - point3.x) * (point2.y - point1.y));

    let ub = ((point2.x - point1.x) * (point1.y - point3.y) -
        (point2.y - point1.y) * (point1.x - point3.x)) /
        ((point4.y - point3.y) * (point2.x - point1.x) -
            (point4.x - point3.x) * (point2.y - point1.y));

    let x = point1.x + ua * (point2.x - point1.x);
    let y = point1.y + ua * (point2.y - point1.y);

    let result = new Point(x, y)
    return result
}

function makeBorders() {
    return [
        new Line([new Point(100, 100), new Point(100, height - 100)]),
        new Line([new Point(width - 100, height - 100), new Point(100, height - 100)]),
        new Line([new Point(100, 100), new Point(width - 100, 100)]),
        new Line([new Point(width - 100, 100), new Point(width - 100, height - 100)])

    ]
}


function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
        return true;

    return false;
}
function orientation_(p, q, r) {

    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0; // collinear

    return (val > 0) ? 1 : 2; // clock or counterclock wise
}
function doIntersect(l1, l2) {
    // console.log(l1,l2)

    let p1 = l1.points[0]
    let q1 = l1.points[1]
    let p2 = l2.points[0]
    let q2 = l2.points[1]

    let o1 = orientation_(p1, q1, p2);
    let o2 = orientation_(p1, q1, q2);
    let o3 = orientation_(p2, q2, p1);
    let o4 = orientation_(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false;
}