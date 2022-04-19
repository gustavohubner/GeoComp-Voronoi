class Voronoi {
	constructor(points, width, height) {
		this.point_list = points;
		this.reset();
		this.box_x = width;
		this.box_y = height;
	}

	reset() {
		this.event_list = new SortedQueue();
		this.beachline_root = null;
		this.voronoi_vertex = [];
		this.edges = [];
	}

	// computa diagrama voronoi para um conjunto de pontos
	update() {
		this.reset();
		let points = []; // eventos site ou de ponto
		let e = null;

		// cria um evento para cada ponto ou "site"
		for (const p of this.point_list) points.push(new Event("site", p));
		this.event_list.points = points;

		while (this.event_list.length > 0) {
			// remove evento da fila
			e = this.event_list.extract_first();

			// evento pode ser de ponto ou circulo
			if (e.type == "site")
				this.site_event(e.position);
			else
				if (e.active) this.circle_event(e);
		}
		this.complete_segments(e.position);
	}

	// evento quando um ponto é encontrado na sweep line, 
	// uma nova parabola é criada, 
	site_event(p) {
		let q = this.beachline_root;
		// ao encontrar um novo ponto, cria um arco
		if (q == null) {
			// Se não foi criado nenhuma ainda, cria algo em  ponto p
			this.beachline_root = new Arc(null, null, p, null, null);
		} else {
			// senão procura parabola diretamente acima do ponto p
			while (q.right != null && this.parabola_intersection(p.y, q.focus, q.right.focus) <= p.x) {
				q = q.right;
			}

			// pontos onde parabolas interseccionam é uma estarão presentes no digrama de voronoi
			// como arestas
			let e_qp = new Edge(q.focus, p, p.x);
			let e_pq = new Edge(p, q.focus, p.x);

			// divide a parabola encontrada em 2 parabolas
			let arc_p = new Arc(q, null, p, e_qp, e_pq);
			let arc_qr = new Arc(arc_p, q.right, q.focus, e_pq, q.edge.right);
			if (q.right) q.right.left = arc_qr;
			arc_p.right = arc_qr;
			q.right = arc_p;
			q.edge.right = e_qp;

			if (q.event) q.event.active = false;

			// procura por eventos de circulo
			// nas parabolas criadas
			this.add_circle_event(p, q);
			this.add_circle_event(p, arc_qr);

			// adiciona arestas ao vetor de arestas
			this.edges.push(e_qp);
			this.edges.push(e_pq);
		}
	}

	// evento onde 3 parabolas se encontram -> nova vértice voronoi
	// é um circulo que passa por 3 pontos, que possuem 3 parabolas consecutivas
	// parabola do meio será removida, um vértice novo sera adicionado no ponto de
	// intersecção.
	circle_event(e) {
		let arc = e.caller;
		let p = e.position;
		let edge_new = new Edge(arc.left.focus, arc.right.focus);

		// desativa eventos envolvendo a parabola atual
		// ela não será usada mais na "beachline"
		if (arc.left.event) arc.left.event.active = false;
		if (arc.right.event) arc.right.event.active = false;

		arc.left.edge.right = edge_new;
		arc.right.edge.left = edge_new;
		arc.left.right = arc.right;
		arc.right.left = arc.left;

		// adiciona uma aresta entre as parabolas
		this.edges.push(edge_new);

		// adiciona um vertice voronoi onde as parabolas a esquerda e direita se encontram
		if (!this.point_outside(e.vertex)) this.voronoi_vertex.push(e.vertex);
		arc.edge.left.end = arc.edge.right.end = edge_new.start = e.vertex;

		// procura novos eventos de circulo com novas parabolas vizinhas
		this.add_circle_event(p, arc.left);
		this.add_circle_event(p, arc.right);
	}

	// Input: Point, Point
	add_circle_event(p, arc) {
		// evento onde 3 parabolas colidem
		// centro de um circulo que passa por 3 pontos
		if (arc.left && arc.right) {
			let a = arc.left.focus;
			let b = arc.focus;
			let c = arc.right.focus;

			if ((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y) > 0) {
				let new_inters = this.edge_intersection(
					arc.edge.left,
					arc.edge.right
				);
				let circle_radius = Math.sqrt(
					(new_inters.x - arc.focus.x) ** 2 +
					(new_inters.y - arc.focus.y) ** 2
				);
				let event_pos = circle_radius + new_inters.y;
				if (event_pos > p.y && new_inters.y < this.box_y) {
					let e = new Event(
						"circle",
						new Point(new_inters.x, event_pos),
						arc,
						new_inters
					);
					arc.event = e;
					this.event_list.insert(e);
				}
			}
		}
	}

	// intersecção de parabolas
	parabola_intersection(y, f1, f2) {
		let fyDiff = f1.y - f2.y;
		if (fyDiff == 0) return (f1.x + f2.x) / 2;
		let fxDiff = f1.x - f2.x;
		let b1md = f1.y - y;
		let b2md = f2.y - y;
		let h1 = (-f1.x * b2md + f2.x * b1md) / fyDiff;
		let h2 = Math.sqrt(b1md * b2md * (fxDiff ** 2 + fyDiff ** 2)) / fyDiff;

		return h1 + h2;
	}

	// intersecção de arestas
	edge_intersection(e1, e2) {
		if (e1.m == Infinity) return new Point(e1.start.x, e2.getY(e1.start.x));
		else if (e2.m == Infinity)
			return new Point(e2.start.x, e1.getY(e2.start.x));
		else {
			let mdif = e1.m - e2.m;
			if (mdif == 0) return null;
			let x = (e2.q - e1.q) / mdif;
			let y = e1.getY(x);
			return new Point(x, y);
		}
	}

	// fecha arestas que ficaram com um final desconectado fora da area de vizualização
	complete_segments(last) {
		let r = this.beachline_root;
		let e, x, y;
		while (r.right) {
			e = r.edge.right;
			x = this.parabola_intersection(
				last.y * 1.1,
				e.arc.left,
				e.arc.right
			);
			y = e.getY(x);

			if (
				(e.start.y < 0 && y < e.start.y) ||
				(e.start.x < 0 && x < e.start.x) ||
				(e.start.x > this.box_x && x > e.start.x)
			) {
				e.end = e.start;
			} else {
				e.m * (x - e.start.x) <= 0 ? (y = 0) : (y = this.box_y);
				e.end = this.edge_end(e, y);
			}
			r = r.right;
		}

		let option;

		for (let i = 0; i < this.edges.length; i++) {
			e = this.edges[i];
			option =
				1 * this.point_outside(e.start) + 2 * this.point_outside(e.end);

			switch (option) {
				case 3:
					this.edges[i] = null;
					break;
				case 1:
					e.start.y < e.end.y ? (y = 0) : (y = this.box_y);
					e.start = this.edge_end(e, y);
					break;
				case 2:
					e.end.y < e.start.y ? (y = 0) : (y = this.box_y);
					e.end = this.edge_end(e, y);
					break;
				default:
					break;
			}
		}
	}

	// limita aresta a tela
	edge_end(e, y_lim) {
		let x = Math.min(this.box_x, Math.max(0, e.getX(y_lim)));
		let y = e.getY(x);
		let p = new Point(x, y);
		this.voronoi_vertex.push(p);
		return p;
	}

	// testa se ponto está dentro da area de visualização
	point_outside(p) {
		return p.x < 0 || p.x > this.box_x || p.y < 0 || p.y > this.box_y;
	}

	// desenha resultado
	draw() {
		for (const p of this.point_list) {
			p.draw()
		}

		for (const e of this.edges) {
			if (e && e.end && e.start) {
				let ln = new Line([e.end, e.start])
				ln.draw()
			}
		}
	}
}

// chama classe voronoi
function doVoronoi() {
	if (voro == null)
		voro = new Voronoi(list, width, height)
	voro.update()
	voro.draw()
}
// ------------------------------------------------------------------------------
// classes
class Arc {
	constructor(l, r, f, el, er) {
		this.left = l;
		this.right = r;
		this.focus = f; // Point
		this.edge = { left: el, right: er }; // Edge
		this.event = null;
	}
}

class Edge {
	constructor(p1, p2, startx) {
		this.m = -(p1.x - p2.x) / (p1.y - p2.y);
		this.q =
			(0.5 * (p1.x ** 2 - p2.x ** 2 + p1.y ** 2 - p2.y ** 2)) /
			(p1.y - p2.y);
		this.arc = { left: p1, right: p2 };
		this.end = null;
		this.start = null;
		if (startx)
			this.start = new Point(
				startx,
				this.m != Infinity ? this.getY(startx) : null
			);
	}
	getY(x) {
		return x * this.m + this.q;
	}
	getX(y) {
		if (this.m == Infinity) return this.start.x;
		return (y - this.q) / this.m;
	}
}

class Event {
	constructor(type, position, caller, vertex) {
		this.type = type;
		this.caller = caller;
		this.position = position;
		this.vertex = vertex;
		this.active = true;
	}
}

class SortedQueue {
	constructor(events) {
		this.list = [];
		if (events) this.list = events;
		this.sort();
	}

	get length() {
		return this.list.length;
	}

	extract_first() {
		if (this.list.length > 0) {
			let elm = this.list[0];
			this.list.splice(0, 1);
			return elm;
		}
		return null;
	}

	insert(event) {
		this.list.push(event);
		this.sort();
	}

	set points(events) {
		this.list = events;
		this.sort();
	}

	sort() {
		this.list.sort(function (a, b) {
			let diff = a.position.y - b.position.y;
			if (diff == 0) return a.position.x - b.position.x;
			return diff;
		});
	}
}