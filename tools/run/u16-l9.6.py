import logging
import sys
logging.basicConfig(level=logging.WARNING, format="%(levelname)s: %(message)s", stream=sys.stdout, force=True)
log = logging.getLogger("shop")
log.debug("تفاصيل داخلية")
log.info("طلب جديد")
log.warning("المخزون قرب يخلص")
log.error("فشل الدفع")
log.setLevel(logging.DEBUG)
log.debug("دلوقتي التفاصيل ظاهرة")
