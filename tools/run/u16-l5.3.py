import io
import unittest
def is_even(n):
    return n % 2 == 0
class TestEven(unittest.TestCase):
    def test_many(self):
        cases = [(2, True), (7, False), (0, True), (-4, True), (9, True)]
        for number, expected in cases:
            with self.subTest(number=number):
                self.assertEqual(is_even(number), expected)
    @unittest.skip("مثال على التخطّي")
    def test_later(self):
        pass
suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestEven)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print("عدد الاختبارات:", suite.countTestCases())
print("فشل:", len(result.failures))
print("اتخطّى:", len(result.skipped))
print(result.failures[0][1].splitlines()[-1])
