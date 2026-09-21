import io
import unittest
class Wallet:
    def __init__(self):
        self.balance = 0
    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("المبلغ لازم يكون موجب")
        self.balance += amount
class TestWallet(unittest.TestCase):
    def setUp(self):
        self.w = Wallet()
    def test_starts_empty(self):
        self.assertEqual(self.w.balance, 0)
    def test_deposit(self):
        self.w.deposit(50)
        self.assertEqual(self.w.balance, 50)
    def test_negative(self):
        with self.assertRaises(ValueError):
            self.w.deposit(-5)
suite = unittest.TestLoader().loadTestsFromTestCase(TestWallet)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print(result.testsRun, len(result.failures), len(result.errors))
print(result.wasSuccessful())
