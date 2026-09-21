data = [((0, 0), 0), ((0, 1), 0), ((1, 0), 0), ((1, 1), 1)]
w1, w2, bias = 0.0, 0.0, 0.0
lr = 0.1
def neuron(x1, x2):
    total = x1 * w1 + x2 * w2 + bias
    return 1 if total > 0 else 0
for epoch in range(10):
    errors = 0
    for (x1, x2), target in data:
        error = target - neuron(x1, x2)
        if error:
            errors += 1
            w1 += lr * error * x1
            w2 += lr * error * x2
            bias += lr * error
    if errors == 0:
        print(f"اتعلّمت في الجولة {epoch + 1}")
        break
print([neuron(x1, x2) for (x1, x2), _ in data])
print(f"w1={w1:.1f} w2={w2:.1f} bias={bias:.1f}")
