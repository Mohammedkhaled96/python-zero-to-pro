SIGNATURES = {
    b"\x89PNG": "PNG",
    b"%PDF": "PDF",
    b"PK\x03\x04": "ZIP/DOCX/XLSX",
    b"\xff\xd8\xff": "JPEG",
}
for name, content in [("a.bin", b"%PDF-1.7 ..."), ("b.bin", b"PK\x03\x04..."), ("c.bin", b"hello")]:
    with open(name, "wb") as f:
        f.write(content)
for name in ["a.bin", "b.bin", "c.bin", "fake.png"]:
    with open(name, "rb") as f:
        head = f.read(8)
    kind = next((t for sig, t in SIGNATURES.items() if head.startswith(sig)), "غير معروف")
    print(name, "→", kind)
