"""يتأكّد من كل تحدّي: الحل النموذجي بينجح في كل الاختبارات، وكود البداية ما بينجحش."""
import builtins, json, os, sys, glob, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
CH = os.path.join(HERE, "run", "ch")
prefix = sys.argv[1] if len(sys.argv) > 1 else ""

g = {"__builtins__": builtins, "__name__": "harness"}
exec(open(os.path.join(HERE, "engine", "harness.py"), encoding="utf-8").read(), g)
test = g["__course_test"]

work = tempfile.mkdtemp(prefix="chk-")
os.chdir(work)
ids = sorted({os.path.basename(p).split(".")[0] for p in glob.glob(os.path.join(CH, "*.tests.py"))})
bad = 0
for cid in ids:
    if not cid.startswith(prefix):
        continue
    read = lambda kind: open(os.path.join(CH, f"{cid}.{kind}.py"), encoding="utf-8").read()
    try:
        tests, starter, solution = read("tests"), read("starter"), read("solution")
    except FileNotFoundError as e:
        print(f"✗ {cid}: ملف ناقص {e.filename}")
        bad += 1
        continue
    rs = json.loads(test(solution, tests))
    rst = json.loads(test(starter, tests))
    sol_ok = rs["crash"] is None and rs["tests"] and all(t[1] for t in rs["tests"])
    st_ok = rst["crash"] is not None or not all(t[1] for t in rst["tests"])
    n = len(rs["tests"])
    if sol_ok and st_ok:
        passed_st = sum(t[1] for t in rst["tests"]) if rst["tests"] else 0
        print(f"✓ {cid}: {n} اختبار — الحل ينجح، والبداية {'تقع' if rst['crash'] else f'بتنجح في {passed_st}/{n} بس'}")
    else:
        bad += 1
        print(f"✗ {cid}: solution_ok={sol_ok} starter_fails={st_ok}")
        if not sol_ok:
            print("   crash:", (rs["crash"] or "")[-400:])
            for t in rs["tests"]:
                if not t[1]:
                    print("   fail:", t[0], "→", t[2])
print(f"\n{len(ids) - bad if not prefix else ''} OK, {bad} مشاكل")
sys.exit(1 if bad else 0)
