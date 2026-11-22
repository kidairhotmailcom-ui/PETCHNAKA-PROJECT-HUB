from html.parser import HTMLParser
from pathlib import Path
import re
import sys

HTML = Path("index.html").read_text(encoding="utf-8")

class PageAudit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.hrefs = []
        self.titles = 0
        self.h1 = 0
        self.in_title = False
        self.title_text = []
        self.in_h1 = False
        self.h1_text = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a" and "href" in attrs:
            self.hrefs.append(attrs["href"])
        if tag == "title":
            self.titles += 1
            self.in_title = True
        if tag == "h1":
            self.h1 += 1
            self.in_h1 = True
    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "h1":
            self.in_h1 = False
    def handle_data(self, data):
        if self.in_title:
            self.title_text.append(data)
        if self.in_h1:
            self.h1_text.append(data)

audit = PageAudit()
audit.feed(HTML)
audit.close()

def fail(message):
    print("FAIL:", message)
    sys.exit(1)

duplicates = sorted({item for item in audit.ids if audit.ids.count(item) > 1})
if duplicates:
    fail("duplicate id(s): " + ", ".join(duplicates))
if audit.titles != 1 or not "".join(audit.title_text).strip():
    fail("page must contain exactly one non-empty title")
if audit.h1 != 1 or not "".join(audit.h1_text).strip():
    fail("page must contain exactly one non-empty h1")

known_ids = set(audit.ids)
broken_anchors = [href for href in audit.hrefs if href.startswith("#") and href[1:] not in known_ids]
if broken_anchors:
    fail("broken internal anchor(s): " + ", ".join(broken_anchors))

required_ids = {"auto-shop-pro", "safe-elec", "auto-iot-pro", "jarvis-core"}
if not required_ids.issubset(known_ids):
    fail("missing project card id(s): " + ", ".join(sorted(required_ids - known_ids)))

expected_link = "https://kidairhotmailcom-ui.github.io/AUTO-SHOP-PRO/"
external = [href for href in audit.hrefs if re.match(r"^https?://", href)]
if external != [expected_link]:
    fail("only the single approved AUTO SHOP PRO link may be external; found: " + repr(external))

lower = HTML.lower()
for forbidden in ("line.me", "lin.ee", "facebook.com", "mailto:", "tel:"):
    if forbidden in lower:
        fail("forbidden contact channel found: " + forbidden)

if "petch naka" not in lower and "petchna" not in lower:
    fail("company/project identity missing")
print("PASS: HTML structure, unique IDs, internal anchors, project cards, and contact-link policy")
