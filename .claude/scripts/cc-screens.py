#!/usr/bin/env python3
"""Emit the Cadence case-study screen mockups at the Figma-native 1366x768.

Every screen shares one stage, one type scale and one set of shell chrome, so
the header / sidebar / page-title geometry is written once here instead of
five times in the HTML. Run with --write to splice the output into
public/case-studies/communication-center.html between the
<!--CX:screenNN--> ... <!--/CX:screenNN--> markers.

Figma: file 8vxBGnqMjbRrCBoMEjWDI0, page "Communication Centre".
  screen 01 -> 485:1855  09 LT Contract Review
  screen 02 -> 311:720   5 BO Management (list language)
  screen 03 -> 215:2866  3 Thread Center
  screen 04 -> 215:2866  + composer select opened
  screen 05 -> 282:1028  4 Overlay (drawer language)
"""
import argparse
import pathlib
import re

HTML = pathlib.Path("public/case-studies/communication-center.html")

# ── shell chrome ───────────────────────────────────────────────────────────
NAV = [
    ("Overview",
     '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>'
     '<rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    ("IP Catalog",
     '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
    ("K Hub", '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z"/>'),
    ("My Tickets", '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>'),
    ("Documents", '<rect x="4" y="3" width="16" height="18" rx="2"/>'),
    ("Conversation", '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
]
HEX = ('<svg class="hx" viewBox="0 0 34 34" fill="none"><path d="M17 2.2 L30 9.6 V24.4 L17 31.8 L4 24.4 V9.6 Z"'
       ' fill="currentColor" stroke="currentColor" stroke-width="3.4" stroke-linejoin="round"/></svg>')


def icon(path, w=22):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
            f'stroke-linecap="round" stroke-linejoin="round">{path}</svg>')


def shell(active):
    """Application header (1366x50) + left navigation (88 wide, 72px items)."""
    items = []
    for label, path in NAV:
        if label == active:
            items.append(
                f'      <div class="cx-nav__i on"><span class="cx-nav__hex">{HEX}'
                f'<span class="gl">{icon(path)}</span></span><span>{label}</span></div>')
        else:
            items.append(f'      <div class="cx-nav__i">{icon(path)}<span>{label}</span></div>')
    nav = "\n".join(items)
    return f'''    <div class="cx-hdr">
      <span class="cx-logo">c&#257;dence<sup>&reg;</sup></span>
      <div class="cx-hdr__r">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
    </div>

    <nav class="cx-nav">
{nav}
    </nav>
'''


def stage(inner):
    return ('  <div class="cx-frame"><div class="cx-stage"><div class="cx-vp"><div class="cx">\n'
            + inner + '\n  </div></div></div></div>')


CHEV = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        'stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>')
SEARCH = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
          'stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>')
BACK = ('<span class="cx-back"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
        ' stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/>'
        '</svg></span>')
ALERT = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12"'
         ' r="9"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".6" fill="currentColor"/></svg>')
ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"'
         ' stroke-linejoin="round"><path d="M5 5v8a3 3 0 0 0 3 3h9"/><polyline points="14 13 18 16 14 19"/></svg>')


# ── customer rail (Figma 215:3022 — 248x636, items 51 tall on a 52 pitch) ──
def rail(title, count, rows):
    """rows: list of dicts {av,bg,fg,name,meta,unread|alert,thread}"""
    out = [f'''    <div class="cx-card cx-rail">
      <div class="cx-rail__t">{title}</div>
      <div class="cx-rail__c">{count}</div>
      <div class="cx-search">{SEARCH}<span>Search customer</span></div>
      <div class="cx-hr" style="top:96px"></div>''']
    y = 104
    for r in rows:
        if r.get("thread"):
            out.append(f'      <div class="cx-tintbar" style="top:{y - 1}px;height:102px"><i></i></div>')
        weight = ' style="font-weight:500"' if r.get("thread") else ''
        out.append(f'''      <div class="cx-cu" style="top:{y}px">
        <span class="cx-cu__av" style="background:{r["bg"]};color:{r["fg"]}">{r["av"]}</span>
        <div class="cx-cu__n"{weight}>{r["name"]}</div>
        <div class="cx-cu__m">{r["meta"]}</div>''')
        if r.get("alert"):
            out.append(f'        <span class="cx-cu__alert" style="top:15px">{ALERT}</span>')
        else:
            out.append(f'        <div class="cx-cu__u">{r.get("unread", "0")}</div>')
        out.append('      </div>')
        out.append(f'      <div class="cx-hr" style="top:{y + 51}px"></div>')
        y += 52
        if r.get("thread"):
            t = r["thread"]
            out.append(f'''      <div class="cx-th" style="top:{y + 4}px">
        <span class="cx-th__ic">{ARROW}</span>
        <div class="cx-th__t">{t[0]}</div>
        <div class="cx-th__s">{t[1]}</div>
      </div>''')
            out.append(f'      <div class="cx-hr" style="top:{y + 50}px"></div>')
            y += 58
    out.append('    </div>')
    return "\n".join(out)


# ── conversation card (Figma 215:3024 — 950x636) ───────────────────────────
TOOLBAR_ICONS = [
    (8, '<path d="M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z"/>'),
    (44, '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>'),
    (80, '<path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/>'),
    (184, '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="17" x2="18" y2="17"/>'),
    (220, '<line x1="4" y1="7" x2="20" y2="7"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="5" y1="17" x2="19" y2="17"/>'),
    (256, '<line x1="9" y1="7" x2="20" y2="7"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="17" x2="20" y2="17"/>'
          '<circle cx="5" cy="7" r="1.1" fill="currentColor"/><circle cx="5" cy="12" r="1.1" fill="currentColor"/>'
          '<circle cx="5" cy="17" r="1.1" fill="currentColor"/>'),
    (308, '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
    (344, '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4 4"/>'),
    (396, '<path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/>'
          '<path d="M18.5 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>'),
]
SEPS = [122, 174, 298, 386, 438, 586]


def composer(placeholder, tag="Providing update", checked=False, tint=False):
    bits = [f'''      <div class="cx-cmp">
        <div class="cx-cmp__ph">{placeholder}</div>
        <div class="cx-cmp__bar">''']
    for x, path in TOOLBAR_ICONS:
        bits.append(f'          <span class="cx-cmp__ic" style="left:{x}px">{icon(path, 18)}</span>')
    bits.append('          <span class="cx-cmp__ic" style="left:132px"><svg viewBox="0 0 24 24">'
                '<circle cx="12" cy="12" r="7" fill="#181D27"/></svg></span>')
    for x in SEPS:
        bits.append(f'          <span class="cx-cmp__sep" style="left:{x}px"></span>')
    box = ('<span class="cx-cmp__box" style="background:#EA0029;border-color:#EA0029;display:flex;'
           'align-items:center;justify-content:center"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"'
           ' stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">'
           '<polyline points="20 6 9 17 4 12"/></svg></span>') if checked else '<span class="cx-cmp__box"></span>'
    sel_style = ' style="color:#EA0029;font-weight:500"' if tint else ''
    bits.append(f'          <span class="cx-cmp__chk" style="left:448px">{box}Mark as external</span>')
    bits.append(f'          <span class="cx-cmp__sel" style="left:596px"{sel_style}>{tag} '
                '<svg width="11" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"'
                ' stroke-linecap="round" stroke-linejoin="round"><polyline points="5 8 12 16 19 8"/></svg></span>')
    bits.append('          <button class="cx-cmp__sub">Submit</button>')
    bits.append('        </div>\n      </div>')
    return "\n".join(bits)


def conv(title, meta, seg, msgs, notice=None, comp=None, extra=""):
    """seg: (left_label, left_on, right_label). msgs: list of (av, who, name, badge_cls, badge, date, body)."""
    l, on, r = seg
    lw = 8 + len(l) * 7.2
    rw = 8 + len(r) * 7.2
    out = [f'''    <div class="cx-card cx-conv">
      <div class="cx-cv__t">{title}</div>
      <div class="cx-cv__m">{meta}</div>

      <div class="cx-seg"><b class="{'on' if on else ''}" style="width:{lw:.0f}px">{l}</b>'''
           f'''<b class="{'' if on else 'on'}" style="width:{rw:.0f}px">{r}</b></div>
      <button class="cx-btn" style="left:539px;top:20px;width:173px">Start customer thread</button>
      <button class="cx-btn" style="left:728px;top:20px;width:80px">Resolve</button>
      <button class="cx-btn cx-btn--p" style="left:824px;top:20px;width:106px">Raise Ticket</button>

      <div class="cx-cv__rule"></div>''']
    if notice:
        out.append(f'      <div class="cx-cv__notice">{notice}</div>')
    top = 158 if notice else 130
    for av, who, name, bcls, badge, date, body in msgs:
        ini, abg, afg = av
        out.append(f'''      <span class="cx-msg__av" style="top:{top + 16}px;background:{abg};color:{afg}">{ini}</span>
      <div class="cx-msg" style="top:{top}px">
        <div class="cx-msg__h">
          <span class="cx-msg__n"><em>{who}&bull;</em> {name}</span>
          <span class="cx-bdg cx-bdg--{bcls}">{badge}</span>
          <span class="cx-msg__d">{date}</span>
        </div>
        <div class="cx-msg__b">{body}</div>
        <div class="cx-msg__r">Reply</div>
      </div>''')
        top += 117
    if comp:
        out.append(comp)
    if extra:
        out.append(extra)
    out.append('    </div>')
    return "\n".join(out)


# ── thread content shared by screens 04 and 05 ─────────────────────────────
OMEGA_RAIL = rail("Customers", "12 active", [
    dict(av="OE", bg="#DBEAFE", fg="#1849A9", name="Omega Electronics", meta="Selected customer",
         alert=True, thread=("Omega delivery failure", "Delivery &middot; 1 open")),
    dict(av="AS", bg="#D1FADF", fg="#027A48", name="ArcLight Systems", meta="Compliance &middot; 1 open", unread="1"),
    dict(av="NE", bg="#FEF0C7", fg="#B54708", name="Northstar Energy", meta="No open thread"),
    dict(av="VC", bg="#E9D7FE", fg="#6941C6", name="Vertex Components", meta="No open thread"),
    dict(av="ML", bg="#CCFBF1", fg="#0E7490", name="Meridian Labs", meta="No open thread"),
    dict(av="HD", bg="#FCE7EC", fg="#B42318", name="Halcyon Devices", meta="No open thread"),
])

# One thread, one customer — screens 03, 04 and 05 all show this exact set so
# "the same 3 messages are visible above" holds. Bodies are kept under ~95
# characters so each fits the single 695px line of a 97px Figma card.
PM = ("PM", "#DBEAFE", "#1849A9")
BA = ("BA", "#E9D7FE", "#6941C6")
OMEGA_MSGS = [
    (PM, "PM", "Engineering", "u", "Update", "24 Mar",
     "Root cause: portal access token expired mid-download. Token rotation queued."),
    (PM, "PM", "Engineering", "d", "Decision Request", "24 Mar",
     "Fresh delivery package rebuilt. ETA for re-delivery is 2 hours."),
    (BA, "BA", "Internal Note", "c", "Concern", "24 Mar",
     "Customer escalation risk: 6 days in Delivery, 2 SLA breaches."),
]


# ════════════════════════════════════════════════════════════════════════════
def screen01():
    """Entry point — Omega's delivery page, where the failure actually happens.
    Figma 485:1855 supplies the visual language (page title on the grey page,
    1218x132 summary strip at y130, 816 + 378 card pair at y282); the content
    is the case study's delivery-failure story, not the file's contract review."""
    h = 768 - 282 - 20
    items = [
        ("TSMC 3nm Standard Cell Library", "Logic &middot; 14 views", "v4.2", "1.8 GB", "g", "Delivered"),
        ("Verification Collateral Pack", "Signoff &middot; 6 views", "v4.2", "640 MB", "g", "Delivered"),
        ("Deployment Documentation", "Docs &middot; 3 views", "v4.2", "82 MB", "g", "Delivered"),
        ("Timing Signoff Models", "Signoff &middot; 0 views", "v4.2", "1.2 GB", "r", "Failed"),
        ("Reference Flow Scripts", "Flows &middot; 0 views", "v4.2", "210 MB", "n", "Queued"),
    ]
    rows = "\n".join(f'''          <div class="r">
            <span class="nm" style="left:20px">{n}</span>
            <span class="sub" style="left:20px">{sub}</span>
            <span style="left:470px">{v}</span>
            <span style="left:560px">{sz}</span>
            <span class="cx-pill cx-pill--{pc}" style="left:660px">{pt}</span>
          </div>''' for n, sub, v, sz, pc, pt in items)

    body = shell("IP Catalog") + f'''
    <div class="cx-ttl2">
      {BACK}
      <span class="t">Back to Customer Queue / <b>Omega Electronics</b></span>
      <span class="cx-obadge">Delivery</span>
    </div>
    <button class="cx-btn cx-btn--p" style="left:1174px;top:70px;width:162px;height:40px">Communication</button>

    <div class="cx-sum">
      <div class="cx-sumc" style="left:20px;top:72px"><b>David Clark</b><span>BO Contact</span></div>
      <div class="cx-sumc" style="left:150px;top:72px"><b>v3.0&nbsp;&nbsp;|&nbsp;&nbsp;BOM-2026-OE-0482</b><span>Delivery Package Created 22 Mar 2026</span></div>
      <div class="cx-sumc" style="left:435px;top:72px"><b>ENT-2026-OE-77&nbsp;&nbsp;|&nbsp;&nbsp;Expires 18 Feb 2028</b><span>Entitlement</span></div>
      <div class="cx-sumc" style="left:720px;top:20px"><b>2200 Mission College Blvd,<br>Santa Clara, CA 95054<br>United States &bull; +1 408 555 0142</b><span>Location</span></div>
      <div class="cx-hist">History</div>
      <button class="cx-btn" style="left:1058px;top:60px;width:140px;height:40px">Preview BOM</button>
    </div>

    <div class="cx-dcard" style="top:282px;height:{h}px">
      <div class="cx-dcard__h">
        <span class="t">Delivery Package &middot; BOM-2026-OE-0482</span>
        <span class="a"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>Expand</span>
      </div>
      <div class="cx-dtbl">
        <div class="cx-dtbl__h">
          <span style="left:20px">IP Product</span>
          <span style="left:470px">Version</span>
          <span style="left:560px">Size</span>
          <span style="left:660px">Transfer</span>
        </div>
{rows}
      </div>
    </div>

    <div class="cx-rcard" style="top:282px;height:{h}px">
      <div class="cx-rcard__h">Delivery Status</div>
      <div class="cx-rcard__b">
        <div style="font-size:14px;line-height:18px;color:var(--x-ink2)">Package transfer to the customer portal did not complete.</div>
        <div class="cx-note cx-note--a" style="margin-top:18px">
          <div class="t">Transfer failed</div>
          <div class="b">Portal access token expired mid-download at 09:42. 1 of 5 artefacts did not transfer.</div>
        </div>
        <div class="cx-note cx-note--g" style="margin-top:18px">
          <div class="t">Current status</div>
          <div class="b">6 days in Delivery. 2 SLA breaches recorded. Nothing customer-facing has been sent yet.</div>
        </div>
        <div style="font-size:14px;line-height:18px;color:var(--x-ink2);margin-top:18px">Retrying alone will not tell the customer anything. Open a thread.</div>
      </div>
      <div class="cx-rcard__f"><button class="p">Retry delivery</button><button>Escalate</button></div>
    </div>
'''
    return stage(body)


def screen02():
    metrics = [(168, "4", "Total threads", True), (365, "2", "Open", False),
               (600, "0", "Unread", False), (791, "1", "High priority", True)]
    m = "\n".join(
        f'    <div class="cx-m{" alert" if a and x != 168 else ""}" style="left:{x}px">'
        f'<b>{n}</b><span>{lbl}</span></div>'
        for x, n, lbl, a in metrics)
    tabs = [("All threads", "4", True), ("Onboarding / NDA", "0", False), ("BOM / Contract", "1", False),
            ("Compliance", "2", False), ("Delivery &amp; IP", "1", False)]
    t = "\n".join(f'      <span class="cx-tab{" on" if on else ""}"><u>{c}</u> {lbl}</span>'
                  for lbl, c, on in tabs)
    rows = [
        ("#EA0029", "Omega delivery failure, token rotation", "Omega Electronics &nbsp;&middot;&nbsp; Delivery &nbsp;&middot;&nbsp; 24 Mar",
         "w", "Reopened", [("BO", "#3538CD"), ("PM", "#0E7490"), ("LT", "#B42318")]),
        ("#2E90FA", "ArcLight export control review", "ArcLight Systems &nbsp;&middot;&nbsp; Compliance &nbsp;&middot;&nbsp; 24 Mar",
         "w", "Reopened", [("BO", "#3538CD"), ("BD", "#475467"), ("LT", "#B42318")]),
        ("#12B76A", "Northstar NDA expiry, renewal", "Northstar Energy &nbsp;&middot;&nbsp; Compliance &nbsp;&middot;&nbsp; 23 Mar",
         "g", "Resolved", [("BO", "#3538CD"), ("LT", "#6941C6")]),
        ("#12B76A", "Synapse NDA territorial redlines", "Synapse Technologies &nbsp;&middot;&nbsp; Contract &nbsp;&middot;&nbsp; 22 Mar",
         "g", "Resolved", [("BO", "#3538CD"), ("LT", "#B42318")]),
    ]
    r = []
    for dot, name, meta, pill, pill_txt, people in rows:
        av = "".join(f'<span style="background:{c}">{i}</span>' for i, c in people)
        w = 28 + (len(people) - 1) * 20
        r.append(f'''      <div class="cx-tr">
        <span class="dot" style="left:24px;background:{dot}"></span>
        <span class="nm" style="left:44px;top:20px">{name}</span>
        <span class="mut" style="left:44px;top:40px;font-size:12px;line-height:18px">{meta}</span>
        <span class="cx-pill cx-pill--{pill}" style="left:1000px">&bull; {pill_txt}</span>
        <span class="cx-stack" style="left:{1336 - 118 - 24 - w}px">{av}</span>
      </div>''')
    body = shell("Conversation") + f'''
    <div class="cx-h1">Communication Center</div>

    <div class="cx-mstrip"><i></i></div>
{m}
    <div class="cx-mrule"><i></i></div>

    <div class="cx-inp" style="left:118px;top:218px;width:697px">{SEARCH}<span>Search threads, customers or tickets&hellip;</span></div>
    <div class="cx-sel" style="left:834px;top:218px;width:160px">All stages{CHEV}</div>
    <div class="cx-sel" style="left:1010px;top:218px;width:146px">All status{CHEV}</div>
    <div class="cx-sel" style="left:1172px;top:218px;width:164px">Most recent{CHEV}</div>

    <div class="cx-tabs">
{t}
      <span class="cx-tabs__c">04 threads</span>
    </div>

    <div class="cx-tbl">
      <div class="cx-tbl__h">
        <span style="left:24px">Thread</span>
        <span style="left:1000px">Status</span>
        <span style="left:1120px">Participants</span>
      </div>
{chr(10).join(r)}
    </div>
'''
    return stage(body)


def screen03():
    body = shell("Conversation") + f'''
    <div class="cx-ttl">
      {BACK}
      <span class="cx-ttl__t">Communication Center</span>
    </div>

{OMEGA_RAIL}

{conv("Omega delivery failure, token rotation",
      "Reopened 24 Mar &bull; Ticket BO-482 &bull; 4 messages",
      ("External 0", True, "Full 4"), OMEGA_MSGS,
      notice="No messages are marked external yet. Showing the internal thread for audit continuity.",
      comp=composer("Factual update on the topic - state current status or progress."))}
'''
    return stage(body)


def screen04():
    picker = '''      <div class="cx-tag" style="left:600px;top:241px;width:280px">
        <div class="cx-tag__h">Tag this message</div>
        <div class="cx-tag__i on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Providing Update</div>
        <div class="cx-tag__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".7" fill="currentColor"/></svg>Flagging Concern</div>
        <div class="cx-tag__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>Requesting Decision</div>
        <div class="cx-tag__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Approving / Accepting</div>
        <div class="cx-tag__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>Escalating</div>
      </div>'''
    body = shell("Conversation") + f'''
    <div class="cx-ttl">
      {BACK}
      <span class="cx-ttl__t">Communication Center</span>
    </div>

{OMEGA_RAIL}

{conv("Omega delivery failure, token rotation",
      "Reopened 24 Mar &bull; Ticket BO-482 &bull; 4 messages",
      ("External 1", True, "Full 4"), OMEGA_MSGS,
      notice="1 message is marked external. The customer sees only what is tagged for them.",
      comp=composer("Factual update on the topic - state current status or progress.",
                    checked=True, tint=True),
      extra=picker)}
'''
    return stage(body)


def screen05():
    drawer = '''    <div class="cx-scrim"></div>
    <div class="cx-drawer">
      <div class="cx-drawer__h">
        <span class="t">Start Customer Thread</span>
        <span class="x"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span>
      </div>
      <div class="cx-drawer__b">
        <div class="cx-fl">Subject</div>
        <div class="cx-fi">Omega delivery failure, token rotation</div>

        <div class="cx-vis" style="margin-top:18px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".7" fill="currentColor"/></svg>
          <span><b style="font-weight:500">Visibility:</b> thread goes to Omega Electronics. Internal members can still view.</span>
        </div>

        <div class="cx-fl" style="margin-top:18px">Include external messages</div>
        <div class="cx-pick on"><span class="cx-pick__box"></span><span style="min-width:0"><span class="cx-pick__t">PM <em>&bull; Update &bull; 24 Mar</em></span><span class="cx-pick__s">Root cause: portal access token expired mid-download.</span></span></div>
        <div class="cx-pick on"><span class="cx-pick__box"></span><span style="min-width:0"><span class="cx-pick__t">PM <em>&bull; Decision Request &bull; 24 Mar</em></span><span class="cx-pick__s">Fresh delivery package rebuilt. ETA for re-delivery is 2 hours.</span></span></div>
        <div class="cx-pick"><span class="cx-pick__box"></span><span style="min-width:0"><span class="cx-pick__t">PM <em>&bull; Update &bull; 23 Mar</em></span><span class="cx-pick__s">Initial delivery package shared. Awaiting customer pickup.</span></span></div>

        <div class="cx-fl" style="margin-top:18px">Message to customer (editable)</div>
        <div class="cx-ta" style="height:84px;color:#181D27">Root cause: portal access token expired mid-download. Token rotation queued. Fresh delivery package rebuilt. ETA for re-delivery is 2 hours.</div>
      </div>
      <div class="cx-drawer__f"><button>Start Customer Thread</button></div>
    </div>'''
    body = shell("Conversation") + f'''
    <div class="cx-ttl">
      {BACK}
      <span class="cx-ttl__t">Communication Center</span>
    </div>

{OMEGA_RAIL}

{conv("Omega delivery failure, token rotation",
      "Reopened 24 Mar &bull; Ticket BO-482 &bull; 4 messages",
      ("External 1", True, "Full 4"), OMEGA_MSGS,
      notice="1 message is marked external. The customer sees only what is tagged for them.",
      comp=composer("Reply to thread - this composer stays open while the panel is up."))}

{drawer}
'''
    return stage(body)


SCREENS = {"01": screen01, "02": screen02, "03": screen03, "04": screen04, "05": screen05}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="splice into the case-study HTML")
    args = ap.parse_args()

    if not args.write:
        for k, fn in SCREENS.items():
            print(f"===== screen {k} =====")
            print(fn())
        return

    html = HTML.read_text(encoding="utf-8")
    for k, fn in SCREENS.items():
        pat = re.compile(rf"(<!--CX:screen{k}-->).*?(<!--/CX:screen{k}-->)", re.S)
        if not pat.search(html):
            raise SystemExit(f"marker CX:screen{k} not found in {HTML}")
        html = pat.sub(lambda m: m.group(1) + "\n" + fn() + "\n" + m.group(2), html)
    HTML.write_text(html, encoding="utf-8")
    print(f"wrote {', '.join(SCREENS)} into {HTML}")


if __name__ == "__main__":
    main()
