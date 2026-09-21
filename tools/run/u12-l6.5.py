from pathlib import Path
def copy_file(src, dst, chunk_size=4096):
    total = 0
    with open(src, "rb") as fin, open(dst, "wb") as fout:
        while chunk := fin.read(chunk_size):
            fout.write(chunk)
            total += len(chunk)
    return total
with open("big.bin", "wb") as f:
    f.write(bytes(range(256)) * 1000)
print(copy_file("big.bin", "big_copy.bin"), "bytes")
print(Path("big.bin").read_bytes() == Path("big_copy.bin").read_bytes())
