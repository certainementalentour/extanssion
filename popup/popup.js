"use strict";

function k() {
	function e() {
		var e = {
			j: Object.create(null),
			use: function(t, s) {
				return t(e, s) || e
			},
			H: function(t, s, i) {
				var r = e.j[t] || (e.j[t] = []);
				return i = i ? function i() {
					i.D || (e.G(t, i), s.apply(s, arguments), i.D = !0)
				} : s, i.B = s.toString(), r.push(i), e
			},
			once: function(t, s) {
				return e.H(t, s, !0), e
			},
			G: function(t, s) {
				if (s && e.j[t]) {
					var i = s.toString();
					e.j[t] = e.j[t].filter((function(e) {
						return e.B !== i
					}))
				} else t ? e.j[t] = [] : e.j = Object.create(null);
				return e
			},
			m: function(t) {
				if ("*" !== t) {
					var s = [].slice.call(arguments);
					(e.j[t] || []).map((function(e) {
						e.apply(e, s.slice(1))
					})), (e.j["*"] || []).map((function(e) {
						e.apply(e, s)
					}))
				}
				return e
			}
		};
		return e
	}
	class t {
		constructor() {
			this.header = {
				route: []
			}, this.body = {}
		}
		M(e) {
			return this.header.type = e, this
		}
		L(e) {
			return this.header.source = e, this
		}
		I(e) {
			return this.header.destination = e, this
		}
		K(e) {
			return this.body.name = e, this
		}
		setData(e) {
			return this.body.data = e, this
		}
		get() {
			return {
				header: {
					type: this.header.type,
					source: this.header.source,
					destination: this.header.destination,
					route: this.header.route
				},
				body: {
					name: this.body.name,
					data: this.body.data
				}
			}
		}
		parse(e) {
			this.header = e?.header, this.body.name = e?.body?.name;
			try {
				this.body.data = e?.body?.data || void 0
			} catch (t) {
				this.body.data = e?.body?.data
			}
			return this
		}
	}
	class s {
		constructor(t, s, i) {
			this.l = t, this.g = s, this.loaded = i, this.closed = this.F = !1, this.buffer = [], this.listener = e(), this.response = e(), this.o = () => {}, t.A.push(this)
		}
		debug() {}
		J() {
			this.loaded = !0, this.l.O.m(this.g), this.F || this.u("linking", "", ""), this.buffer.forEach((e => {
				this.v(e.get())
			}))
		}
		v(e) {
			try {
				if (!this.o) throw Error("No handshakeOut function has been setup");
				this.o?.(e)
			} catch (e) {}
		}
		u(e, s, i) {
			this.closed || (e = (new t).M(e).L(this.l.g).I(this.g).K(s).setData(i), this.loaded ? this.v(e.get()) : this.buffer.push(e))
		}
		s(e) {
			if (!this.closed && e?.header?.type && "string" == typeof e?.body?.name) {
				var s = (new t).parse(e);
				s?.header?.destination == this.l.g && (s.header.route.push("interpreter:" + this.l.g), "linking" !== s.header.type && ("request" === s.header.type ? this.listener.m(s.body.name, s.body.data, (e => this.u("response", s.body.name, e))) : "response" === s.header.type && this.response.m(s.body.name, s.body.data)))
			}
		}
		request(e, t) {
			return new Promise(((s, i) => {
				if (this.closed) return i({
					name: e,
					reason: "closed"
				});
				let r;
				this.response.once(e, (e => {
					clearTimeout(r), s(e)
				})), this.u("request", e, t), r = setTimeout((() => i({
					name: e,
					reason: "timeout",
					timeout: r,
					source: this.l.g,
					destination: this.g
				})), 2e3)
			}))
		}
	}
	let i = new class {
		constructor(t) {
			this.g = t, this.A = [], this.O = e()
		}
		debug() {}
		s(e) {
			e?.header?.type && "string" == typeof e?.body?.name && e.header.destination === this.g && (e.header.route.push("communication:" + this.g), this.A.find((t => t.g === e.header.source))?.s(e))
		}
		C() {
			return new s(this, "background", !1)
		}
	}("popup");
	document.domain = document.domain, self.chrome instanceof Object && (self.browser = self.chrome);
	let r = self.browser.runtime.connect(),
		n = i.C();
	n.o = e => r.postMessage(e, "*"), r.onMessage.addListener((e => {
		n.s(e)
	})), n.J(), n.request("current-tab").then((e => {
		"close" === e && window.close()
	}))
}
"function" == typeof define && define.P ? define(k) : k();