import io
import random
import unittest
from unittest.mock import patch
def roll_dice():
    return random.randint(1, 6)
class TestDice(unittest.TestCase):
    @patch("random.randint", return_value=6)
    def test_six(self, fake):
        self.assertEqual(roll_dice(), 6)
        fake.assert_called_once_with(1, 6)
loader = unittest.defaultTestLoader
result = unittest.TextTestRunner(stream=io.StringIO()).run(loader.loadTestsFromTestCase(TestDice))
print(result.wasSuccessful())
