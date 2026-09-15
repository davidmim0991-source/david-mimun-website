from html.parser import HTMLParser
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.html_attrs = {}
        self._title = False
        self.title = ""

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "html":
            self.html_attrs = attributes
        if "id" in attributes:
            self.ids.add(attributes["id"])
        if tag == "link":
            self.links.append(attributes)
        if tag == "title":
            self._title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._title = False

    def handle_data(self, data):
        if self._title:
            self.title += data


class HomepageRedesignTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.homepage = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.parser = SiteParser()
        cls.parser.feed(cls.homepage)

    def test_homepage_is_hebrew_rtl_and_uses_external_stylesheet(self):
        self.assertEqual(self.parser.html_attrs.get("lang"), "he")
        self.assertEqual(self.parser.html_attrs.get("dir"), "rtl")
        self.assertTrue(
            any(link.get("href") == "site.css" for link in self.parser.links),
            "index.html must load the redesigned site.css",
        )
        self.assertNotIn("<style>", self.homepage)

    def test_voice_ai_is_primary_positioning(self):
        self.assertRegex(self.parser.title, r"(טלפ|קולי|Voice)")
        first_heading = re.search(r"<h1[^>]*>(.*?)</h1>", self.homepage, re.DOTALL)
        self.assertIsNotNone(first_heading)
        heading_text = re.sub(r"<[^>]+>", "", first_heading.group(1))
        self.assertRegex(heading_text, r"(מדבר|שיחה|טלפ|קול)")

    def test_new_information_architecture_is_present(self):
        required_ids = {
            "channels",
            "benefits",
            "how",
            "demo",
            "faq",
            "contact",
        }
        self.assertTrue(required_ids.issubset(self.parser.ids))
        self.assertIn("waDemo", self.parser.ids)
        self.assertIn("wa-demo.js", self.homepage)

    def test_unverified_metrics_and_ecommerce_positioning_are_removed(self):
        visible_copy = re.sub(r"<script.*?</script>", "", self.homepage, flags=re.DOTALL)
        self.assertNotIn("24/7", visible_copy)
        self.assertNotRegex(visible_copy, r"איקומרס|חנות אונליין")

    def test_live_demo_is_disclosed_as_text_not_voice_demo(self):
        self.assertIn("הדגמת צ׳אט", self.homepage)
        self.assertRegex(self.homepage, r"אינה הדגמה (קולית|טלפונית)")

    def test_booking_ctas_require_an_explicit_chat_submission(self):
        self.assertGreaterEqual(self.homepage.count("לתיאום דרך הצ׳אט"), 2)
        booking_handler = self.homepage.split("window.bookViaBot=function(){", 1)[1]
        booking_handler = booking_handler.split("\n  };\n})();", 1)[0]
        self.assertNotIn("send(", booking_handler)

    def test_live_demo_stays_inline_on_the_page(self):
        self.assertIn('id="demoForm"', self.homepage)
        self.assertIn('id="demoInput"', self.homepage)
        self.assertNotIn("<dialog", self.homepage)
        self.assertNotIn("showModal", self.homepage)
        self.assertNotIn("openLiveDemo", self.homepage)
        self.assertNotIn("wa-page-demo", self.homepage)
        self.assertNotIn("מסך מלא", self.homepage)

    def test_markup_uses_valid_document_and_figure_semantics(self):
        self.assertTrue(self.homepage.startswith("<!DOCTYPE html>"))
        self.assertIn('<figure class="wa-demo"', self.homepage)
        self.assertIn("<figcaption", self.homepage)
        self.assertNotRegex(self.homepage, r"<div[^>]+aria-label=")


class SharedThemeAndLegalTests(unittest.TestCase):
    def test_light_theme_tokens_are_defined(self):
        css = (ROOT / "site.css").read_text(encoding="utf-8")
        self.assertIn("color-scheme:light", css.replace(" ", ""))
        self.assertIn("--bg:", css)
        self.assertIn("text-wrap:balance", css.replace(" ", ""))
        self.assertIn("@media(prefers-reduced-motion:reduce)", css.replace(" ", ""))

    def test_legal_pages_use_broad_current_positioning(self):
        combined = "\n".join(
            (ROOT / filename).read_text(encoding="utf-8")
            for filename in ("privacy.html", "terms.html")
        )
        self.assertRegex(combined, r"טלפונ")
        self.assertNotRegex(combined, r"חנויות אונליין|עסקי איקומרס")

    def test_legal_pages_use_standard_doctype(self):
        for filename in ("privacy.html", "terms.html", "accessibility.html"):
            with self.subTest(filename=filename):
                content = (ROOT / filename).read_text(encoding="utf-8")
                self.assertTrue(content.startswith("<!DOCTYPE html>"))


if __name__ == "__main__":
    unittest.main()
