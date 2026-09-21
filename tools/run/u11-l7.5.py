def invoice_ids(prefix):
    n = 1
    while True:
        yield f"{prefix}-{n:04d}"
        n += 1
gen = invoice_ids("INV")
print(next(gen), next(gen))
for _, invoice in zip(range(3), gen):
    print(invoice)
