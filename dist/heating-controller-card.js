// node_modules/@lit/reactive-element/css-tag.js
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var t$1 = globalThis;
var e$2 = t$1.ShadowRoot && (void 0 === t$1.ShadyCSS || t$1.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s$2 = Symbol();
var o$3 = /* @__PURE__ */ new WeakMap();
var n$2 = class {
	constructor(t, e, o) {
		if (this._$cssResult$ = !0, o !== s$2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = t, this.t = e;
	}
	get styleSheet() {
		let t = this.o;
		const s = this.t;
		if (e$2 && void 0 === t) {
			const e = void 0 !== s && 1 === s.length;
			e && (t = o$3.get(s)), void 0 === t && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), e && o$3.set(s, t));
		}
		return t;
	}
	toString() {
		return this.cssText;
	}
};
var r$2 = (t) => new n$2("string" == typeof t ? t : t + "", void 0, s$2);
var i$3 = (t, ...e) => {
	return new n$2(1 === t.length ? t[0] : e.reduce((e, s, o) => e + ((t) => {
		if (!0 === t._$cssResult$) return t.cssText;
		if ("number" == typeof t) return t;
		throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
	})(s) + t[o + 1], t[0]), t, s$2);
};
var S$1 = (s, o) => {
	if (e$2) s.adoptedStyleSheets = o.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
	else for (const e of o) {
		const o = document.createElement("style"), n = t$1.litNonce;
		void 0 !== n && o.setAttribute("nonce", n), o.textContent = e.cssText, s.appendChild(o);
	}
};
var c$2 = e$2 ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((t) => {
	let e = "";
	for (const s of t.cssRules) e += s.cssText;
	return r$2(e);
})(t) : t;
// node_modules/@lit/reactive-element/reactive-element.js
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/ var { is: i$2, defineProperty: e$1, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$1, getOwnPropertySymbols: o$2, getPrototypeOf: n$1 } = Object, a$1 = globalThis, c$1 = a$1.trustedTypes, l$1 = c$1 ? c$1.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t, s) => t, u$1 = {
	toAttribute(t, s) {
		switch (s) {
			case Boolean:
				t = t ? l$1 : null;
				break;
			case Object:
			case Array: t = null == t ? t : JSON.stringify(t);
		}
		return t;
	},
	fromAttribute(t, s) {
		let i = t;
		switch (s) {
			case Boolean:
				i = null !== t;
				break;
			case Number:
				i = null === t ? null : Number(t);
				break;
			case Object:
			case Array: try {
				i = JSON.parse(t);
			} catch (t) {
				i = null;
			}
		}
		return i;
	}
}, f$1 = (t, s) => !i$2(t, s), b$1 = {
	attribute: !0,
	type: String,
	converter: u$1,
	reflect: !1,
	useDefault: !1,
	hasChanged: f$1
};
Symbol.metadata ??= Symbol("metadata"), a$1.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y$1 = class extends HTMLElement {
	static addInitializer(t) {
		this._$Ei(), (this.l ??= []).push(t);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(t, s = b$1) {
		if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
			const i = Symbol(), h = this.getPropertyDescriptor(t, i, s);
			void 0 !== h && e$1(this.prototype, t, h);
		}
	}
	static getPropertyDescriptor(t, s, i) {
		const { get: e, set: r } = h$1(this.prototype, t) ?? {
			get() {
				return this[s];
			},
			set(t) {
				this[s] = t;
			}
		};
		return {
			get: e,
			set(s) {
				const h = e?.call(this);
				r?.call(this, s), this.requestUpdate(t, h, i);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(t) {
		return this.elementProperties.get(t) ?? b$1;
	}
	static _$Ei() {
		if (this.hasOwnProperty(d$1("elementProperties"))) return;
		const t = n$1(this);
		t.finalize(), void 0 !== t.l && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(d$1("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
			const t = this.properties, s = [...r$1(t), ...o$2(t)];
			for (const i of s) this.createProperty(i, t[i]);
		}
		const t = this[Symbol.metadata];
		if (null !== t) {
			const s = litPropertyMetadata.get(t);
			if (void 0 !== s) for (const [t, i] of s) this.elementProperties.set(t, i);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (const [t, s] of this.elementProperties) {
			const i = this._$Eu(t, s);
			void 0 !== i && this._$Eh.set(i, t);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(s) {
		const i = [];
		if (Array.isArray(s)) {
			const e = new Set(s.flat(1 / 0).reverse());
			for (const s of e) i.unshift(c$2(s));
		} else void 0 !== s && i.push(c$2(s));
		return i;
	}
	static _$Eu(t, s) {
		const i = s.attribute;
		return !1 === i ? void 0 : "string" == typeof i ? i : "string" == typeof t ? t.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
	}
	addController(t) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(t), void 0 !== this.renderRoot && this.isConnected && t.hostConnected?.();
	}
	removeController(t) {
		this._$EO?.delete(t);
	}
	_$E_() {
		const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
		for (const i of s.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
		t.size > 0 && (this._$Ep = t);
	}
	createRenderRoot() {
		const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return S$1(t, this.constructor.elementStyles), t;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
	}
	enableUpdating(t) {}
	disconnectedCallback() {
		this._$EO?.forEach((t) => t.hostDisconnected?.());
	}
	attributeChangedCallback(t, s, i) {
		this._$AK(t, i);
	}
	_$ET(t, s) {
		const i = this.constructor.elementProperties.get(t), e = this.constructor._$Eu(t, i);
		if (void 0 !== e && !0 === i.reflect) {
			const h = (void 0 !== i.converter?.toAttribute ? i.converter : u$1).toAttribute(s, i.type);
			this._$Em = t, null == h ? this.removeAttribute(e) : this.setAttribute(e, h), this._$Em = null;
		}
	}
	_$AK(t, s) {
		const i = this.constructor, e = i._$Eh.get(t);
		if (void 0 !== e && this._$Em !== e) {
			const t = i.getPropertyOptions(e), h = "function" == typeof t.converter ? { fromAttribute: t.converter } : void 0 !== t.converter?.fromAttribute ? t.converter : u$1;
			this._$Em = e;
			const r = h.fromAttribute(s, t.type);
			this[e] = r ?? this._$Ej?.get(e) ?? r, this._$Em = null;
		}
	}
	requestUpdate(t, s, i, e = !1, h) {
		if (void 0 !== t) {
			const r = this.constructor;
			if (!1 === e && (h = this[t]), i ??= r.getPropertyOptions(t), !((i.hasChanged ?? f$1)(h, s) || i.useDefault && i.reflect && h === this._$Ej?.get(t) && !this.hasAttribute(r._$Eu(t, i)))) return;
			this.C(t, s, i);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(t, s, { useDefault: i, reflect: e, wrapped: h }, r) {
		i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, r ?? s ?? this[t]), !0 !== h || void 0 !== r) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), !0 === e && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (t) {
			Promise.reject(t);
		}
		const t = this.scheduleUpdate();
		return null != t && await t, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (const [t, s] of this._$Ep) this[t] = s;
				this._$Ep = void 0;
			}
			const t = this.constructor.elementProperties;
			if (t.size > 0) for (const [s, i] of t) {
				const { wrapped: t } = i, e = this[s];
				!0 !== t || this._$AL.has(s) || void 0 === e || this.C(s, void 0, i, e);
			}
		}
		let t = !1;
		const s = this._$AL;
		try {
			t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((t) => t.hostUpdate?.()), this.update(s)) : this._$EM();
		} catch (s) {
			throw t = !1, this._$EM(), s;
		}
		t && this._$AE(s);
	}
	willUpdate(t) {}
	_$AE(t) {
		this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(t) {
		return !0;
	}
	update(t) {
		this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
	}
	updated(t) {}
	firstUpdated(t) {}
};
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1?.({ ReactiveElement: y$1 }), (a$1.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var t = globalThis;
var i$1 = (t) => t;
var s$1 = t.trustedTypes;
var e = s$1 ? s$1.createPolicy("lit-html", { createHTML: (t) => t }) : void 0;
var h = "$lit$";
var o$1 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n = "?" + o$1;
var r = `<${n}>`;
var l = document;
var c = () => l.createComment("");
var a = (t) => null === t || "object" != typeof t && "function" != typeof t;
var u = Array.isArray;
var d = (t) => u(t) || "function" == typeof t?.[Symbol.iterator];
var f = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y = /^(?:script|style|textarea|title)$/i;
var x = (t) => (i, ...s) => ({
	_$litType$: t,
	strings: i,
	values: s
});
var b = x(1);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l.createTreeWalker(l, 129);
function V(t, i) {
	if (!u(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return void 0 !== e ? e.createHTML(i) : i;
}
var N = (t, i) => {
	const s = t.length - 1, e = [];
	let n, l = 2 === i ? "<svg>" : 3 === i ? "<math>" : "", c = v;
	for (let i = 0; i < s; i++) {
		const s = t[i];
		let a, u, d = -1, f = 0;
		for (; f < s.length && (c.lastIndex = f, u = c.exec(s), null !== u);) f = c.lastIndex, c === v ? "!--" === u[1] ? c = _ : void 0 !== u[1] ? c = m : void 0 !== u[2] ? (y.test(u[2]) && (n = RegExp("</" + u[2], "g")), c = p) : void 0 !== u[3] && (c = p) : c === p ? ">" === u[0] ? (c = n ?? v, d = -1) : void 0 === u[1] ? d = -2 : (d = c.lastIndex - u[2].length, a = u[1], c = void 0 === u[3] ? p : "\"" === u[3] ? $ : g) : c === $ || c === g ? c = p : c === _ || c === m ? c = v : (c = p, n = void 0);
		const x = c === p && t[i + 1].startsWith("/>") ? " " : "";
		l += c === v ? s + r : d >= 0 ? (e.push(a), s.slice(0, d) + h + s.slice(d) + o$1 + x) : s + o$1 + (-2 === d ? i : x);
	}
	return [V(t, l + (t[s] || "<?>") + (2 === i ? "</svg>" : 3 === i ? "</math>" : "")), e];
};
var S = class S {
	constructor({ strings: t, _$litType$: i }, e) {
		let r;
		this.parts = [];
		let l = 0, a = 0;
		const u = t.length - 1, d = this.parts, [f, v] = N(t, i);
		if (this.el = S.createElement(f, e), P.currentNode = this.el.content, 2 === i || 3 === i) {
			const t = this.el.content.firstChild;
			t.replaceWith(...t.childNodes);
		}
		for (; null !== (r = P.nextNode()) && d.length < u;) {
			if (1 === r.nodeType) {
				if (r.hasAttributes()) for (const t of r.getAttributeNames()) if (t.endsWith(h)) {
					const i = v[a++], s = r.getAttribute(t).split(o$1), e = /([.?@])?(.*)/.exec(i);
					d.push({
						type: 1,
						index: l,
						name: e[2],
						strings: s,
						ctor: "." === e[1] ? I : "?" === e[1] ? L : "@" === e[1] ? z : H
					}), r.removeAttribute(t);
				} else t.startsWith(o$1) && (d.push({
					type: 6,
					index: l
				}), r.removeAttribute(t));
				if (y.test(r.tagName)) {
					const t = r.textContent.split(o$1), i = t.length - 1;
					if (i > 0) {
						r.textContent = s$1 ? s$1.emptyScript : "";
						for (let s = 0; s < i; s++) r.append(t[s], c()), P.nextNode(), d.push({
							type: 2,
							index: ++l
						});
						r.append(t[i], c());
					}
				}
			} else if (8 === r.nodeType) if (r.data === n) d.push({
				type: 2,
				index: l
			});
			else {
				let t = -1;
				for (; -1 !== (t = r.data.indexOf(o$1, t + 1));) d.push({
					type: 7,
					index: l
				}), t += o$1.length - 1;
			}
			l++;
		}
	}
	static createElement(t, i) {
		const s = l.createElement("template");
		return s.innerHTML = t, s;
	}
};
function M(t, i, s = t, e) {
	if (i === E) return i;
	let h = void 0 !== e ? s._$Co?.[e] : s._$Cl;
	const o = a(i) ? void 0 : i._$litDirective$;
	return h?.constructor !== o && (h?._$AO?.(!1), void 0 === o ? h = void 0 : (h = new o(t), h._$AT(t, s, e)), void 0 !== e ? (s._$Co ??= [])[e] = h : s._$Cl = h), void 0 !== h && (i = M(t, h._$AS(t, i.values), h, e)), i;
}
var R = class {
	constructor(t, i) {
		this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(t) {
		const { el: { content: i }, parts: s } = this._$AD, e = (t?.creationScope ?? l).importNode(i, !0);
		P.currentNode = e;
		let h = P.nextNode(), o = 0, n = 0, r = s[0];
		for (; void 0 !== r;) {
			if (o === r.index) {
				let i;
				2 === r.type ? i = new k(h, h.nextSibling, this, t) : 1 === r.type ? i = new r.ctor(h, r.name, r.strings, this, t) : 6 === r.type && (i = new Z(h, this, t)), this._$AV.push(i), r = s[++n];
			}
			o !== r?.index && (h = P.nextNode(), o++);
		}
		return P.currentNode = l, e;
	}
	p(t) {
		let i = 0;
		for (const s of this._$AV) void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
	}
};
var k = class k {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(t, i, s, e) {
		this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = e, this._$Cv = e?.isConnected ?? !0;
	}
	get parentNode() {
		let t = this._$AA.parentNode;
		const i = this._$AM;
		return void 0 !== i && 11 === t?.nodeType && (t = i.parentNode), t;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(t, i = this) {
		t = M(this, t, i), a(t) ? t === A || null == t || "" === t ? (this._$AH !== A && this._$AR(), this._$AH = A) : t !== this._$AH && t !== E && this._(t) : void 0 !== t._$litType$ ? this.$(t) : void 0 !== t.nodeType ? this.T(t) : d(t) ? this.k(t) : this._(t);
	}
	O(t) {
		return this._$AA.parentNode.insertBefore(t, this._$AB);
	}
	T(t) {
		this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
	}
	_(t) {
		this._$AH !== A && a(this._$AH) ? this._$AA.nextSibling.data = t : this.T(l.createTextNode(t)), this._$AH = t;
	}
	$(t) {
		const { values: i, _$litType$: s } = t, e = "number" == typeof s ? this._$AC(t) : (void 0 === s.el && (s.el = S.createElement(V(s.h, s.h[0]), this.options)), s);
		if (this._$AH?._$AD === e) this._$AH.p(i);
		else {
			const t = new R(e, this), s = t.u(this.options);
			t.p(i), this.T(s), this._$AH = t;
		}
	}
	_$AC(t) {
		let i = C.get(t.strings);
		return void 0 === i && C.set(t.strings, i = new S(t)), i;
	}
	k(t) {
		u(this._$AH) || (this._$AH = [], this._$AR());
		const i = this._$AH;
		let s, e = 0;
		for (const h of t) e === i.length ? i.push(s = new k(this.O(c()), this.O(c()), this, this.options)) : s = i[e], s._$AI(h), e++;
		e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
	}
	_$AR(t = this._$AA.nextSibling, s) {
		for (this._$AP?.(!1, !0, s); t !== this._$AB;) {
			const s = i$1(t).nextSibling;
			i$1(t).remove(), t = s;
		}
	}
	setConnected(t) {
		void 0 === this._$AM && (this._$Cv = t, this._$AP?.(t));
	}
};
var H = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(t, i, s, e, h) {
		this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t, this.name = i, this._$AM = e, this.options = h, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(/* @__PURE__ */ new String()), this.strings = s) : this._$AH = A;
	}
	_$AI(t, i = this, s, e) {
		const h = this.strings;
		let o = !1;
		if (void 0 === h) t = M(this, t, i, 0), o = !a(t) || t !== this._$AH && t !== E, o && (this._$AH = t);
		else {
			const e = t;
			let n, r;
			for (t = h[0], n = 0; n < h.length - 1; n++) r = M(this, e[s + n], i, n), r === E && (r = this._$AH[n]), o ||= !a(r) || r !== this._$AH[n], r === A ? t = A : t !== A && (t += (r ?? "") + h[n + 1]), this._$AH[n] = r;
		}
		o && !e && this.j(t);
	}
	j(t) {
		t === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
	}
};
var I = class extends H {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(t) {
		this.element[this.name] = t === A ? void 0 : t;
	}
};
var L = class extends H {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(t) {
		this.element.toggleAttribute(this.name, !!t && t !== A);
	}
};
var z = class extends H {
	constructor(t, i, s, e, h) {
		super(t, i, s, e, h), this.type = 5;
	}
	_$AI(t, i = this) {
		if ((t = M(this, t, i, 0) ?? A) === E) return;
		const s = this._$AH, e = t === A && s !== A || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, h = t !== A && (s === A || e);
		e && this.element.removeEventListener(this.name, this, s), h && this.element.addEventListener(this.name, this, t), this._$AH = t;
	}
	handleEvent(t) {
		"function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
	}
};
var Z = class {
	constructor(t, i, s) {
		this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(t) {
		M(this, t);
	}
};
var B = t.litHtmlPolyfillSupport;
B?.(S, k), (t.litHtmlVersions ??= []).push("3.3.3");
var D = (t, i, s) => {
	const e = s?.renderBefore ?? i;
	let h = e._$litPart$;
	if (void 0 === h) {
		const t = s?.renderBefore ?? null;
		e._$litPart$ = h = new k(i.insertBefore(c(), t), t, void 0, s ?? {});
	}
	return h._$AI(t), h;
};
// node_modules/lit-element/lit-element.js
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/ var s = globalThis;
var i = class extends y$1 {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		const t = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= t.firstChild, t;
	}
	update(t) {
		const r = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = D(r, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return E;
	}
};
i._$litElement$ = !0, i["finalized"] = !0, s.litElementHydrateSupport?.({ LitElement: i });
var o = s.litElementPolyfillSupport;
o?.({ LitElement: i });
(s.litElementVersions ??= []).push("4.2.2");
// src/discovery.ts
var PLATFORM = "heating_controller";
var CONTROLLER_ENTITIES = {
	"sensor:boiler": "boiler",
	"sensor:load": "load",
	"sensor:modulation": "output",
	"sensor:base": "base",
	"sensor:proportional": "proportional",
	"sensor:integral": "integral",
	"sensor:starts_last_hour": "starts",
	"sensor:run_time": "runTime",
	"sensor:lockout_until": "lockoutUntil",
	"switch:pause": "pause",
	"button:clear_lockout": "clearLockout"
};
var ROOM_ENTITIES = {
	"sensor:room_status": "status",
	"sensor:room_load": "load",
	"sensor:room_error": "error",
	"binary_sensor:valve_open": "valveOpen",
	"binary_sensor:overheating": "overheating"
};
var BOILER_KEY = "sensor:boiler";
var STATUS_KEY = "sensor:room_status";
/** Registry key for an entity: its domain and its translation key, e.g. `sensor:boiler`. */
function registryKey(entityId, translationKey) {
	return `${entityId.split(".")[0]}:${translationKey}`;
}
/** Device id → registry key → entity id, for every entity of the integration. */
function groupByDevice(hass) {
	const devices = /* @__PURE__ */ new Map();
	for (const entry of Object.values(hass.entities ?? {})) {
		if (entry.platform !== "heating_controller" || !entry.device_id || !entry.translation_key) continue;
		const key = registryKey(entry.entity_id, entry.translation_key);
		const entities = devices.get(entry.device_id) ?? /* @__PURE__ */ new Map();
		entities.set(key, entry.entity_id);
		devices.set(entry.device_id, entities);
	}
	return devices;
}
function deviceName(hass, deviceId, fallback) {
	const device = hass.devices?.[deviceId];
	const own = device?.name_by_user ?? device?.name;
	if (own) return own;
	const areaId = device?.area_id;
	return (areaId ? hass.areas?.[areaId]?.name : void 0) ?? fallback;
}
function pick(entities, map) {
	const picked = {};
	for (const [key, field] of Object.entries(map)) {
		const entityId = entities.get(key);
		if (entityId !== void 0) picked[field] = entityId;
	}
	return picked;
}
/**
* The controller the card shows, or `undefined` when the integration is not set up.
*
* With `config.controller` set, that device is used; otherwise the first controller device in
* registry order. A configured id that is not a controller falls back to the first one.
*/
function discover(hass, config = {}) {
	const devices = groupByDevice(hass);
	const controllerIds = [...devices.keys()].filter((id) => devices.get(id)?.has(BOILER_KEY)).sort((a, b) => a.localeCompare(b));
	const configured = config.controller;
	const controllerId = configured !== void 0 && controllerIds.includes(configured) ? configured : controllerIds[0];
	if (controllerId === void 0) return;
	const rooms = [...devices.entries()].filter(([id, entities]) => id !== controllerId && entities.has(STATUS_KEY)).map(([id, entities]) => {
		return {
			id,
			name: deviceName(hass, id, "Room"),
			entities: pick(entities, ROOM_ENTITIES)
		};
	}).sort((a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "base" }));
	return {
		id: controllerId,
		name: deviceName(hass, controllerId, "Heating"),
		entities: pick(devices.get(controllerId) ?? /* @__PURE__ */ new Map(), CONTROLLER_ENTITIES),
		rooms
	};
}
// src/format.ts
var MISSING = /* @__PURE__ */ new Set([
	"",
	"unavailable",
	"unknown"
]);
/** The state object of an entity, if it exists. */
function stateOf(hass, entityId) {
	return entityId === void 0 ? void 0 : hass.states[entityId];
}
/** A numeric state, or `undefined` when the entity is missing, unavailable or not a number. */
function numberOf(hass, entityId) {
	const state = stateOf(hass, entityId)?.state;
	if (state === void 0 || MISSING.has(state)) return;
	const value = Number(state);
	return Number.isFinite(value) ? value : void 0;
}
/** A numeric attribute, with the same guard against missing values. */
function attributeNumber(hass, entityId, attribute) {
	const value = stateOf(hass, entityId)?.attributes[attribute];
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
/**
* What Home Assistant shows for a state: the integration's translated label for an enum, or the
* raw state when the frontend has no formatter (an older frontend, or a test).
*/
function labelOf(hass, stateObj) {
	if (stateObj === void 0) return "";
	try {
		return hass.formatEntityState?.(stateObj) ?? stateObj.state;
	} catch {
		return stateObj.state;
	}
}
/** A number with a fixed number of decimals; empty when the value is missing. */
function formatNumber(value, digits = 1) {
	return value === void 0 ? "" : value.toFixed(digits);
}
/** Minutes as a short duration, for the run time. */
function formatMinutes(value) {
	return value === void 0 ? "" : `${Math.round(value)} min`;
}
/** An ISO timestamp as a time of day, in the user's locale. */
function formatTime(iso) {
	if (iso === void 0) return "";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	});
}
// src/icons.ts
/**
* The icons the card draws, as path data.
*
* Home Assistant does not load `ha-icon` for custom cards reliably, and pulling the icon font
* would add a request, so the few paths the card needs are kept here. They are Material Design
* Icons (Apache 2.0), the set Home Assistant uses.
*/
var ICONS = {
	radiator: "M7.95,3L6.53,5.19L7.95,7.4H7.94L5.95,10.5L4.22,9.6L5.64,7.39L4.22,5.19L6.22,2.09L7.95,3M13.95,2.89L12.53,5.1L13.95,7.3L13.94,7.31L11.95,10.4L10.22,9.5L11.64,7.3L10.22,5.1L12.22,2L13.95,2.89M20,2.89L18.56,5.1L20,7.3V7.31L18,10.4L16.25,9.5L17.67,7.3L16.25,5.1L18.25,2L20,2.89M2,22V14A2,2 0 0,1 4,12H20A2,2 0 0,1 22,14V22H20V20H4V22H2M6,14A1,1 0 0,0 5,15V17A1,1 0 0,0 6,18A1,1 0 0,0 7,17V15A1,1 0 0,0 6,14M10,14A1,1 0 0,0 9,15V17A1,1 0 0,0 10,18A1,1 0 0,0 11,17V15A1,1 0 0,0 10,14M14,14A1,1 0 0,0 13,15V17A1,1 0 0,0 14,18A1,1 0 0,0 15,17V15A1,1 0 0,0 14,14M18,14A1,1 0 0,0 17,15V17A1,1 0 0,0 18,18A1,1 0 0,0 19,17V15A1,1 0 0,0 18,14Z",
	"radiator-off": "M3.28,2L2,3.27L4.77,6.04L5.64,7.39L4.22,9.6L5.95,10.5L7.23,8.5L10.73,12H4A2,2 0 0,0 2,14V22H4V20H18.73L20,21.27V22H22V20.73L22,20.72V20.72L3.28,2M7,17A1,1 0 0,1 6,18A1,1 0 0,1 5,17V15A1,1 0 0,1 6,14A1,1 0 0,1 7,15V17M11,17A1,1 0 0,1 10,18A1,1 0 0,1 9,17V15A1,1 0 0,1 10,14A1,1 0 0,1 11,15V17M15,17A1,1 0 0,1 14,18A1,1 0 0,1 13,17V15C13,14.79 13.08,14.61 13.18,14.45L15,16.27V17M16.25,9.5L17.67,7.3L16.25,5.1L18.25,2L20,2.89L18.56,5.1L20,7.3V7.31L18,10.4L16.25,9.5M22,14V18.18L19,15.18V15A1,1 0 0,0 18,14C17.95,14 17.9,14 17.85,14.03L15.82,12H20C21.11,12 22,12.9 22,14Z",
	"valve-closed": "M22,2V22H20V13H14.82A3,3 0 0,1 9.18,13H4V22H2V2H4V11H9.18A3,3 0 0,1 14.82,11H20V2Z",
	"window-open": "M6,8H10V6H14V8H18V4H6V8M18,10H6V15H18V10M6,20H18V17H6V20M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2Z",
	"check-circle": "M12,2C6.5,2 2,6.5 2,12S6.5,22 12,22S22,17.5 22,12S17.5,2 12,2M10,17L5,12L6.41,10.59L10,14.17L17.59,6.58L19,8L10,17Z",
	"alert-circle": "M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
	"help-circle": "M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z",
	power: "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",
	"timer-sand": "M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5M10,6H14V6.75L12,8.75L10,6.75V6Z",
	lock: "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z",
	"lock-open": "M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z",
	pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
	"play-circle": "M10,16.5V7.5L16,12M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
	"wifi-off": "M2.28,3L1,4.27L2.47,5.74C2.04,6 1.61,6.29 1.2,6.6L3,9C3.53,8.6 4.08,8.25 4.66,7.93L6.89,10.16C6.15,10.5 5.44,10.91 4.8,11.4L6.6,13.8C7.38,13.22 8.26,12.77 9.2,12.47L11.75,15C10.5,15.07 9.34,15.5 8.4,16.2L12,21L14.46,17.73L17.74,21L19,19.72M12,3C9.85,3 7.8,3.38 5.9,4.07L8.29,6.47C9.5,6.16 10.72,6 12,6C15.38,6 18.5,7.11 21,9L22.8,6.6C19.79,4.34 16.06,3 12,3M12,9C11.62,9 11.25,9 10.88,9.05L14.07,12.25C15.29,12.53 16.43,13.07 17.4,13.8L19.2,11.4C17.2,9.89 14.7,9 12,9Z",
	wrench: "M22.7,19L13.6,9.9C14.5,7.6 14,4.9 12.1,3C10.1,1 7.1,0.6 4.7,1.7L9,6L6,9L1.6,4.7C0.4,7.1 0.9,10.1 2.9,12.1C4.8,14 7.5,14.5 9.8,13.6L18.9,22.7C19.3,23.1 19.9,23.1 20.3,22.7L22.6,20.4C23.1,20 23.1,19.3 22.7,19Z",
	sync: "M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z",
	"chevron-right": "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",
	alert: "M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z",
	"clock-outline": "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
};
/** The path data for an icon name; an unknown name draws the alert icon. */
function iconPath(name) {
	return ICONS[name] ?? ICONS["alert"] ?? "";
}
// src/view.ts
/** Statuses that need a human; a window left open or a thermostat turned off are not. */
var PROBLEM_STATUSES = /* @__PURE__ */ new Set([
	"blocked",
	"valve_unhealthy",
	"valve_data_missing",
	"wall_invalid",
	"thermostat_invalid"
]);
function reasonOf(hass, controller) {
	const stateObj = stateOf(hass, controller.entities.boiler);
	const code = stateObj?.attributes["reason"];
	const message = stateObj?.attributes["message"];
	if (typeof code !== "string" || typeof message !== "string") return;
	return {
		code,
		message
	};
}
function boilerOf(hass, controller) {
	const entities = controller.entities;
	const stateObj = stateOf(hass, entities.boiler);
	const state = stateObj?.state ?? "unavailable";
	const reason = reasonOf(hass, controller);
	const lockoutUntil = stateOf(hass, entities.lockoutUntil)?.state;
	return {
		state,
		label: labelOf(hass, stateObj),
		heating: state === "on",
		paused: state === "paused",
		...reason === void 0 ? {} : { reason },
		load: numberOf(hass, entities.load),
		startLoad: attributeNumber(hass, entities.load, "start_load_m2k"),
		stopLoad: attributeNumber(hass, entities.load, "stop_load_m2k"),
		output: numberOf(hass, entities.output),
		base: numberOf(hass, entities.base),
		proportional: numberOf(hass, entities.proportional),
		integral: numberOf(hass, entities.integral),
		starts: numberOf(hass, entities.starts),
		runMinutes: numberOf(hass, entities.runTime),
		...lockoutUntil === void 0 || lockoutUntil === "unknown" ? {} : { lockoutUntil }
	};
}
function roomOf(hass, room) {
	const statusId = room.entities.status;
	const statusObj = stateOf(hass, statusId);
	const share = numberOf(hass, room.entities.load);
	const errorK = numberOf(hass, room.entities.error);
	const current = attributeNumber(hass, statusId, "current_temperature");
	const target = attributeNumber(hass, statusId, "target_temperature");
	const valvePosition = attributeNumber(hass, statusId, "valve_position");
	const status = statusObj?.state;
	const overheating = stateOf(hass, room.entities.overheating)?.state === "on";
	return {
		id: room.id,
		name: room.name,
		...status === void 0 ? {} : { status },
		label: labelOf(hass, statusObj),
		share,
		errorK,
		current,
		target,
		valvePosition,
		valveOpen: stateOf(hass, room.entities.valveOpen)?.state === "on",
		overheating,
		problem: status !== void 0 && PROBLEM_STATUSES.has(status)
	};
}
/** The controller as the card shows it, or `undefined` when the integration is not set up. */
function buildView(hass, config) {
	const controller = discover(hass, config);
	if (controller === void 0) return;
	const boiler = boilerOf(hass, controller);
	const rooms = controller.rooms.map((room) => roomOf(hass, room));
	const problems = [];
	if (boiler.state === "unavailable") problems.push({
		id: `${controller.id}:boiler`,
		title: "Boiler unavailable"
	});
	for (const room of rooms) {
		if (room.problem) problems.push({
			id: room.id,
			title: `${room.name}: ${room.label}`
		});
		if (room.overheating) problems.push({
			id: `${room.id}:overheating`,
			title: `${room.name}: Overheating`
		});
	}
	return {
		title: controller.name,
		boiler,
		rooms,
		problems,
		entities: controller.entities
	};
}
// src/card.ts
/**
* The card: one controller, its reason, its load and output, its rooms, its problems, and the two
* controls the integration offers.
*
* It renders from the entity states only. Anything the entities do not carry is left out; the card
* never guesses and never throws because something is missing.
*/
var COLORS = {
	grey: "--rgb-grey-color",
	orange: "--rgb-orange-color",
	amber: "--rgb-amber-color",
	green: "--rgb-green-color",
	red: "--rgb-red-color",
	blue: "--rgb-blue-color",
	purple: "--rgb-purple-color",
	teal: "--rgb-teal-color",
	primary: "--rgb-primary-color"
};
/** A theme colour as a CSS value. */
var color = (name) => `var(${COLORS[name]})`;
var ROOM_STATUS = {
	served: {
		icon: "radiator",
		color: "orange"
	},
	waiting_for_valve: {
		icon: "timer-sand",
		color: "amber"
	},
	satisfied: {
		icon: "check-circle",
		color: "green"
	},
	blocked: {
		icon: "valve-closed",
		color: "red"
	},
	window_open: {
		icon: "window-open",
		color: "blue"
	},
	thermostat_off: {
		icon: "power",
		color: "grey"
	},
	wall_invalid: {
		icon: "alert-circle",
		color: "red"
	},
	thermostat_invalid: {
		icon: "alert-circle",
		color: "red"
	},
	valve_data_missing: {
		icon: "help-circle",
		color: "red"
	},
	valve_unhealthy: {
		icon: "wrench",
		color: "red"
	}
};
var BOILER_STATE = {
	on: {
		icon: "radiator",
		color: "orange"
	},
	off: {
		icon: "radiator-off",
		color: "grey"
	},
	locked_out: {
		icon: "lock",
		color: "red"
	},
	paused: {
		icon: "pause",
		color: "blue"
	},
	unavailable: {
		icon: "wifi-off",
		color: "grey"
	}
};
/** How urgent a reason reads: starts green, running orange, waiting grey, trouble red. */
var REASON_COLORS = {
	start_load: "green",
	start_starvation: "green",
	running_load: "orange",
	running_min_on: "orange",
	waiting_load: "grey",
	idle: "grey",
	stop_load: "grey",
	external_stop: "grey",
	all_rooms_excluded: "grey",
	min_off: "amber",
	start_limit: "amber",
	snapshot_incomplete: "amber",
	snapshot_old: "amber",
	no_open_valve: "amber",
	paused: "blue",
	lockout: "red",
	max_run: "red",
	no_progress: "red",
	boiler_unavailable: "red"
};
var icon = (name) => b`<svg viewBox="0 0 24 24" aria-hidden="true"><path d=${iconPath(name)}></path></svg>`;
var shape = (name, tone, small = false) => b`<div class="shape ${small ? "small" : ""}" style="--c: ${color(tone)}">${icon(name)}</div>`;
var HeatingControllerCard = class extends i {
	constructor(..._args) {
		super(..._args);
		this._togglePause = () => {
			const view = this._view;
			if (view?.entities.pause === void 0) return;
			this.hass.callService("switch", view.boiler.paused ? "turn_off" : "turn_on", {}, { entity_id: view.entities.pause });
		};
		this._clearLockout = () => {
			const view = this._view;
			if (view?.entities.clearLockout === void 0) return;
			this.hass.callService("button", "press", {}, { entity_id: view.entities.clearLockout });
		};
	}
	static {
		this.properties = {
			hass: { attribute: false },
			config: { attribute: false }
		};
	}
	static {
		this.styles = i$3`
    :host {
      display: block;
      /* The card owns its text colour: a shadow root does not inherit the page's ha-card styles. */
      color: var(--primary-text-color);
    }

    ha-card {
      padding: 12px;
      font-size: 14px;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
    }

    .content {
      container-type: inline-size;
    }

    .shape {
      flex: none;
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(var(--c), 0.16);
      color: rgb(var(--c));
    }

    .shape svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }

    .shape.small {
      width: 34px;
      height: 34px;
    }

    .shape.small svg {
      width: 18px;
      height: 18px;
    }

    .head {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .head-main {
      flex: 1 1 auto;
      min-width: 0;
    }

    .title {
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: 0.1px;
    }

    .subtitle {
      margin-top: 2px;
      font-size: 0.82rem;
      color: var(--secondary-text-color);
    }

    .head-end {
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .hero {
      display: flex;
      align-items: baseline;
      gap: 2px;
      font-variant-numeric: tabular-nums;
    }

    .hero b {
      font-size: 1.5rem;
      font-weight: 500;
      line-height: 1;
    }

    .hero small {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      background: rgba(var(--c), 0.14);
      color: rgb(var(--c));
    }

    .chip svg {
      width: 15px;
      height: 15px;
      fill: currentColor;
    }

    .reason {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(var(--c), 0.09);
      box-shadow: inset 3px 0 0 rgba(var(--c), 0.9);
    }

    .reason-text {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 0.86rem;
      line-height: 1.35;
    }

    .reason-code {
      flex: none;
      padding: 4px 6px;
      border-radius: 6px;
      background: rgba(var(--c), 0.16);
      color: rgb(var(--c));
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.6rem;
      font-weight: 500;
      line-height: 1;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .section {
      margin-top: 18px;
    }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .section-title {
      font-size: 0.66rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }

    .section-note {
      font-size: 0.72rem;
      color: var(--secondary-text-color);
    }

    .metric {
      display: flow-root;
    }

    .metric + .metric {
      margin-top: 12px;
    }

    .metric-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 7px;
    }

    .metric-label {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }

    .metric-value {
      font-size: 0.95rem;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    .metric-value small {
      margin-left: 3px;
      font-size: 0.72rem;
      font-weight: 400;
      color: var(--secondary-text-color);
    }

    .bar {
      position: relative;
      height: 10px;
      margin-bottom: 20px;
      border-radius: 5px;
      background: rgba(var(--rgb-grey-color), 0.18);
    }

    .bar-fill {
      position: absolute;
      inset: 0 auto 0 0;
      border-radius: 5px;
      transition: width 0.35s ease;
    }

    .bar-fill.high {
      background: rgb(var(--rgb-orange-color));
    }

    .bar-fill.low {
      background: rgb(var(--rgb-amber-color));
    }

    .bar-fill.none {
      background: rgba(var(--rgb-grey-color), 0.55);
    }

    .tick {
      position: absolute;
      top: -4px;
      bottom: -4px;
      width: 2px;
      border-radius: 2px;
      background: rgba(var(--rgb-grey-color), 0.55);
    }

    .tick-label {
      position: absolute;
      top: 14px;
      font-size: 0.62rem;
      color: var(--secondary-text-color);
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }

    .output-stack {
      display: flex;
      height: 8px;
      overflow: hidden;
      border-radius: 4px;
      background: rgba(var(--rgb-grey-color), 0.16);
    }

    .output-stack i {
      height: 100%;
    }

    .output-empty {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }

    .output-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      margin-top: 8px;
      font-size: 0.7rem;
      color: var(--secondary-text-color);
    }

    .output-legend span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .output-legend b {
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .swatch {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      background: var(--d);
    }

    .rooms {
      display: flex;
      flex-direction: column;
    }

    .room {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      padding: 6px 0;
    }

    .room + .room {
      border-top: 1px solid var(--divider-color);
    }

    .room-body {
      flex: 1 1 auto;
      min-width: 0;
    }

    .room-line {
      display: flex;
      align-items: baseline;
      gap: 8px;
      min-width: 0;
    }

    .room-name {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      font-size: 0.88rem;
      font-weight: 500;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .room-valve {
      flex: none;
      font-size: 0.8rem;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color);
    }

    .room-valve.open {
      color: rgb(var(--rgb-orange-color));
    }

    .room-sub {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-top: 1px;
      min-width: 0;
      font-size: 0.76rem;
      color: var(--secondary-text-color);
    }

    .room-status {
      flex: none;
      color: rgb(var(--c));
    }

    .room-temps {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
    }

    .room-share {
      flex: none;
      font-size: 0.7rem;
      font-variant-numeric: tabular-nums;
    }

    .room-tag {
      flex: none;
      padding: 1px 5px;
      border-radius: 4px;
      background: rgba(var(--rgb-purple-color), 0.14);
      color: rgb(var(--rgb-purple-color));
      font-size: 0.62rem;
      font-weight: 500;
    }

    /* On a wide card the room rows become two columns of quiet tiles. */
    @container (min-width: 560px) {
      .rooms {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 12px;
      }

      .room {
        padding: 8px;
        border-radius: 10px;
        background: var(--secondary-background-color);
      }

      .room + .room {
        border-top: 0;
      }
    }

    .problems {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .problem {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(var(--c), 0.09);
    }

    .problem-body {
      flex: 1 1 auto;
      min-width: 0;
    }

    .problem-title {
      font-size: 0.82rem;
      font-weight: 500;
    }

    .controls {
      display: flex;
      gap: 8px;
      margin-top: 14px;
    }

    .btn {
      flex: 1 1 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 42px;
      padding: 0 12px;
      border: 0;
      border-radius: 10px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      font: 500 0.84rem/1 inherit;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .btn:hover {
      background: rgba(var(--rgb-primary-color), 0.12);
    }

    .btn.is-on {
      background: rgba(var(--rgb-orange-color), 0.18);
      color: rgb(var(--rgb-orange-color));
    }

    .btn:disabled {
      opacity: 0.38;
      cursor: default;
      background: var(--secondary-background-color);
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--divider-color);
      font-size: 0.7rem;
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
    }

    .meta span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .meta svg {
      width: 13px;
      height: 13px;
      fill: currentColor;
      opacity: 0.85;
    }

    .empty {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 10px;
      background: var(--secondary-background-color);
    }

    .empty-title {
      font-size: 0.86rem;
      font-weight: 500;
    }

    .empty-sub {
      margin-top: 2px;
      font-size: 0.75rem;
      color: var(--secondary-text-color);
    }
  `;
	}
	setConfig(config) {
		if (typeof config !== "object" || config === null) throw new Error("Invalid configuration");
		if (config.controller !== void 0 && typeof config.controller !== "string") throw new Error("\"controller\" must be a device id");
		this.config = config;
	}
	/** The card finds the controller itself, so it works without configuration. */
	static getStubConfig() {
		return {};
	}
	static getConfigForm() {
		return {
			schema: [{
				name: "controller",
				selector: { device: { integration: PLATFORM } }
			}],
			computeLabel: (schema) => schema.name === "controller" ? "Controller" : void 0,
			computeHelper: (schema) => schema.name === "controller" ? "Only needed when you run more than one heating controller." : void 0
		};
	}
	getCardSize() {
		return 4 + (this._view?.rooms.length ?? 0);
	}
	getGridOptions() {
		return {
			columns: 6,
			min_columns: 3,
			min_rows: 2
		};
	}
	willUpdate(changed) {
		if (changed.has("hass") || changed.has("config")) this._view = this.hass === void 0 ? void 0 : buildView(this.hass, this.config ?? {});
	}
	render() {
		if (this.hass === void 0) return A;
		const view = this._view;
		if (view === void 0) return b`<ha-card>
        <div class="empty">
          ${shape("alert", "amber")}
          <div>
            <div class="empty-title">Heating Controller not found</div>
            <div class="empty-sub">
              Set the integration up, or point this card at a controller in its settings.
            </div>
          </div>
        </div>
      </ha-card>`;
		return b`<ha-card>
      <div class="content">
        ${this._head(view)} ${this._reason(view)} ${this._boiler(view)} ${this._rooms(view)}
        ${this._problems(view)} ${this._controls(view)} ${this._meta(view)}
      </div>
    </ha-card>`;
	}
	_head(view) {
		const boiler = view.boiler;
		const state = BOILER_STATE[boiler.state] ?? BOILER_STATE["unavailable"];
		const showOutput = boiler.heating && boiler.output !== void 0;
		return b`<div class="head">
      ${shape(state?.icon ?? "radiator-off", state?.color ?? "grey")}
      <div class="head-main">
        <div class="title">${view.title}</div>
        <div class="subtitle">${this._subtitle(view)}</div>
      </div>
      <div class="head-end">
        ${showOutput ? b`<span class="hero"
                ><b>${formatNumber(boiler.output, 0)}</b><small>%</small></span
              >` : b`<span class="chip" style="--c: ${color(state?.color ?? "grey")}"
                >${icon(state?.icon ?? "radiator-off")}${boiler.label}</span
              >`}
      </div>
    </div>`;
	}
	_subtitle(view) {
		const boiler = view.boiler;
		if (boiler.heating) {
			const run = formatMinutes(boiler.runMinutes);
			return run ? `${boiler.label} · ${run}` : boiler.label;
		}
		if (boiler.state === "locked_out") {
			const time = formatTime(boiler.lockoutUntil);
			return time ? `Lockout ends ${time}` : "";
		}
		if (boiler.state === "paused") return "Rooms keep regulating";
		if (boiler.state === "unavailable") return "No connection";
		return "";
	}
	_reason(view) {
		const reason = view.boiler.reason;
		if (reason === void 0) return A;
		return b`<div class="reason" style="--c: ${color(REASON_COLORS[reason.code] ?? "grey")}">
      <div class="reason-text">${reason.message}</div>
      <span class="reason-code">${reason.code}</span>
    </div>`;
	}
	_boiler(view) {
		return b`<div class="section">
      <div class="section-head"><span class="section-title">Boiler</span></div>
      ${this._load(view)} ${this._output(view)}
    </div>`;
	}
	_load(view) {
		const { load, startLoad, stopLoad } = view.boiler;
		if (load === void 0) return b`<div class="metric">
        <div class="metric-head"><span class="metric-label">Load</span></div>
      </div>`;
		const scale = Math.max(8, Math.ceil(load * 1.1));
		const width = Math.min(100, Math.max(0, load / scale * 100));
		const tone = startLoad !== void 0 && load >= startLoad ? "high" : stopLoad !== void 0 && load >= stopLoad ? "low" : "none";
		const position = (value) => Math.min(100, Math.max(0, value / scale * 100));
		const stop = stopLoad === void 0 ? void 0 : position(stopLoad);
		const start = startLoad === void 0 ? void 0 : position(startLoad);
		return b`<div class="metric">
      <div class="metric-head">
        <span class="metric-label">Load</span>
        <span class="metric-value">${formatNumber(load)}<small>m²·K</small></span>
      </div>
      <div class="bar">
        <span class="bar-fill ${tone}" style="width: ${width}%"></span>
        ${stop === void 0 ? A : b`<span class="tick" style="left: ${stop}%"></span>`}
        ${start === void 0 ? A : b`<span class="tick" style="left: ${start}%"></span>`}
        ${this._markLabels(stop, start, stopLoad, startLoad)}
      </div>
    </div>`;
	}
	/**
	* The threshold labels under the load bar. Two marks that sit close together would run over
	* each other, so they share one line.
	*/
	_markLabels(stop, start, stopLoad, startLoad) {
		if (stop === void 0 && start === void 0) return A;
		if (stop !== void 0 && start !== void 0 && start - stop < 20) return b`<span class="tick-label" style="left: ${stop}%; transform: none"
        >Stop ${formatNumber(stopLoad)} · Start ${formatNumber(startLoad)}</span
      >`;
		return b`${stop === void 0 ? A : this._markLabel(stop, `Stop ${formatNumber(stopLoad)}`)}
    ${start === void 0 ? A : this._markLabel(start, `Start ${formatNumber(startLoad)}`)}`;
	}
	_markLabel(position, label) {
		return b`<span class="tick-label" style="left: ${position}%; transform: ${position < 14 ? "none" : position > 86 ? "translateX(-100%)" : "translateX(-50%)"}"
      >${label}</span
    >`;
	}
	_output(view) {
		const { output, base, proportional, integral } = view.boiler;
		if (output === void 0) return b`<div class="metric">
        <div class="metric-head">
          <span class="metric-label">Output</span>
          <span class="output-empty">no demand</span>
        </div>
      </div>`;
		const hasTerms = [
			base,
			proportional,
			integral
		].every((term) => term !== void 0);
		return b`<div class="metric">
      <div class="metric-head">
        <span class="metric-label">Output</span>
        <span class="metric-value">${formatNumber(output, 0)} %</span>
      </div>
      ${hasTerms ? b`<div class="output-stack">
                <i style="flex: ${base}; background: rgb(${color("primary")})"></i>
                <i style="flex: ${proportional}; background: rgb(${color("teal")})"></i>
                <i style="flex: ${integral}; background: rgb(${color("purple")})"></i>
              </div>
              <div class="output-legend">
                <span
                  ><i class="swatch" style="--d: rgb(${color("primary")})"></i>Base
                  <b>${formatNumber(base)}</b></span
                >
                <span
                  ><i class="swatch" style="--d: rgb(${color("teal")})"></i>P
                  <b>+${formatNumber(proportional)}</b></span
                >
                <span
                  ><i class="swatch" style="--d: rgb(${color("purple")})"></i>I
                  <b>+${formatNumber(integral)}</b></span
                >
              </div>` : A}
    </div>`;
	}
	_rooms(view) {
		return b`<div class="section">
      <div class="section-head">
        <span class="section-title">Rooms</span>
        <span class="section-note">${view.rooms.length}</span>
      </div>
      ${view.rooms.length === 0 ? this._noRooms() : b`<div class="rooms">${view.rooms.map((room) => this._room(room))}</div>`}
    </div>`;
	}
	_noRooms() {
		return b`<div class="empty">
      ${shape("radiator-off", "grey", true)}
      <div>
        <div class="empty-title">No rooms configured</div>
        <div class="empty-sub">Add rooms in the integration.</div>
      </div>
    </div>`;
	}
	_room(room) {
		const status = ROOM_STATUS[room.status ?? ""] ?? {
			icon: "help-circle",
			color: "grey"
		};
		const simple = room.status === "window_open" || room.status === "thermostat_off";
		const temps = this._temperatures(room, simple);
		const errorK = !simple && room.errorK !== void 0 && room.errorK > 0 && (room.status === "served" || room.status === "waiting_for_valve" || room.status === "blocked") ? `${formatNumber(room.errorK)} K` : "";
		const valve = this._valve(room);
		const details = [temps, errorK].filter((part) => part !== "").join(" · ");
		return b`<div class="room">
      ${shape(status.icon, status.color, true)}
      <div class="room-body">
        <div class="room-line">
          <span class="room-name">${room.name}</span>
          ${valve === "" ? A : b`<span class="room-valve ${this._valveOpen(room) ? "open" : ""}">${valve}</span>`}
        </div>
        <div class="room-sub">
          <span class="room-status" style="--c: ${color(status.color)}">${room.label}</span>
          ${details === "" ? A : b`<span class="room-temps">${details}</span>`}
          ${room.overheating ? b`<span class="room-tag">Overheating</span>` : A}
          ${room.share === void 0 || room.share === 0 ? A : b`<span class="room-share">${formatNumber(room.share)} m²·K</span>`}
        </div>
      </div>
    </div>`;
	}
	_temperatures(room, simple) {
		if (room.current === void 0) return "";
		const current = `${formatNumber(room.current)} °C`;
		if (simple || room.target === void 0) return current;
		return `${formatNumber(room.current)} → ${formatNumber(room.target)} °C`;
	}
	_valveOpen(room) {
		return room.valvePosition !== void 0 ? room.valvePosition > 0 : room.valveOpen;
	}
	_valve(room) {
		if (room.valvePosition !== void 0) return `${Math.round(room.valvePosition)} %`;
		if (room.valveOpen) return "Open";
		return "";
	}
	_problems(view) {
		if (view.problems.length === 0) return A;
		return b`<div class="section">
      <div class="section-head">
        <span class="section-title">Problems</span>
        <span class="section-note">${view.problems.length}</span>
      </div>
      <div class="problems">
        ${view.problems.map((problem) => b`<div class="problem" style="--c: ${color("red")}">
              ${shape("alert-circle", "red", true)}
              <div class="problem-body">
                <div class="problem-title">${problem.title}</div>
              </div>
            </div>`)}
      </div>
    </div>`;
	}
	_controls(view) {
		const entities = view.entities;
		const paused = view.boiler.paused;
		const canClear = view.boiler.state === "locked_out" && entities.clearLockout !== void 0;
		return b`<div class="controls">
      <button
        type="button"
        class="btn ${paused ? "is-on" : ""}"
        ?disabled=${entities.pause === void 0}
        @click=${this._togglePause}
      >
        ${icon(paused ? "play-circle" : "pause")}${paused ? "Resume" : "Pause"}
      </button>
      <button type="button" class="btn" ?disabled=${!canClear} @click=${this._clearLockout}>
        ${icon("lock-open")}Clear lockout
      </button>
    </div>`;
	}
	_meta(view) {
		const { runMinutes, starts } = view.boiler;
		if (runMinutes === void 0 && starts === void 0) return A;
		return b`<div class="meta">
      ${runMinutes === void 0 ? A : b`<span>${icon("clock-outline")}Run time ${formatMinutes(runMinutes)}</span>`}
      ${starts === void 0 ? A : b`<span>${icon("sync")}${starts} starts/h</span>`}
    </div>`;
	}
};
// src/index.ts
if (customElements.get("heating-controller-card") === void 0) customElements.define("heating-controller-card", HeatingControllerCard);
window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "heating-controller-card")) window.customCards.push({
	type: "heating-controller-card",
	name: "Heating Controller",
	description: "What the heating is doing and why: boiler state with its reason, load, output, rooms and problems.",
	preview: true
});
